import { v7 } from 'uuid'
import {
  CLOCK_START,
  type HLCTimestamp,
  type PreviousTimestamp,
  type Uint32UuidV7,
} from '../.types/type.js'
import { isUint32, UINT32_SIZE } from '@sovereignbase/utils'

/**
 * Represents a hybrid logical clock backed by a UUIDv7 timestamp encoded as
 * four unsigned 32-bit integer lanes.
 */
export class HLC {
  /**
   * The current UUIDv7 timestamp.
   *
   * The timestamp is stored as four unsigned 32-bit lanes ordered from highest
   * significance to lowest significance:
   *
   * `[first32bits, second32bits, third32bits, fourth32bits]`
   */
  public readonly time: Uint32UuidV7

  /**
   * Creates a new hybrid logical clock seeded with a UUIDv7 timestamp.
   */
  constructor() {
    // Prepare 16 bytes of memory for one UUIDv7 value.
    const seed = new Uint8Array(16)

    // Allocate one UUIDv7 value into the prepared byte buffer.
    void v7(undefined, seed)

    // Read the UUID bytes as four big-endian unsigned 32-bit lanes:
    // [first32bits, second32bits, third32bits, fourth32bits].
    const view = new DataView(seed.buffer)

    this.time = [
      view.getUint32(0, false),
      view.getUint32(4, false),
      view.getUint32(8, false),
      view.getUint32(12, false),
    ]
  }

  /**
   * Advances the current timestamp by the given clock advancement.
   *
   * The advancement is added to the fourth 32-bit lane. Overflow is carried into
   * the third, second, and first 32-bit lanes in that order.
   *
   * This method mutates {@link HLC.time} in place and returns an HLC timestamp
   * linking the previous timestamp to a stable copy of this timestamp.
   *
   * @param advancement - The clock advancement to add to the timestamp.
   * @param previousTimestamp - The previous timestamp, or `CLOCK_START` when
   * this is the first timestamp.
   * @returns The linked hybrid logical clock timestamp.
   */
  tick(
    advancement: number = 1,
    previousTimestamp: PreviousTimestamp = CLOCK_START
  ): HLCTimestamp {
    // Add the clock advancement to the fourth 32-bit lane.
    let next32bits = this.time[3] + advancement

    // Store the lowest 32 bits back in the fourth 32-bit lane.
    this.time[3] = next32bits >>> 0

    // Carry any overflow from the fourth 32-bit lane into the third 32-bit lane.
    next32bits = this.time[2] + Math.floor(next32bits / UINT32_SIZE)

    // Store the lowest 32 bits back in the third 32-bit lane.
    this.time[2] = next32bits >>> 0

    // Carry any overflow from the third 32-bit lane into the second 32-bit lane.
    next32bits = this.time[1] + Math.floor(next32bits / UINT32_SIZE)

    // Store the lowest 32 bits back in the second 32-bit lane.
    this.time[1] = next32bits >>> 0

    // Carry any overflow from the second 32-bit lane into the first 32-bit lane.
    next32bits = this.time[0] + Math.floor(next32bits / UINT32_SIZE)

    // Store the lowest 32 bits back in the first 32-bit lane.
    this.time[0] = next32bits >>> 0

    // Copy this timestamp so returned HLC timestamps remain stable after later ticks.
    const thisTimestamp: Uint32UuidV7 = [
      this.time[0],
      this.time[1],
      this.time[2],
      this.time[3],
    ]

    // Return the previous timestamp and this stable UUIDv7 timestamp.
    return [previousTimestamp, thisTimestamp]
  }

  /**
   * Compares two hybrid logical clock timestamps by their UUIDv7 timestamp.
   *
   * Use this only when both timestamps have the same previous timestamp.
   *
   * @param left - The left timestamp.
   * @param right - The right timestamp.
   * @returns `-1` if `left` is before `right` in logical time, `1` if `left`
   * is after `right` in logical time, and `0` if both timestamps are equal.
   */
  compare(left: HLCTimestamp, right: HLCTimestamp): number {
    // Read the current UUIDv7 timestamp from each HLC timestamp.
    const leftTimestamp = left[1]
    const rightTimestamp = right[1]

    // Compare the four 32-bit lanes from highest significance to lowest.
    for (let index = 0; index < 4; index++) {
      // The left timestamp sorts before the right timestamp at this lane.
      if (leftTimestamp[index] < rightTimestamp[index]) return -1

      // The left timestamp sorts after the right timestamp at this lane.
      if (leftTimestamp[index] > rightTimestamp[index]) return 1
    }

    // All four 32-bit lanes are equal.
    return 0
  }

  /**
   * Determines whether the given value is a valid hybrid logical clock
   * timestamp.
   *
   * @param timestamp - The value to validate.
   * @returns `true` if `timestamp` is a valid {@link HLCTimestamp}; otherwise
   * `false`.
   */
  validate(timestamp: unknown): timestamp is HLCTimestamp {
    // Assert the value is a two-item HLC timestamp tuple.
    if (!Array.isArray(timestamp) || timestamp.length !== 2) return false

    // Read the previous timestamp and this timestamp from the tuple.
    const [previousTimestamp, thisTimestamp] = timestamp

    // Assert the previous timestamp is either CLOCK_START or a UUIDv7 timestamp.
    const previousTimestampIsValid =
      previousTimestamp === CLOCK_START ||
      this.validateUint32UuidV7(previousTimestamp)

    // Assert this timestamp is a UUIDv7 timestamp.
    return previousTimestampIsValid && this.validateUint32UuidV7(thisTimestamp)
  }

  /**
   * Determines whether the given value is a UUIDv7 timestamp encoded as four
   * unsigned 32-bit integer lanes.
   *
   * @param timestamp - The value to validate.
   * @returns `true` if `timestamp` is a valid {@link Uint32UuidV7}; otherwise
   * `false`.
   */
  private validateUint32UuidV7(timestamp: unknown): timestamp is Uint32UuidV7 {
    // Assert the value is an array containing exactly four unsigned 32-bit lanes.
    return (
      Array.isArray(timestamp) &&
      timestamp.length === 4 &&
      timestamp.every(isUint32)
    )
  }
}
