#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const chatRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(chatRoot, '..', '..')

const errors = []

function toAbs(relPath) {
  return path.join(repoRoot, relPath)
}

function read(relPath) {
  return fs.readFileSync(toAbs(relPath), 'utf8')
}

function assertFile(relPath) {
  const abs = toAbs(relPath)
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    errors.push(`missing file: ${relPath}`)
  }
}

function assertDir(relPath) {
  const abs = toAbs(relPath)
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    errors.push(`missing directory: ${relPath}`)
  }
}

function assertIncludes(relPath, needle, message) {
  const abs = toAbs(relPath)
  if (!fs.existsSync(abs)) {
    return
  }

  if (!read(relPath).includes(needle)) {
    errors.push(message ?? `${relPath} should include: ${needle}`)
  }
}

function checkReviewPackets() {
  const reviewPacketsRel = 'packages/chat/review-packets'
  const reviewPacketsAbs = toAbs(reviewPacketsRel)

  assertDir(reviewPacketsRel)
  if (!fs.existsSync(reviewPacketsAbs)) {
    return
  }

  const packetDirs = fs
    .readdirSync(reviewPacketsAbs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  if (packetDirs.length === 0) {
    errors.push('packages/chat/review-packets should contain at least one review packet directory')
    return
  }

  const requiredKinds = [
    'OWNER_RUNBOOK',
    'SPEC_DETAIL',
    'REVIEWER_MEMO',
  ]

  for (const dirName of packetDirs) {
    const dirAbs = path.join(reviewPacketsAbs, dirName)
    const fileNames = fs
      .readdirSync(dirAbs, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    for (const kind of requiredKinds) {
      const hasFile = fileNames.some((fileName) =>
        new RegExp(`^REVIEW_[A-Z0-9]+_${kind}\\.md$`).test(fileName),
      )

      if (!hasFile) {
        errors.push(`review packet ${reviewPacketsRel}/${dirName} is missing ${kind}.md`)
      }
    }
  }
}

function checkTrackerReviewLinks() {
  const trackerRel = 'packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md'
  const trackerText = read(trackerRel)
  const matches = trackerText.match(/review-packets\/[^\s)`]+\.md/g) ?? []
  const requiredKinds = ['OWNER_RUNBOOK', 'SPEC_DETAIL', 'REVIEWER_MEMO']

  for (const relPath of matches) {
    if (!requiredKinds.some((kind) => relPath.endsWith(`${kind}.md`))) {
      continue
    }
    assertFile(path.posix.join('packages/chat', relPath))
  }
}

const requiredFiles = [
  'packages/chat/AGENTS.md',
  'packages/chat/ARCHITECTURE_REFACTOR_DESIGN.md',
  'packages/chat/ARCHITECTURE_REFACTOR_API_RUNTIME.md',
  'packages/chat/ARCHITECTURE_REFACTOR_EXECUTION.md',
  'packages/chat/ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md',
  'packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md',
  'packages/chat/ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md',
  'packages/chat/docs/README.md',
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md',
  'packages/chat/docs/generated/README.md',
  'packages/chat/docs/generated/runtime-owner-table.md',
  'packages/chat/docs/generated/config-bridge-matrix.md',
  'packages/chat/docs/generated/slot-catalog.md',
  'packages/chat/docs/generated/page-region-contract.md',
  'packages/chat/docs/exec-plans/templates/execution-slice.md',
  'packages/chat/docs/histories/template.md',
  'docs/src/components/chat.md',
  'docs/src/components/chat-features.md',
  'docs/src/components/chat-advanced.md',
]

const requiredDirs = [
  'packages/chat/docs/exec-plans/active',
  'packages/chat/docs/exec-plans/completed',
  'packages/chat/docs/exec-plans/templates',
  'packages/chat/docs/generated',
  'packages/chat/docs/histories',
  'packages/chat/review-packets',
]

for (const relPath of requiredFiles) {
  assertFile(relPath)
}

for (const relPath of requiredDirs) {
  assertDir(relPath)
}

assertIncludes(
  'packages/chat/AGENTS.md',
  'packages/chat/docs/README.md',
  'packages/chat/AGENTS.md should point to the chat docs map',
)
assertIncludes(
  'packages/chat/AGENTS.md',
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'packages/chat/AGENTS.md should point to the chat source-of-truth guide',
)
assertIncludes(
  'packages/chat/AGENTS.md',
  'packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md',
  'packages/chat/AGENTS.md should point to the surface-boundary guide',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'ARCHITECTURE_REFACTOR_DESIGN.md',
  'SOURCE_OF_TRUTH.md should reference the normative refactor docs',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md',
  'SOURCE_OF_TRUTH.md should reference the review scheme',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md',
  'SOURCE_OF_TRUTH.md should reference the alignment tracker',
)
assertIncludes(
  'packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md',
  'docs/src/components/chat.md',
  'CURRENT_VS_TARGET_SURFACE.md should reference the shipping user docs',
)
assertIncludes(
  'packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md',
  'TrChat.Root',
  'CURRENT_VS_TARGET_SURFACE.md should reference the target refactor surface',
)
assertIncludes(
  'packages/chat/docs/generated/README.md',
  'runtime-owner-table.md',
  'generated README should list the runtime owner table',
)
assertIncludes(
  'packages/chat/docs/generated/slot-catalog.md',
  'footer-extra',
  'slot-catalog.md should include the footer-extra freeze',
)
assertIncludes(
  'packages/chat/docs/generated/page-region-contract.md',
  'composition-only',
  'page-region-contract.md should preserve the composition-only constraint',
)
assertIncludes(
  'packages/chat/docs/generated/config-bridge-matrix.md',
  'createRuntimeFromConfig(config)',
  'config-bridge-matrix.md should describe the canonical bridge',
)

checkReviewPackets()
checkTrackerReviewLinks()

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error)
  }
  process.exit(1)
}

console.log('chat refactor docs check passed')
