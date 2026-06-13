import { HLC } from '../../../dist/index.js'
import { formatNumber } from '../../shared/timing.mjs'

export function run() {
  const iterations = 500_000
  const clock = new HLC()
  let previous = clock.tick()
  const started = process.cpuUsage()

  for (let index = 0; index < iterations; index++) {
    previous = clock.tick(1, previous[1])
  }

  const cpu = process.cpuUsage(started)
  const totalMicros = cpu.user + cpu.system

  return {
    category: 'Efficiency',
    metric: 'CPU use',
    measures: 'Processing cost under load',
    result: `${formatNumber(totalMicros / 1000)} ms CPU for ${formatNumber(iterations, 0)} ticks (${formatNumber((totalMicros * 1000) / iterations)} ns CPU/op)`,
    raw: { iterations, userMicros: cpu.user, systemMicros: cpu.system },
  }
}
