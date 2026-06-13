import assert from 'node:assert/strict'
import test from 'node:test'
import { CLOCK_START, HLC } from '../../dist/index.js'

test('integration: ticks can be chained through the public API', () => {
  const clock = new HLC()
  const first = clock.tick()
  const second = clock.tick(3, first[1])
  const third = clock.tick(5, second[1])

  assert.equal(first[0], CLOCK_START)
  assert.deepEqual(second[0], first[1])
  assert.deepEqual(third[0], second[1])
  assert.equal(clock.validate(first), true)
  assert.equal(clock.validate(second), true)
  assert.equal(clock.validate(third), true)
  assert.equal(clock.compare(first, second), -1)
  assert.equal(clock.compare(second, third), -1)
})

test('integration: independent clocks produce valid comparable timestamps', () => {
  const leftClock = new HLC()
  const rightClock = new HLC()
  const left = leftClock.tick(2)
  const right = rightClock.tick(2)
  const comparison = leftClock.compare(left, right)

  assert.equal(leftClock.validate(left), true)
  assert.equal(rightClock.validate(right), true)
  assert.ok([-1, 0, 1].includes(comparison))
  assert.equal(leftClock.compare(left, left), 0)
  assert.equal(rightClock.compare(right, right), 0)
})
