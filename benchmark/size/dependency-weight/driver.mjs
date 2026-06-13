import {
  directorySize,
  packageRoot,
  rootPath,
} from '../../shared/filesystem.mjs'
import { readPackageJson } from '../../shared/source.mjs'
import { formatBytes } from '../../shared/timing.mjs'

export async function run() {
  const packageJson = await readPackageJson()
  const dependencies = Object.keys(packageJson.dependencies ?? {})
  const nodeModulesSize = await directorySize(rootPath('node_modules'))
  const direct = {}

  for (const dependency of dependencies) {
    direct[dependency] = await directorySize(packageRoot(dependency))
  }

  return {
    category: 'Size',
    metric: 'Dependency weight',
    measures: 'Transitive dependency cost',
    result: `${dependencies.length} direct production deps; direct package bytes ${formatBytes(Object.values(direct).reduce((sum, size) => sum + size, 0))}; node_modules ${formatBytes(nodeModulesSize)}`,
    raw: { dependencies, direct, nodeModulesSize },
  }
}
