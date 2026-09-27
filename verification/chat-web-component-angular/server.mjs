import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const root = resolve(projectRoot, 'dist/chat-web-component-angular/browser')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ico': 'image/x-icon' }
const port = Number(process.env.CHAT_WC_ANGULAR_PORT || 4180)

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const target = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
  if (!target.startsWith(root + sep)) { response.writeHead(403).end(); return }
  try {
    if (!(await stat(target)).isFile()) throw new Error('Not a file')
    response.writeHead(200, { 'Content-Type': `${types[extname(target)] || 'application/octet-stream'}; charset=utf-8` })
    response.end(await readFile(target))
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`Angular WC consumer: http://localhost:${port}`))
