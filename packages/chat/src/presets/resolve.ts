import { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from '../adapters/config'
import type { ChatConfig } from '../adapters/types'
import type {
  AgentPresetConsumptionResult,
  AgentPresetInput,
  AgentPresetResolutionResult,
  AgentPresetRuntimeInput,
  AgentPresetUiInput,
  ApplyAgentPresetOptions,
  CreatePresetConsumptionFromAgentPresetOptions,
  CreateChatAdapterFromAgentPresetOptions,
  ResolveAgentPresetOptions,
  ResolvedAgentPreset,
  SkillPackInput,
} from './types'

type ChatPromptList = NonNullable<NonNullable<ChatConfig['ui']>['prompts']>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function cloneUi(ui: AgentPresetUiInput | undefined): AgentPresetUiInput | undefined {
  if (!ui) {
    return undefined
  }

  return {
    ...ui,
    ...(ui.brand ? { brand: { ...ui.brand } } : {}),
    ...(ui.welcome ? { welcome: { ...ui.welcome } } : {}),
    ...(ui.prompts ? { prompts: [...ui.prompts] } : {}),
  }
}

function cloneRuntime(runtime: AgentPresetRuntimeInput | undefined): AgentPresetRuntimeInput | undefined {
  if (!runtime) {
    return undefined
  }

  return {
    ...runtime,
  }
}

function mergePrompts(
  target: AgentPresetUiInput | ChatConfig['ui'] | undefined,
  patch: AgentPresetUiInput,
): ChatPromptList | undefined {
  const patchPrompts = patch.prompts
  if (patchPrompts === undefined) {
    return target?.prompts
  }

  if (patch.promptMode === 'append') {
    return [...(target?.prompts ?? []), ...patchPrompts]
  }

  return [...patchPrompts]
}

function mergeObjectValues(
  target: Record<string, unknown> | undefined,
  patch: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!patch) {
    return target
  }

  const next = {
    ...(target ?? {}),
    ...patch,
  }

  for (const [key, value] of Object.entries(patch)) {
    if (isRecord(value) && isRecord(target?.[key])) {
      next[key] = {
        ...(target?.[key] as Record<string, unknown>),
        ...value,
      }
    }
  }

  return next
}

function mergeFeatures(
  target: ChatConfig['features'] | undefined,
  patch: ChatConfig['features'] | undefined,
): ChatConfig['features'] | undefined {
  if (!patch) {
    return target
  }

  const next = {
    ...(target ?? {}),
  } as NonNullable<ChatConfig['features']>

  for (const [featureKey, patchValue] of Object.entries(patch)) {
    const currentValue = next[featureKey as keyof typeof next]

    if (patchValue === false) {
      next[featureKey as keyof typeof next] = false as (typeof next)[keyof typeof next]
      continue
    }

    if (patchValue === true) {
      next[featureKey as keyof typeof next] = (
        isRecord(currentValue) ? currentValue : true
      ) as (typeof next)[keyof typeof next]
      continue
    }

    if (isRecord(currentValue) && isRecord(patchValue)) {
      next[featureKey as keyof typeof next] = mergeObjectValues(
        currentValue as Record<string, unknown>,
        patchValue,
      ) as (typeof next)[keyof typeof next]
      continue
    }

    next[featureKey as keyof typeof next] = patchValue as (typeof next)[keyof typeof next]
  }

  return next
}

function toChatConfigPatch(
  input: Pick<AgentPresetInput, 'defaults' | 'ui' | 'layout' | 'features' | 'mcp' | 'runtime'>,
) {
  const features = input.features ? { ...input.features } : undefined
  let runtime = cloneRuntime(input.runtime)

  if (input.mcp !== undefined) {
    const nextFeatures = features ?? {}
    nextFeatures.mcp =
      typeof input.mcp === 'boolean'
        ? input.mcp
        : {
            enabled: input.mcp.enabled,
          }

    if (typeof input.mcp === 'object' && input.mcp !== null && input.mcp.manager !== undefined) {
      ;(runtime ??= {}).mcpManager = input.mcp.manager
    }

    return {
      defaults: input.defaults ? { ...input.defaults } : undefined,
      ui: cloneUi(input.ui),
      layout: input.layout
        ? {
            ...input.layout,
            ...(input.layout.placements ? { placements: { ...input.layout.placements } } : {}),
          }
        : undefined,
      features: nextFeatures,
      runtime,
    }
  }

  return {
    defaults: input.defaults ? { ...input.defaults } : undefined,
    ui: cloneUi(input.ui),
    layout: input.layout
      ? {
          ...input.layout,
          ...(input.layout.placements ? { placements: { ...input.layout.placements } } : {}),
        }
      : undefined,
    features,
    runtime,
  }
}

function mergeUi(
  target: ChatConfig['ui'] | undefined,
  patch: AgentPresetUiInput | undefined,
): ChatConfig['ui'] | undefined {
  if (!patch) {
    return target
  }

  const nextUi: NonNullable<ChatConfig['ui']> = {
    ...(target ?? {}),
  }

  if (patch.brand !== undefined) {
    nextUi.brand = {
      ...(target?.brand ?? {}),
      ...patch.brand,
    }
  }

  if (patch.welcome !== undefined) {
    nextUi.welcome = {
      ...(target?.welcome ?? {}),
      ...patch.welcome,
    }
  }

  if (patch.prompts !== undefined) {
    nextUi.prompts = mergePrompts(target, patch)
  }

  return nextUi
}

function mergeLayout(
  target: ChatConfig['layout'] | undefined,
  patch: ChatConfig['layout'] | undefined,
): ChatConfig['layout'] | undefined {
  if (!patch) {
    return target
  }

  return {
    ...(target ?? {}),
    ...patch,
    ...(patch.placements !== undefined
      ? {
          placements: {
            ...(target?.placements ?? {}),
            ...patch.placements,
          },
        }
      : {}),
  }
}

function mergeRuntime(
  target: ChatConfig['runtime'] | undefined,
  patch: ChatConfig['runtime'] | undefined,
): ChatConfig['runtime'] | undefined {
  if (!patch) {
    return target
  }

  const next = {
    ...(target ?? {}),
    ...patch,
  }

  if (Object.values(next).every((value) => value === undefined)) {
    return undefined
  }

  return next
}

function mergeChatConfigPatch(
  target: Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'layout' | 'features' | 'runtime'>>,
  patch: Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'layout' | 'features' | 'runtime'>>,
): Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'layout' | 'features' | 'runtime'>> {
  const next = { ...target }

  if (patch.defaults) {
    next.defaults = {
      ...(next.defaults ?? {}),
      ...patch.defaults,
    }
  }

  if (patch.ui) {
    next.ui = mergeUi(next.ui, patch.ui)
  }

  if (patch.layout) {
    next.layout = mergeLayout(next.layout, patch.layout)
  }

  if (patch.features) {
    next.features = mergeFeatures(next.features, patch.features)
  }

  if (patch.runtime) {
    next.runtime = mergeRuntime(next.runtime, patch.runtime)
  }

  return next
}

function resolvePresetChain(rootPreset: AgentPresetInput, presets: AgentPresetInput[]): AgentPresetInput[] {
  const presetMap = new Map<string, AgentPresetInput>([...presets, rootPreset].map((item) => [item.id, item]))
  const resolved = new Map<string, AgentPresetInput[]>()

  function visit(preset: AgentPresetInput, stack: string[]): AgentPresetInput[] {
    const cached = resolved.get(preset.id)
    if (cached) {
      return cached
    }

    if (stack.includes(preset.id)) {
      throw new Error(
        `[resolveAgentPreset] Circular preset inheritance detected: ${[...stack, preset.id].join(' -> ')}`,
      )
    }

    const parents = preset.extends ?? []
    const nextStack = [...stack, preset.id]
    const chain: AgentPresetInput[] = []

    for (const parentId of parents) {
      const parentPreset = presetMap.get(parentId)
      if (!parentPreset) {
        throw new Error(`[resolveAgentPreset] AgentPreset "${parentId}" not found`)
      }

      chain.push(...visit(parentPreset, nextStack))
    }

    chain.push(preset)
    resolved.set(preset.id, chain)
    return chain
  }

  return visit(rootPreset, [])
}

function resolveSkillPackList(preset: AgentPresetInput, skillPacks: SkillPackInput[]): SkillPackInput[] {
  const skillIds = preset.skills ?? []
  if (skillIds.length === 0) {
    return []
  }

  const skillPackMap = new Map(skillPacks.map((item) => [item.id, item]))

  return skillIds.map((skillId) => {
    const skillPack = skillPackMap.get(skillId)
    if (!skillPack) {
      throw new Error(`[resolveAgentPreset] SkillPack "${skillId}" not found`)
    }

    return skillPack
  })
}

export function resolveAgentPreset(options: ResolveAgentPresetOptions): ResolvedAgentPreset {
  const presetChain = resolvePresetChain(options.preset, options.presets ?? [])
  const allResolvedSkillPacks: SkillPackInput[] = []
  let mergedPatch: ResolvedAgentPreset['chatConfigPatch'] = {}

  for (const preset of presetChain) {
    const resolvedSkillPacks = resolveSkillPackList(preset, options.skillPacks ?? [])
    allResolvedSkillPacks.push(...resolvedSkillPacks)

    mergedPatch = resolvedSkillPacks.reduce<ResolvedAgentPreset['chatConfigPatch']>(
      (accumulator, skillPack) => mergeChatConfigPatch(accumulator, toChatConfigPatch(skillPack)),
      mergedPatch,
    )
    mergedPatch = mergeChatConfigPatch(mergedPatch, toChatConfigPatch(preset))
  }

  return {
    presetId: options.preset.id,
    presetChain,
    skillPacks: allResolvedSkillPacks,
    chatConfigPatch: mergedPatch,
  }
}

export function applyAgentPresetToConfig(options: ApplyAgentPresetOptions): ChatConfig {
  const resolvedPreset = resolveAgentPreset(options)

  return {
    ...options.baseConfig,
    ...resolvedPreset.chatConfigPatch,
    defaults: {
      ...(options.baseConfig.defaults ?? {}),
      ...(resolvedPreset.chatConfigPatch.defaults ?? {}),
    },
    ui: mergeUi(options.baseConfig.ui, resolvedPreset.chatConfigPatch.ui),
    layout: mergeLayout(options.baseConfig.layout, resolvedPreset.chatConfigPatch.layout),
    features: mergeFeatures(options.baseConfig.features, resolvedPreset.chatConfigPatch.features),
    runtime: mergeRuntime(options.baseConfig.runtime, resolvedPreset.chatConfigPatch.runtime),
  }
}

export function createChatAdapterFromAgentPreset(
  options: CreateChatAdapterFromAgentPresetOptions,
): AgentPresetResolutionResult {
  const resolvedPreset = resolveAgentPreset(options)
  const chatConfig = applyAgentPresetToConfig(options)

  return {
    resolvedPreset,
    chatConfig,
    adapter: createChatAdapterFromConfig(chatConfig),
  }
}

export function createPresetConsumptionFromAgentPreset(
  options: CreatePresetConsumptionFromAgentPresetOptions,
): AgentPresetConsumptionResult {
  const { presetOverrides, ...presetOptions } = options
  const adapterResult = createChatAdapterFromAgentPreset(presetOptions)
  const presetProps = createPresetChatProps(adapterResult.adapter, presetOverrides)

  return {
    ...adapterResult,
    presetProps,
    presetSlices: createPresetChatSlices(presetProps),
  }
}
