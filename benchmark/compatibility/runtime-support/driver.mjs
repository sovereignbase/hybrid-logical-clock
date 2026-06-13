import { createRequire } from 'node:module'
import { HLC } from '../../../dist/index.js'

export function run() {
  const require = createRequire(import.meta.url)
  const cjsApi = require('../../../dist/index.cjs')
  const esmWorks = typeof HLC === 'function'
  const cjsWorks = typeof cjsApi.HLC === 'function'
  const webPrimitives = [
    typeof Uint8Array === 'function',
    typeof DataView === 'function',
    typeof crypto !== 'undefined',
  ]

  return {
    category: 'Compatibility',
    metric: 'Runtime support',
    measures: 'Browser, Node, OS, framework support',
    result: `esm ${esmWorks ? 'ok' : 'fail'}; cjs ${cjsWorks ? 'ok' : 'fail'}; web primitives ${webPrimitives.filter(Boolean).length}/${webPrimitives.length}`,
    raw: { esmWorks, cjsWorks, webPrimitives },
  }
}
