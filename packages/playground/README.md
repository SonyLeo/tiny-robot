# TinyRobot Playground

A Vue.js playground for testing and demonstrating TinyRobot components, built with @vue/repl.

## Features

- 🎮 Real-time Vue component editing and preview
- 📦 Version switching for TinyRobot, Vue, and TypeScript (including alpha/rc versions)
- 📝 Syntax highlighting and auto-completion with Monaco Editor
- 🔧 Full TypeScript support
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- 🔗 Shareable links via URL hash
- 🔄 Reload playground functionality
- 📋 Copy share link to clipboard
- 🚀 GitHub integration link

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:playground

# Build for production
pnpm build:playground
```

## Usage

1. Open the playground in your browser
2. Select the desired versions for TinyRobot, Vue, and TypeScript (including alpha/rc versions)
3. Edit the code in the left panel with full Monaco Editor support
4. See the live preview in the right panel
5. Use the file tabs to switch between App.vue, Demo.vue, tsconfig.json, and import-map.json
6. Toggle between dark and light themes using the theme button
7. Share your playground using the share button (copies link to clipboard)
8. Reload the playground using the reload button
9. Visit the GitHub repository using the GitHub button

## Header Features

The playground header includes:
- **Version Selectors**: Choose TinyRobot, Vue, and TypeScript versions
- **Theme Toggle**: Switch between dark and light modes
- **Share Button**: Generate and copy shareable links
- **Reload Button**: Refresh the playground
- **GitHub Link**: Direct link to the TinyRobot repository

## File Structure

- `App.vue` - Main application component
- `Demo.vue` - Demo component for showcasing TinyRobot components
- `tsconfig.json` - TypeScript configuration
- `import-map.json` - Import map for external dependencies

## Integration

The playground can be embedded in documentation or used as a standalone application for component development and testing.