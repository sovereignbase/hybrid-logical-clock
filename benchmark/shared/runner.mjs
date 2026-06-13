export async function runBenchmarks(drivers, options = {}) {
  const results = []

  for (const driver of drivers) {
    const result = await driver()
    results.push(result)
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          rows: results,
        },
        null,
        2
      )
    )
    return results
  }

  printResults(results)
  return results
}

function printResults(results) {
  console.log('\nHybrid Logical Clock benchmark report\n')
  console.log('| Category | Metric | Measures | Result |')
  console.log('| --- | --- | --- | --- |')

  for (const result of results) {
    console.log(
      `| ${result.category} | ${result.metric} | ${result.measures} | ${result.result} |`
    )
  }

  console.log('\nMachine-readable results\n')
  console.log(JSON.stringify(results, null, 2))
}
