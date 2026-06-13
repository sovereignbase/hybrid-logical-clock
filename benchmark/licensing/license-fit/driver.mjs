import { readFile } from 'node:fs/promises'
import { packageRoot } from '../../shared/filesystem.mjs'
import { readPackageJson } from '../../shared/source.mjs'

export async function run() {
  const packageJson = await readPackageJson()
  const dependencies = Object.keys(packageJson.dependencies ?? {})
  const dependencyLicenses = {}

  for (const dependency of dependencies) {
    const dependencyPackage = JSON.parse(
      await readFile(`${packageRoot(dependency)}/package.json`, 'utf8')
    )
    dependencyLicenses[dependency] = dependencyPackage.license ?? 'UNKNOWN'
  }

  const dependencyLicenseValues = Object.values(dependencyLicenses)
  const knownDependencyLicenses = dependencyLicenseValues.filter(
    (license) => license && license !== 'UNKNOWN'
  )

  return {
    category: 'Licensing',
    metric: 'License fit',
    measures: 'Whether it can be used in the target project',
    result: `package ${packageJson.license}; dependency licenses ${knownDependencyLicenses.length}/${dependencyLicenseValues.length} known`,
    raw: { packageLicense: packageJson.license, dependencyLicenses },
  }
}
