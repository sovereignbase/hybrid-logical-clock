import { HLC } from '../../../dist/index.js'
import { formatBytes, formatNumber } from '../../shared/timing.mjs'

export function run() {
  const iterations = 50_000
  const before = process.memoryUsage().heapUsed
  const retained = []

  for (let index = 0; index < iterations; index++) {
    const clock = new HLC()
    retained.push(clock.tick())
  }

  const after = process.memoryUsage().heapUsed
  const delta = Math.max(0, after - before)

  return {
    category: 'Efficiency',
    metric: 'Memory use',
    measures: 'Runtime memory required',
    result: `${formatBytes(delta)} heap delta for ${formatNumber(iterations, 0)} retained timestamps (${formatBytes(delta / iterations)} each)`,
    raw: { iterations, heapUsedBefore: before, heapUsedAfter: after, delta },
  }
}
