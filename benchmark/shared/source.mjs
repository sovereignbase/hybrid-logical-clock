import { readFile } from 'node:fs/promises'

export async function readPackageJson() {
  return JSON.parse(await readFile('package.json', 'utf8'))
}
