import { HLC, CLOCK_START } from '../../../dist/index.js'

export function run() {
  const clock = new HLC()
  const invalidInputs = [
    null,
    undefined,
    {},
    [],
    [CLOCK_START],
    [CLOCK_START, [1, 2, 3]],
    [CLOCK_START, [1, 2, 3, -1]],
    [CLOCK_START, [1, 2, 3, 0x100000000]],
    [
      [1, 2, 3],
      [1, 2, 3, 4],
    ],
  ]

  const rejected = invalidInputs.filter(
    (input) => !clock.validate(input)
  ).length

  return {
    category: 'Reliability',
    metric: 'Error handling',
    measures: 'Behavior under invalid or edge input',
    result: `${rejected}/${invalidInputs.length} invalid inputs rejected without throwing`,
    raw: { rejected, total: invalidInputs.length },
  }
}
