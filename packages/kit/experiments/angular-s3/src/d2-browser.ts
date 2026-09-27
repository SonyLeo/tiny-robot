import {
  createIndexedDBSkillStorage, loadSkill, loadSkillWithDetails,
} from '@opentiny/tiny-robot-kit/core';

declare global {
  interface Window { __d2Result?: Promise<Record<string, unknown>> }
}

window.__d2Result = (async () => {
  const entry = new File(['---\nname: browser-docs\ndescription: Browser docs\n---\n# Browser instructions'], 'SKILL.md');
  const guide = new File(['# Native browser guide'], 'guide.md');
  const loaded = await loadSkillWithDetails({ source: 'browser', fileList: [entry, guide] });
  if (loaded.skill.name !== 'browser-docs' || await loaded.skill.resources?.[0].readText?.() !== '# Native browser guide') {
    throw new Error('Browser file loading or resource reading failed');
  }

  const databaseName = `d2-browser-${crypto.randomUUID()}`;
  const storage = createIndexedDBSkillStorage({ databaseName });
  const imported = await storage.import({ source: 'browser', fileList: [entry, guide] });
  const restored = await storage.get(imported.name);
  if (restored?.name !== 'browser-docs' || await restored.resources?.[0].readText?.() !== '# Native browser guide') {
    throw new Error('Native IndexedDB import or resource restoration failed');
  }
  await storage.delete(imported.name);
  indexedDB.deleteDatabase(databaseName);

  const remote = await loadSkill({ source: 'github', repo: 'acme/skills', path: 'demo' });
  if (remote.name !== 'remote' || await remote.resources?.[0].readText?.() !== '# Remote guide') {
    throw new Error('Browser GitHub loading failed');
  }

  let release!: () => void;
  const waiting = new Promise<string>((resolve) => { release = () => resolve('# Cancelled'); });
  const pendingFile = new File(['# Placeholder'], 'SKILL.md');
  pendingFile.text = () => waiting;
  const job = loadSkill({ source: 'browser', fileList: [pendingFile] });
  job.cancel();
  release();
  let cancellation = '';
  try { await job; } catch (error) { cancellation = (error as Error).name; }
  if (cancellation !== 'SkillLoadCancelledError') throw new Error(`Cancellation failed: ${cancellation}`);

  return { browserFile: loaded.skill.name, indexedDB: imported.name, github: remote.name, cancellation };
})();
