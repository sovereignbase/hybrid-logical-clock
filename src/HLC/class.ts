import { v7 } from 'uuid'
import type { Uint32UuidV7 } from '../.types/type.js'
import { isUint32, UINT32_SIZE } from '@sovereignbase/utils'

/**
 * Represents a hybrid logical clock backed by a UUIDv7 timestamp encoded as
 * four unsigned 32-bit integer lanes.
 */
export class HLC {
  /**
   * The current hybrid logical clock timestamp.
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

    // Reinterpret the 16 UUID bytes as four unsigned 32-bit lanes:
    // [first32bits, second32bits, third32bits, fourth32bits].
    this.time = [...new Uint32Array(seed.buffer)] as Uint32UuidV7
  }

  /**
   * Advances the current timestamp by the given clock advancement.
   *
   * The advancement is added to the fourth 32-bit lane. Overflow is carried into the
   * third, second, and first 32-bit lanes in that order.
   *
   * This method mutates {@link HLC.time} in place and returns the same array
   * instance.
   *
   * @param advancement - The clock advancement to add to the timestamp.
   * @returns The current timestamp after mutation.
   */
  tick(advancement: number = 1): Uint32UuidV7 {
    // Add the clock tick advancement to the fourth 32-bit lane.
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

    // Return the same UUIDv7 array instance after mutating it in place.
    return this.time
  }

  /**
   * Compares two UUIDv7 timestamps in lane order.
   *
   * @param left - The left timestamp.
   * @param right - The right timestamp.
   * @returns `-1` if `left` sorts before `right`, `1` if `left` sorts after
   * `right`, and `0` if both timestamps are equal.
   */
  compare(left: Uint32UuidV7, right: Uint32UuidV7): number {
    // Compare the four 32-bit lanes from highest significance to lowest.
    for (let index = 0; index < 4; index++) {
      // The left timestamp sorts before the right timestamp at this lane.
      if (left[index] < right[index]) return -1

      // The left timestamp sorts after the right timestamp at this lane.
      if (left[index] > right[index]) return 1
    }

    // All four 32-bit lanes are equal.
    return 0
  }

  /**
   * Determines whether the given value is a valid UUIDv7 timestamp encoded as
   * four unsigned 32-bit integer lanes.
   *
   * @param timestamp - The value to validate.
   * @returns `true` if `timestamp` is a valid {@link Uint32UuidV7}; otherwise
   * `false`.
   */
  validate(timestamp: unknown): timestamp is Uint32UuidV7 {
    // Assert the value is an array containing exactly four unsigned 32-bit lanes.
    return (
      Array.isArray(timestamp) &&
      timestamp.length === 4 &&
      timestamp.every(isUint32)
    )
  }
}
