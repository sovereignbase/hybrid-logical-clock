import { HLC, CLOCK_START } from '../../../dist/index.js'

export function run() {
  const clock = new HLC()
  const checks = []
  let previous = CLOCK_START

  for (let index = 0; index < 1_000; index++) {
    const timestamp = clock.tick(index + 1, previous)
    checks.push(clock.validate(timestamp))
    if (previous !== CLOCK_START)
      checks.push(clock.compare([CLOCK_START, previous], timestamp) === -1)
    previous = timestamp[1]
  }

  const passed = checks.filter(Boolean).length

  return {
    category: 'Reliability',
    metric: 'Correctness',
    measures: 'Produces expected results',
    result: `${passed}/${checks.length} generated-chain checks passed`,
    raw: { passed, total: checks.length },
  }
}
