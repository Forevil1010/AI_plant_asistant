import { defineConfig } from '@tarojs/cli'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

if (existsSync('.env')) loadEnvFile('.env')

const apiBaseUrl = process.env.TARO_APP_API_BASE_URL || ''
const useMock = process.env.TARO_APP_USE_MOCK === 'true' || !apiBaseUrl

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
      enable: true
    }
  },
  cache: {
    enable: false
  },
  sass: {},
  mini: {
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
