import { defineConfig } from '@tarojs/cli'
import { readFileSync } from 'node:fs'

// 手动读取 .env 文件，避免 loadEnvFile 兼容性问题
const envPath = '.env'
let apiBaseUrl = ''
let useMock = true

try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key === 'TARO_APP_API_BASE_URL') apiBaseUrl = value
    if (key === 'TARO_APP_USE_MOCK') useMock = value === 'true'
  }
} catch {}

if (!apiBaseUrl) {
  apiBaseUrl = 'http://localhost:3000/api'
  useMock = false
}

console.log('[Taro Config] API_BASE_URL:', apiBaseUrl, 'USE_MOCK:', useMock)

export default defineConfig({
  projectName: 'AI-plant-asist',
  date: '2026-07-20',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {
    __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    __USE_MOCK__: JSON.stringify(useMock)
  },
  plugins: [
    '@tarojs/plugin-html'
  ],
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  sass: {},
  mini: {
    webpackChain(chain) {
      chain.output.set('chunkLoadingGlobal', 'aiPlantAssistantChunks')
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          overrideBrowserslist: ['last 2 versions', 'iOS >= 8', 'Android >= 5']
        }
      },
      pxtransform: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          overrideBrowserslist: ['last 2 versions', 'iOS >= 8', 'Android >= 5']
        }
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
})
