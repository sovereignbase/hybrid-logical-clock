import { resolve } from 'node:path'
import { EdgeRuntime } from 'edge-runtime'
import { rolldown } from 'rolldown'
import { ensurePassing, printResults, runHLCSuite } from '../shared/suite.mjs'

const root = process.cwd()
const esmDistPath = resolve(root, 'dist', 'index.js')

async function createExecutableEdgeEsm() {
  const bundle = await rolldown({ input: esmDistPath })
  const { output } = await bundle.generate({ format: 'esm' })
  const bundleCode = output.find((chunk) => chunk.type === 'chunk')?.code
  await bundle.close()
  if (!bundleCode) throw new Error('edge-runtime harness emitted no JS chunk')
  const exportMatch = bundleCode.match(
    /export\s*\{\s*([\s\S]*?)\s*\};\s*(\/\/# sourceMappingURL=.*)?\s*$/
  )
  if (!exportMatch)
    throw new Error('edge-runtime esm harness could not find bundle exports')

  const exportEntries = exportMatch[1]
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean)
    .map((specifier) => {
      const [localName, exportedName] = specifier.split(/\s+as\s+/)
      return exportedName
        ? `${JSON.stringify(exportedName)}: ${localName}`
        : localName
    })
    .join(',\n  ')

  const sourceMapComment = exportMatch[2] ? `${exportMatch[2]}\n` : ''
  return (
    bundleCode.slice(0, exportMatch.index) +
    `globalThis.__hlcEsmExports = {\n  ${exportEntries}\n};\n` +
    sourceMapComment
  )
}

const runtime = new EdgeRuntime()
runtime.evaluate(await createExecutableEdgeEsm())

const results = runHLCSuite(runtime.context.__hlcEsmExports, {
  label: 'edge-runtime esm',
  runtimeGlobals: runtime.context,
})
printResults(results)
ensurePassing(results)
