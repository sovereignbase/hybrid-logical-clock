export const CLOCK_START = 0 as const

/**
 * The sentinel value used when a hybrid logical clock timestamp has no
 * previous timestamp.
 */
export type ClockStart = typeof CLOCK_START

/**
 * An RFC 9562 UUID version 7 represented as four unsigned 32-bit integer lanes.
 *
 * The lanes are ordered from highest significance to lowest significance:
 * `[first32bits, second32bits, third32bits, fourth32bits]`.
 */
export type Uint32UuidV7 = [number, number, number, number]

/**
 * The previous timestamp in a hybrid logical clock chain.
 *
 * `CLOCK_START` marks the beginning of the clock chain.
 */
export type PreviousTimestamp = Uint32UuidV7 | ClockStart

/**
 * A hybrid logical clock timestamp.
 *
 * The first item references the previous timestamp, or `CLOCK_START` when this
 * is the first timestamp in the chain.
 *
 * The second item is this UUIDv7 timestamp.
 */
export type HLCTimestamp = [
  previousTimestamp: PreviousTimestamp,
  thisTimestamp: Uint32UuidV7,
]
