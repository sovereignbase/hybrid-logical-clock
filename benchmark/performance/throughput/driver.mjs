import { HLC } from '../../../dist/index.js'
import { formatNumber, measureLoop } from '../../shared/timing.mjs'

export function run() {
  const iterations = 250_000
  const clock = new HLC()
  let previous = clock.tick()

  const tick = measureLoop(iterations, () => {
    previous = clock.tick(1, previous[1])
  })

  const left = previous
  const right = clock.tick(1, previous[1])
  const compare = measureLoop(iterations, () => {
    clock.compare(left, right)
  })

  const validate = measureLoop(iterations, () => {
    clock.validate(right)
  })

  return {
    category: 'Performance',
    metric: 'Throughput',
    measures: 'Work completed per second',
    result: `tick ${formatNumber(tick.operationsPerSecond)} ops/s; compare ${formatNumber(compare.operationsPerSecond)} ops/s; validate ${formatNumber(validate.operationsPerSecond)} ops/s`,
    raw: { tick, compare, validate },
  }
}
