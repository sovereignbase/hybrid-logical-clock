import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { minifySync } from 'rolldown/experimental'
import { fileSize, gzipSize, rootPath } from '../../shared/filesystem.mjs'
import { formatBytes } from '../../shared/timing.mjs'

export async function run() {
  const files = ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts']
  const raw = {}
  const esmPath = rootPath('dist/index.js')

  for (const file of files) {
    raw[file] = {
      bytes: await fileSize(rootPath(file)),
      gzipBytes: file.endsWith('.d.ts')
        ? undefined
        : await gzipSize(rootPath(file)),
    }
  }

  const minified = minifySync(esmPath, await readFile(esmPath, 'utf8'), {
    module: true,
  }).code
  raw['dist/index.js'].minifiedBytes = Buffer.byteLength(minified)
  raw['dist/index.js'].minifiedGzipBytes = gzipSync(minified).byteLength

  return {
    category: 'Size',
    metric: 'Bundle size',
    measures: 'Installed/imported/shipped code size',
    result: `esm ${formatBytes(raw['dist/index.js'].bytes)} (${formatBytes(raw['dist/index.js'].gzipBytes)} gzip, ${formatBytes(raw['dist/index.js'].minifiedGzipBytes)} min+gzip); cjs ${formatBytes(raw['dist/index.cjs'].bytes)} (${formatBytes(raw['dist/index.cjs'].gzipBytes)} gzip); d.ts ${formatBytes(raw['dist/index.d.ts'].bytes)}`,
    raw,
  }
}
