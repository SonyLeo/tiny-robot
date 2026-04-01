# Presets Authoring Guide

This directory defines the first preset-composition layer on top of the stable chat capability contract.

The goal is not to create a parallel runtime path. `AgentPreset` and `SkillPack` must always resolve back into the existing:

- `ChatConfig`
- adapter
- feature registry
- preset props / preset slices

## Responsibility Split

Use `AgentPreset` for:

- the final scene or assistant identity
- the last override in a merge chain
- high-level defaults such as:
  - `defaults.systemPrompt`
  - `ui.brand`
  - `ui.welcome`
  - final prompt list decisions

Use `SkillPack` for:

- reusable capability bundles
- layout or feature hints that can be shared by multiple presets
- small prompt bundles when they are not the final authority

Keep the rule simple:

- preset = final scene
- skill pack = reusable bundle

## Merge Order

The current merge order is:

1. inherited presets
2. skill packs declared by each preset in that chain
3. the current preset itself
4. base config, when `applyAgentPresetToConfig()` merges the resolved patch back

This means the current preset is the final override within the preset-resolution phase.

## UI Rules

`ui.brand`

- merges by object keys

`ui.welcome`

- merges by object keys

`ui.prompts`

- defaults to `replace`
- only appends when `ui.promptMode = 'append'`

Do not assume prompt arrays always concatenate. If a preset wants to preserve inherited or skill-provided prompts, it must say so explicitly through `promptMode: 'append'`.

## Feature Rules

Feature config follows these rules:

- `false` means the feature is explicitly disabled
- `true` keeps the feature enabled without discarding an already-merged object config
- object values merge into existing object values when possible

This matters for nested feature config such as:

- `attachments.upload`
- `attachments.list`
- `senderActions.voice`
- `history.props`

## MCP Rules

`mcp` is treated as part of the feature config surface.

- `mcp: true` means enabled with no extra detail
- `mcp: { manager }` is more specific than `true`
- `mcp: false` explicitly disables the final resolved MCP config

If a preset needs a concrete manager, prefer the object form.

## Inheritance Rules

`AgentPreset.extends` supports preset inheritance.

- missing inherited presets are errors
- circular inheritance is an error
- inherited presets resolve before the current preset

Keep inheritance shallow and intentional. If multiple presets need the same reusable bundle, prefer a shared `SkillPack` first.

## Current Built-in Reference Shapes

The built-in catalog currently includes:

- presets:
  - `assistant-base`
  - `docs-reader`
  - `tool-agent`
- skill packs:
  - `conversation-core`
  - `docs-layout`
  - `tool-agent-core`

Use these as examples when adding new presets or skill packs.

## Authoring Checklist

Before adding a new preset or skill pack, check:

1. Does it resolve back into `defaults / ui / layout / features / mcp` only?
2. Is this better modeled as a reusable `SkillPack` than a final `AgentPreset`?
3. Is the prompt behavior correct under `replace` vs `append`?
4. Does it avoid reopening existing chat boundaries such as:
   - `senderProps.extensions`
   - layout as presentation-only
   - stable CLI consumption contract from `P3`
5. Is there a unit test proving the intended merge behavior?
