import { directorySize, fileSize, rootPath } from '../../shared/filesystem.mjs'
import { formatBytes } from '../../shared/timing.mjs'

export async function run() {
  const distSize = await directorySize(rootPath('dist'))
  const packageSize =
    (await fileSize(rootPath('package.json'))) +
    (await fileSize(rootPath('README.md'))) +
    (await fileSize(rootPath('LICENSE')))

  return {
    category: 'Efficiency',
    metric: 'Storage use',
    measures: 'Disk/cache/persistent data required',
    result: `dist ${formatBytes(distSize)}; package metadata/docs ${formatBytes(packageSize)}`,
    raw: { distSize, packageSize },
  }
}
