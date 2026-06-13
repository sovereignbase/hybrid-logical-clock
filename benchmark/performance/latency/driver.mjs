import { HLC, CLOCK_START } from '../../../dist/index.js'
import { formatNumber, measureLoop } from '../../shared/timing.mjs'

export function run() {
  const iterations = 100_000
  const clock = new HLC()
  const left = [CLOCK_START, [1, 2, 3, 4]]
  const right = [CLOCK_START, [1, 2, 3, 5]]

  const construct = measureLoop(10_000, () => new HLC())
  const tick = measureLoop(iterations, () => clock.tick())
  const compare = measureLoop(iterations, () => clock.compare(left, right))
  const validate = measureLoop(iterations, () => clock.validate(right))

  return {
    category: 'Performance',
    metric: 'Latency',
    measures: 'Time per operation',
    result: `construct ${formatNumber(construct.nanosecondsPerOperation)} ns/op; tick ${formatNumber(tick.nanosecondsPerOperation)} ns/op; compare ${formatNumber(compare.nanosecondsPerOperation)} ns/op; validate ${formatNumber(validate.nanosecondsPerOperation)} ns/op`,
    raw: { construct, tick, compare, validate },
  }
}
