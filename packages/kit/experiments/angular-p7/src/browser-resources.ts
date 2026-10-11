import {
  loadSkillWithDetails, createIndexedDBSkillStorage, createMessageEngine, createNativeMessageAdapter,
  skillPlugin, toolPlugin, type SkillDefinition,
} from '@opentiny/tiny-robot-kit/core';
import { completion } from './providers';

function verify(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const entryText = '---\nname: native-files\ndescription: Native File validation\n---\n# Native instructions';
const entry = () => new File([entryText], 'SKILL.md', { type: 'text/markdown' });
const caught = async (operation: () => PromiseLike<unknown>) => {
  try { await operation(); return ''; } catch (error) { return String(error); }
};

async function removeDB(name: string) {
  let blocked = 0;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`DB deletion timed out: ${name}`)), 2000);
    const request = indexedDB.deleteDatabase(name);
    request.onblocked = () => { blocked += 1; };
    request.onerror = () => { clearTimeout(timeout); reject(request.error); };
    request.onsuccess = () => { clearTimeout(timeout); resolve(); };
  });
  return blocked;
}

async function runResourceTurn(skill: SkillDefinition, path: string) {
  const engine = createMessageEngine(createNativeMessageAdapter(), {
    responseProvider: async (body) => body.messages.some((message) => message.role === 'tool')
      ? completion('resource checked') : completion('', 'read_skill_file', JSON.stringify({ skillName: skill.name, path })),
    plugins: [skillPlugin({ selection: { mode: 'manual', skills: [skill] } }), toolPlugin({ getTools: () => [], callTool: () => { throw new Error('Unexpected fallback'); } })],
  });
  try {
    await engine.sendMessage('resource');
    const message = engine.getState().messages.find((item) => item.role === 'tool');
    const assistant = engine.getState().messages.find((item) => item.tool_calls?.length);
    const toolStatus = (assistant?.state?.['toolCall'] as Record<string, { status?: string }> | undefined)?.['p7-call']?.status;
    return { content: String(message?.content ?? ''), toolStatus };
  } finally { await engine.abort(); }
}

export async function validateNativeResources() {
  const files = [entry(), new File(['first'], 'guide.md'), new File(['duplicate'], 'guide.md'), new File([new Uint8Array([1, 2, 255])], 'icon.png', { type: 'image/png' })];
  const loaded = await loadSkillWithDetails({ source: 'browser', fileList: files });
  verify(loaded.warnings.some((warning) => warning.code === 'duplicate-path'), 'File duplicate warning missing');
  const strictError = await caught(() => loadSkillWithDetails({ source: 'browser', fileList: files, strict: true }));
  verify(strictError.includes('Duplicate'), `Strict File load did not reject: ${strictError}`);
  const databaseName = `p7-native-${crypto.randomUUID()}`;
  const storage = createIndexedDBSkillStorage({ databaseName });
  let binaryError = ''; let readerError = ''; let resourceCancel = '';
  try {
    await storage.add(loaded.skill);
    const restored = await storage.get(loaded.skill.name);
    const binary = await restored?.resources?.find((resource) => resource.kind === 'binary')?.readBinary?.();
    verify(binary?.join(',') === '1,2,255', 'Binary persisted bytes changed');
    binaryError = (await runResourceTurn(restored!, 'icon.png')).content;
    verify(binaryError.includes('binary_file_not_readable'), `Binary text tool error missing: ${binaryError}`);
    const readerResult = await runResourceTurn({ ...loaded.skill, resources: [{ path: 'broken.md', kind: 'text', resourceId: 'broken.md', readText: async () => { throw new Error('P7 resource read failed'); } }] }, 'broken.md');
    readerError = readerResult.toolStatus ?? '';
    verify(readerError === 'failed', `Reader failure state missing: ${readerError}`);
    let release!: (value: string) => void; let started!: () => void;
    const reading = new Promise<void>((resolve) => { started = resolve; });
    const pending = new Promise<string>((resolve) => { release = resolve; });
    const skill: SkillDefinition = { name: 'pending', description: 'Pending resource', instructions: 'Read slowly', resources: [{
      path: 'slow.md', kind: 'text', resourceId: 'slow.md', readText: () => { started(); return pending; },
    }] };
    const engine = createMessageEngine(createNativeMessageAdapter(), {
      responseProvider: async () => completion('', 'read_skill_file', '{"skillName":"pending","path":"slow.md"}'),
      plugins: [skillPlugin({ selection: { mode: 'manual', skills: [skill] } }), toolPlugin({ getTools: () => [], callTool: () => { throw new Error('Unexpected fallback'); } })],
    });
    const sending = engine.sendMessage('read'); await reading;
    const aborting = engine.abort(); release('late forbidden content'); await Promise.all([sending, aborting]);
    resourceCancel = engine.getState().requestState;
    verify(resourceCancel === 'aborted', 'Resource request did not abort');
    verify(!engine.getState().messages.some((message) => String(message.content).includes('late forbidden content')), 'Late resource content leaked after cancellation');
    const slowFile = entry(); let finishFile!: (value: string) => void; let fileStarted!: () => void;
    const fileReading = new Promise<void>((resolve) => { fileStarted = resolve; });
    slowFile.text = () => new Promise<string>((resolve) => { finishFile = resolve; fileStarted(); });
    const importing = storage.import({ source: 'browser', fileList: [slowFile] });
    await fileReading; importing.cancel(); finishFile(entryText);
    const cancellation = await caught(() => importing);
    verify(cancellation.includes('SkillLoadCancelledError'), `Import cancel missing: ${cancellation}`);
    const retained = await storage.get(loaded.skill.name);
    verify(await retained?.resources?.find((resource) => resource.path === 'guide.md')?.readText?.() === 'first', 'Cancelled import replaced prior resource history');
  } finally { await storage.close(); }
  const dbBlocked = await removeDB(databaseName);

  // OPFS supplies real browser directory/file handles without a picker or mocks.
  const root = await navigator.storage.getDirectory(); const directoryName = `p7-skill-${crypto.randomUUID()}`;
  const directory = await root.getDirectoryHandle(directoryName, { create: true });
  let directorySkill = '';
  try {
    for (const [name, content] of [['SKILL.md', entryText], ['guide.md', '# Directory guide']]) {
      const file = await directory.getFileHandle(name, { create: true }); const writer = await file.createWritable();
      await writer.write(content); await writer.close();
    }
    const directoryResult = await loadSkillWithDetails({ source: 'browser', directoryHandle: directory, strict: true });
    directorySkill = directoryResult.skill.name;
    verify(directoryResult.warnings.length === 0, 'Strict native directory load produced warnings');
    verify(await directoryResult.skill.resources?.[0]?.readText?.() === '# Directory guide', 'Directory resource changed');
  } finally { await root.removeEntry(directoryName, { recursive: true }); }
  return { fileWarnings: loaded.warnings.map((warning) => warning.code), strictError, directorySkill,
    directorySource: 'native OPFS FileSystemDirectoryHandle', binaryError, readerError, resourceCancel, dbBlocked };
}

export async function validateControlledGitHub() {
  const loaded = await loadSkillWithDetails({ source: 'github', repo: 'acme/p7', ref: 'fixture', path: 'skill' });
  verify(loaded.skill.name === 'controlled-remote', 'Controlled GitHub fixture name changed');
  return { source: 'controlled GitHub HTTP fixture', name: loaded.skill.name, warnings: loaded.warnings };
}

export async function validateLiveGitHub(repo: string, ref: string, path: string) {
  if (!repo || !ref || !path) throw new Error('Live GitHub requires explicit repo, ref and path');
  const job = loadSkillWithDetails({ source: 'github', repo, ref, path });
  const timeout = setTimeout(() => job.cancel(), 15000);
  try {
    const loaded = await job;
    return { source: 'live GitHub network', repo, ref, path, name: loaded.skill.name,
      instructionsLength: loaded.skill.instructions.length, resources: loaded.skill.resources?.length ?? 0, warnings: loaded.warnings };
  } finally { clearTimeout(timeout); }
}
