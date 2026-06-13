import { stat, readdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const require = createRequire(import.meta.url)

export async function fileSize(path) {
  return (await stat(path)).size
}

export async function directorySize(path) {
  const info = await stat(path)
  if (info.isFile()) return info.size

  let total = 0
  for (const entry of await readdir(path, { withFileTypes: true })) {
    total += await directorySize(join(path, entry.name))
  }
  return total
}

export async function gzipSize(path) {
  return gzipSync(await readFile(path)).byteLength
}

export function packageRoot(packageName) {
  return dirname(require.resolve(`${packageName}/package.json`))
}

export function rootPath(...parts) {
  return resolve(process.cwd(), ...parts)
}
