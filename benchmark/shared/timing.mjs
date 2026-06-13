export function measureLoop(iterations, operation) {
  const started = process.hrtime.bigint()
  for (let index = 0; index < iterations; index++) operation(index)
  const elapsedNs = Number(process.hrtime.bigint() - started)

  return {
    iterations,
    elapsedNs,
    operationsPerSecond: (iterations / elapsedNs) * 1_000_000_000,
    nanosecondsPerOperation: elapsedNs / iterations,
  }
}

export function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatBytes(bytes) {
  const units = ['B', 'KiB', 'MiB', 'GiB']
  let value = bytes
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }

  return `${formatNumber(value)} ${units[unit]}`
}
