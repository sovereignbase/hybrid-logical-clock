/**
 * An RFC 9562 UUID version 7 represented as four unsigned 32-bit integer lanes.
 *
 * The lanes are ordered from highest significance to lowest significance:
 * `[first32bits, second32bits, third32bits, fourth32bits]`.
 */
export type Uint32UuidV7 = [number, number, number, number]
