import type { PluginInfo } from '@opentiny/tiny-robot'
import type { ToolCall } from '@opentiny/tiny-robot-kit'

export const MOCK_PLUGINS: PluginInfo[] = [
  {
    id: 'utility',
    name: '实用工具',
    icon: '🔧',
    description: '提供时间查询、计算器、文本处理等实用工具',
    enabled: true,
    tools: [
      {
        id: 'get_current_time',
        name: 'get_current_time',
        description: '获取当前时间和日期',
        enabled: true,
      },
      {
        id: 'calculate',
        name: 'calculate',
        description: '执行数学计算',
        enabled: true,
      },
      {
        id: 'word_count',
        name: 'word_count',
        description: '统计文本的字数和字符数',
        enabled: true,
      },
    ],
  },
  {
    id: 'weather',
    name: '天气查询',
    icon: '🌤️',
    description: '查询城市天气（模拟数据）',
    enabled: true,
    tools: [
      {
        id: 'get_weather',
        name: 'get_weather',
        description: '查询指定城市的天气信息',
        enabled: true,
      },
    ],
  },
]

const WEATHER_MOCK: Record<string, { temp: number; condition: string; humidity: number; wind: string }> = {
  北京: { temp: 22, condition: '晴', humidity: 35, wind: '东北风 3级' },
  上海: { temp: 26, condition: '多云', humidity: 72, wind: '东南风 2级' },
  广州: { temp: 31, condition: '阵雨', humidity: 88, wind: '南风 1级' },
  深圳: { temp: 30, condition: '多云转晴', humidity: 80, wind: '东风 2级' },
  杭州: { temp: 24, condition: '阴', humidity: 65, wind: '西北风 2级' },
  成都: { temp: 20, condition: '小雨', humidity: 78, wind: '无风' },
}

export const MOCK_BRIDGE = {
  async getTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'utility__get_current_time',
          description: '获取当前时间和日期，可指定时区',
          parameters: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description: '时区，如 Asia/Shanghai，默认为本地时区',
              },
              format: {
                type: 'string',
                enum: ['full', 'date', 'time'],
                description: '返回格式：full=完整日期时间，date=仅日期，time=仅时间',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'utility__calculate',
          description: '执行数学表达式计算，支持加减乘除、幂运算、括号等',
          parameters: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: '数学表达式，如 "2 + 3 * 4" 或 "(10 + 5) / 3"',
              },
            },
            required: ['expression'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'utility__word_count',
          description: '统计文本的字数、字符数、行数等信息',
          parameters: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: '要统计的文本内容',
              },
            },
            required: ['text'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'weather__get_weather',
          description: '查询指定城市的当前天气信息（模拟数据）',
          parameters: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: '城市名称，如 北京、上海、广州',
              },
            },
            required: ['city'],
          },
        },
      },
    ]
  },

  async callTool(toolCall: ToolCall) {
    const name = toolCall.function?.name ?? ''
    const args = JSON.parse(toolCall.function?.arguments || '{}')

    await new Promise((r) => setTimeout(r, 300))

    if (name === 'utility__get_current_time') {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const result =
        args.format === 'date'
          ? { date: dateStr, weekday: weekdays[now.getDay()] }
          : args.format === 'time'
            ? { time: timeStr }
            : { datetime: `${dateStr} ${timeStr}`, weekday: weekdays[now.getDay()], timestamp: now.getTime() }
      return JSON.stringify(result)
    }

    if (name === 'utility__calculate') {
      try {
        // 安全地只允许数学运算符和数字
        const expr = args.expression as string
        if (!/^[\d\s+\-*/().^%]+$/.test(expr)) {
          return JSON.stringify({ error: '表达式包含非法字符，只支持数字和基本运算符' })
        }
         
        const result = Function(`"use strict"; return (${expr.replace(/\^/g, '**')})`)()
        return JSON.stringify({ expression: expr, result, formatted: String(result) })
      } catch {
        return JSON.stringify({ error: '计算失败，请检查表达式格式' })
      }
    }

    if (name === 'utility__word_count') {
      const text = args.text as string
      const chars = text.length
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const lines = text.split('\n').length
      return JSON.stringify({ chars, chineseChars, words, lines })
    }

    if (name === 'weather__get_weather') {
      const city = args.city as string
      const data = WEATHER_MOCK[city]
      if (!data) {
        const available = Object.keys(WEATHER_MOCK).join('、')
        return JSON.stringify({ error: `暂不支持该城市，目前支持：${available}` })
      }
      return JSON.stringify({
        city,
        temperature: `${data.temp}°C`,
        condition: data.condition,
        humidity: `${data.humidity}%`,
        wind: data.wind,
        note: '（模拟数据）',
      })
    }

    return JSON.stringify({ error: `未知工具: ${name}` })
  },
}
