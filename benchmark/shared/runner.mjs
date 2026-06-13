export async function runBenchmarks(drivers) {
  const results = []

  for (const driver of drivers) {
    const result = await driver()
    results.push(result)
  }

  printResults(results)
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
