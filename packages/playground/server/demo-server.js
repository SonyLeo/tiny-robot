import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '../../..')
const DEMOS_DIR = path.join(PROJECT_ROOT, 'docs/demos')

app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')))

// CORS 中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// 获取所有 demo 分类
app.get('/api/demos/categories', async (req, res) => {
  try {
    const categories = await loadDemoCategories()
    res.json(categories)
  } catch (error) {
    console.error('Error loading demo categories:', error)
    res.status(500).json({ error: 'Failed to load demo categories' })
  }
})

// 获取特定 demo 文件内容
app.get('/api/demos/file', async (req, res) => {
  try {
    const { path: filePath } = req.query
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    const fullPath = path.join(PROJECT_ROOT, filePath)

    // 安全检查：确保文件在 demos 目录内
    if (!fullPath.startsWith(DEMOS_DIR)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const content = await fs.readFile(fullPath, 'utf-8')
    res.type('text/plain').send(content)
  } catch (error) {
    console.error('Error reading demo file:', error)
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' })
    } else {
      res.status(500).json({ error: 'Failed to read file' })
    }
  }
})

// 保存 demo 文件
app.post('/api/demos/file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' })
    }

    const fullPath = path.join(PROJECT_ROOT, filePath)

    // 安全检查：确保文件在 demos 目录内
    if (!fullPath.startsWith(DEMOS_DIR)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await fs.writeFile(fullPath, content, 'utf-8')
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving demo file:', error)
    res.status(500).json({ error: 'Failed to save file' })
  }
})

// 加载所有 demo 分类
async function loadDemoCategories() {
  const categories = []

  try {
    const entries = await fs.readdir(DEMOS_DIR, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const categoryName = entry.name
        const categoryPath = path.join(DEMOS_DIR, categoryName)

        try {
          const demos = await loadDemosForCategory(categoryName, categoryPath)
          if (demos.length > 0) {
            categories.push({
              name: categoryName,
              demos
            })
          }
        } catch (error) {
          console.warn(`Failed to load demos for category ${categoryName}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error reading demos directory:', error)
  }

  return categories
}

// 加载特定分类的所有 demo
async function loadDemosForCategory(categoryName, categoryPath) {
  const demos = []

  try {
    const files = await fs.readdir(categoryPath)

    for (const file of files) {
      if (file.endsWith('.vue')) {
        const demoName = path.basename(file, '.vue')
        const filePath = path.join(categoryPath, file)
        const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/')

        try {
          const content = await fs.readFile(filePath, 'utf-8')
          demos.push({
            name: demoName,
            path: relativePath,
            component: categoryName,
            content
          })
        } catch (error) {
          console.warn(`Failed to read demo file ${file}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Error reading category directory ${categoryPath}:`, error)
  }

  return demos
}

app.listen(PORT, () => {
  console.log(`Demo server running on http://localhost:${PORT}`)
  console.log(`Project root: ${PROJECT_ROOT}`)
  console.log(`Serving demos from: ${DEMOS_DIR}`)

  // 检查路径是否存在
  fs.access(DEMOS_DIR)
    .then(() => console.log('✅ Demos directory found'))
    .catch(() => console.log('❌ Demos directory not found'))
})
