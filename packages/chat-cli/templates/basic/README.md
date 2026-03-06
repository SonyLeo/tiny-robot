# Tiny Robot Chat App

A minimal chat application powered by Tiny Robot Chat Kit.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Add your API key and provider:
```env
VITE_API_KEY=your_api_key_here
VITE_API_PROVIDER=openai  # or deepseek
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Security

⚠️ **Important**: Never expose your API key in the browser in production!

For production deployments, implement a backend proxy:

1. Create a backend endpoint that accepts chat messages
2. Forward requests to the API provider with your API key
3. Update the app to call your backend instead of the API directly

Example backend proxy (Node.js/Express):

```javascript
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages,
    }),
  })
  res.json(await response.json())
})
```

## Learn More

- [Tiny Robot Documentation](https://github.com/opentiny/tiny-robot)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [DeepSeek API Docs](https://platform.deepseek.com/docs)
