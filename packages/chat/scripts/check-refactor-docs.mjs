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
  const reviewPacketsRel = 'packages/chat/docs/refactor/reviews'
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
    errors.push('packages/chat/docs/refactor/reviews should contain at least one review directory')
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
  const trackerRel = 'packages/chat/docs/refactor/process/alignment-tracker.md'
  const trackerDir = path.posix.dirname(trackerRel)
  const trackerText = read(trackerRel)
  const matches = trackerText.match(/(?:\.\.\/)+reviews\/[^\s)`]+\.md/g) ?? []
  const requiredKinds = ['OWNER_RUNBOOK', 'SPEC_DETAIL', 'REVIEWER_MEMO']

  for (const relPath of matches) {
    if (!requiredKinds.some((kind) => relPath.endsWith(`${kind}.md`))) {
      continue
    }
    assertFile(path.posix.normalize(path.posix.join(trackerDir, relPath)))
  }
}

const requiredFiles = [
  'packages/chat/AGENTS.md',
  'packages/chat/docs/refactor/README.md',
  'packages/chat/docs/refactor/REFACTOR_COLLAB_GUIDE.md',
  'packages/chat/docs/refactor/CODE_MAP.md',
  'packages/chat/docs/refactor/IMPLEMENTATION_ROUTING.md',
  'packages/chat/docs/refactor/design/overview.md',
  'packages/chat/docs/refactor/design/api-runtime.md',
  'packages/chat/docs/refactor/design/execution.md',
  'packages/chat/docs/refactor/archive/proposal.md',
  'packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md',
  'packages/chat/docs/refactor/process/alignment-tracker.md',
  'packages/chat/docs/refactor/process/review-scheme.md',
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
]

const requiredDirs = [
  'packages/chat/docs/exec-plans/active',
  'packages/chat/docs/exec-plans/completed',
  'packages/chat/docs/exec-plans/templates',
  'packages/chat/docs/generated',
  'packages/chat/docs/histories',
  'packages/chat/docs/refactor/design',
  'packages/chat/docs/refactor/process',
  'packages/chat/docs/refactor/archive',
  'packages/chat/docs/refactor/reviews',
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
  'packages/chat/AGENTS.md',
  'packages/chat/docs/refactor/README.md',
  'packages/chat/AGENTS.md should point to the refactor docs map',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'packages/chat/docs/refactor/design/overview.md',
  'SOURCE_OF_TRUTH.md should reference the normative refactor docs',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'packages/chat/docs/refactor/process/review-scheme.md',
  'SOURCE_OF_TRUTH.md should reference the review scheme',
)
assertIncludes(
  'packages/chat/docs/SOURCE_OF_TRUTH.md',
  'packages/chat/docs/refactor/process/alignment-tracker.md',
  'SOURCE_OF_TRUTH.md should reference the alignment tracker',
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
