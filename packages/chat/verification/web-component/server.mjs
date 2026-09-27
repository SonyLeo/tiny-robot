import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' }
const port = Number(process.env.CHAT_WC_PORT || 4178)

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const target = resolve(root, `.${pathname === '/' ? '/verification/web-component/index.html' : pathname}`)
  if (!target.startsWith(root + sep)) { response.writeHead(403).end(); return }
  try {
    if (!(await stat(target)).isFile()) throw new Error('Not a file')
    const body = await readFile(target)
    response.writeHead(200, { 'Content-Type': `${types[extname(target)] || 'application/octet-stream'}; charset=utf-8` }).end(body)
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`Chat Web Component verification: http://localhost:${port}`))
