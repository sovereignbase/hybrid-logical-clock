const UINT32_MAX = 0xffffffff
const UINT32_SIZE = 0x100000000

export function runHLCSuite(api, options = {}) {
  const { label = 'runtime' } = options
  const results = { label, ok: true, errors: [], tests: [] }
  const { CLOCK_START, HLC } = api

  function runTest(name, fn) {
    try {
      fn()
      results.tests.push({ name, ok: true })
    } catch (error) {
      results.ok = false
      results.tests.push({ name, ok: false })
      results.errors.push({ name, message: String(error) })
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed')
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected)
      throw new Error(message || `expected ${actual} to equal ${expected}`)
  }

  function assertArrayEqual(actual, expected, message) {
    assert(Array.isArray(actual), message || 'expected array')
    assertEqual(actual.length, expected.length, message || 'array length')
    for (let index = 0; index < expected.length; index++)
      assertEqual(actual[index], expected[index], message || 'array item')
  }

  function assertTimestampShape(timestamp, message) {
    assert(Array.isArray(timestamp), message || 'timestamp must be array')
    assertEqual(timestamp.length, 4, message || 'timestamp lane count')
    for (const lane of timestamp) {
      assert(Number.isInteger(lane), message || 'lane must be integer')
      assert(lane >= 0, message || 'lane must be unsigned')
      assert(lane <= UINT32_MAX, message || 'lane must be uint32')
    }
  }

  function addUint128(timestamp, advancement) {
    const next = timestamp.slice()
    let carry = advancement
    for (let index = 3; index >= 0; index--) {
      const sum = next[index] + carry
      next[index] = sum >>> 0
      carry = Math.floor(sum / UINT32_SIZE)
    }
    return next
  }

  runTest('exports CLOCK_START and HLC', () => {
    assertEqual(CLOCK_START, 0, 'CLOCK_START sentinel')
    assertEqual(typeof HLC, 'function', 'HLC export')
  })

  runTest('constructor creates four unsigned 32-bit lanes', () => {
    const clock = new HLC()
    assertTimestampShape(clock.time)
  })

  runTest('clock instances do not share timestamp arrays', () => {
    const left = new HLC()
    const right = new HLC()
    const rightBefore = right.time.slice()
    assert(left.time !== right.time, 'time arrays must be independent')
    left.tick(10)
    assertArrayEqual(right.time, rightBefore)
  })

  runTest('tick defaults to advancing one from CLOCK_START', () => {
    const clock = new HLC()
    const before = clock.time.slice()
    const timestamp = clock.tick()
    assertEqual(timestamp[0], CLOCK_START)
    assertArrayEqual(timestamp[1], addUint128(before, 1))
    assertArrayEqual(clock.time, timestamp[1])
  })

  runTest('tick accepts explicit previous timestamp', () => {
    const clock = new HLC()
    const first = clock.tick()
    const second = clock.tick(1, first[1])
    assertArrayEqual(second[0], first[1])
    assertArrayEqual(second[1], addUint128(first[1], 1))
  })

  runTest('tick returns stable copies', () => {
    const clock = new HLC()
    const first = clock.tick()
    const firstValue = first[1].slice()
    clock.tick(100, first[1])
    assertArrayEqual(first[1], firstValue)
    assert(first[1] !== clock.time, 'returned timestamp must be copied')
  })

  runTest('tick carries overflow from lane 4 to lane 3', () => {
    const clock = new HLC()
    clock.time[0] = 1
    clock.time[1] = 2
    clock.time[2] = 3
    clock.time[3] = UINT32_MAX
    assertArrayEqual(clock.tick(1)[1], [1, 2, 4, 0])
  })

  runTest('tick carries overflow across every lane', () => {
    const clock = new HLC()
    clock.time[0] = 9
    clock.time[1] = UINT32_MAX
    clock.time[2] = UINT32_MAX
    clock.time[3] = UINT32_MAX
    assertArrayEqual(clock.tick(1)[1], [10, 0, 0, 0])
  })

  runTest('tick supports larger bounded advancements', () => {
    const clock = new HLC()
    clock.time[0] = 0
    clock.time[1] = 0
    clock.time[2] = 7
    clock.time[3] = UINT32_MAX - 4
    assertArrayEqual(clock.tick(10)[1], [0, 0, 8, 5])
  })

  runTest('sequential ticks are strictly increasing', () => {
    const clock = new HLC()
    let previous = clock.tick()
    for (let index = 0; index < 128; index++) {
      const next = clock.tick(1, previous[1])
      assertEqual(clock.compare(previous, next), -1)
      previous = next
    }
  })

  runTest('compare orders by current timestamp only', () => {
    const clock = new HLC()
    const left = [
      [99, 99, 99, 99],
      [1, 0, 0, 0],
    ]
    const right = [CLOCK_START, [1, 0, 0, 1]]
    assertEqual(clock.compare(left, right), -1)
    assertEqual(clock.compare(right, left), 1)
    assertEqual(clock.compare(left, [CLOCK_START, [1, 0, 0, 0]]), 0)
  })

  runTest('compare checks lanes from most to least significant', () => {
    const clock = new HLC()
    const cases = [
      [
        [0, 0, 0, 1],
        [1, 0, 0, 0],
      ],
      [
        [1, 0, 0, 1],
        [1, 1, 0, 0],
      ],
      [
        [1, 1, 0, 1],
        [1, 1, 1, 0],
      ],
      [
        [1, 1, 1, 0],
        [1, 1, 1, 1],
      ],
    ]
    for (const [left, right] of cases)
      assertEqual(clock.compare([CLOCK_START, left], [CLOCK_START, right]), -1)
  })

  runTest('validate accepts CLOCK_START-linked timestamps', () => {
    assertEqual(new HLC().validate([CLOCK_START, [0, 1, 2, 3]]), true)
  })

  runTest('validate accepts timestamp-linked timestamps', () => {
    assertEqual(
      new HLC().validate([
        [0, 1, 2, 3],
        [4, 5, 6, 7],
      ]),
      true
    )
  })

  runTest('validate accepts uint32 boundary values', () => {
    assertEqual(
      new HLC().validate([
        [0, UINT32_MAX, 1, UINT32_MAX],
        [UINT32_MAX, 0, UINT32_MAX, 0],
      ]),
      true
    )
  })

  runTest('validate rejects malformed tuple shapes', () => {
    const clock = new HLC()
    for (const value of [
      null,
      undefined,
      1,
      'timestamp',
      {},
      [],
      [CLOCK_START],
      [CLOCK_START, [1, 2, 3, 4], []],
    ])
      assertEqual(clock.validate(value), false)
  })

  runTest('validate rejects malformed previous timestamps', () => {
    const clock = new HLC()
    for (const previous of [
      [1, 2, 3],
      [1, 2, 3, 4, 5],
      -1,
      '0',
      {},
      [1, 2, 3, -1],
      [1, 2, 3, UINT32_SIZE],
    ])
      assertEqual(clock.validate([previous, [1, 2, 3, 4]]), false)
  })

  runTest('validate rejects malformed current timestamps', () => {
    const clock = new HLC()
    for (const current of [
      [1, 2, 3],
      [1, 2, 3, 4, 5],
      -1,
      '0',
      {},
      [1, 2, 3, -1],
      [1, 2, 3, UINT32_SIZE],
    ])
      assertEqual(clock.validate([CLOCK_START, current]), false)
  })

  runTest('validate rejects non-integer numeric lanes', () => {
    const clock = new HLC()
    for (const lane of [NaN, Infinity, -Infinity, 1.5])
      assertEqual(clock.validate([CLOCK_START, [0, 0, 0, lane]]), false)
  })

  runTest('generated chains validate every link', () => {
    const clock = new HLC()
    let previous = CLOCK_START
    for (let index = 0; index < 64; index++) {
      const timestamp = clock.tick(index + 1, previous)
      assertEqual(clock.validate(timestamp), true)
      if (previous !== CLOCK_START) assertArrayEqual(timestamp[0], previous)
      previous = timestamp[1]
    }
  })

  return results
}

export function printResults(results) {
  const passed = results.tests.filter((test) => test.ok).length
  console.log(`${results.label}: ${passed}/${results.tests.length} passed`)
  if (!results.ok) {
    for (const error of results.errors)
      console.error(`  - ${error.name}: ${error.message}`)
  }
}

export function ensurePassing(results) {
  if (results.ok) return
  throw new Error(
    `${results.label} failed with ${results.errors.length} failing tests`
  )
}
