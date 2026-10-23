import { execSync } from 'node:child_process'

// Get command line arguments
const args = process.argv.slice(2)
const skipComponents = args.includes('--nocomponents')

try {
  // Build components unless --nocomponents flag is present
  if (!skipComponents) {
    execSync('pnpm build:components', { stdio: 'inherit' })
  } else {
    console.log('Skipping components build (--nocomponents flag detected)')
  }

  // Build the shared docs catalog before VitePress consumes the same sources.
  execSync('pnpm -F docs agent:catalog', { stdio: 'inherit' })

  // Build playground
  execSync('pnpm build:playground', { stdio: 'inherit' })

  // Build docs
  execSync('pnpm -F docs build', { stdio: 'inherit' })

  // Generate public Agent-facing artifacts after VitePress creates docs/dist.
  execSync('pnpm -F docs agent:build', { stdio: 'inherit' })

  console.log('✓ Docs build completed successfully')
} catch (error) {
  console.error('Error building docs:', error.message)
  process.exit(1)
}
