import { HLC, CLOCK_START } from '../../../dist/index.js'
import { formatNumber, measureLoop } from '../../shared/timing.mjs'

export function run() {
  const sizes = [1_000, 10_000, 100_000]
  const raw = []

  for (const size of sizes) {
    const clock = new HLC()
    let previous = [CLOCK_START, clock.time.slice()]
    const measurement = measureLoop(size, () => {
      previous = clock.tick(1, previous[1])
    })
    raw.push({
      size,
      nanosecondsPerOperation: measurement.nanosecondsPerOperation,
    })
  }

  const growth =
    raw[raw.length - 1].nanosecondsPerOperation / raw[0].nanosecondsPerOperation

  return {
    category: 'Scalability',
    metric: 'Complexity growth',
    measures: 'How cost changes as input grows',
    result: `${formatNumber(raw[0].nanosecondsPerOperation)} ns/op at ${formatNumber(raw[0].size, 0)} ticks; ${formatNumber(raw.at(-1).nanosecondsPerOperation)} ns/op at ${formatNumber(raw.at(-1).size, 0)} ticks; ${formatNumber(growth)}x ratio`,
    raw,
  }
}
