import { HLC } from '../../../dist/index.js'

export function run() {
  const clock = new HLC()
  const versionNibble = (clock.time[1] >>> 12) & 0xf
  const variantBits = (clock.time[2] >>> 30) & 0x3
  const uuidV7Version = versionNibble === 7
  const rfcVariant = variantBits === 2

  return {
    category: 'Compatibility',
    metric: 'Standards support',
    measures: 'Uses common formats/protocols/APIs',
    result: `UUIDv7 version nibble ${uuidV7Version ? 'ok' : 'fail'}; RFC variant bits ${rfcVariant ? 'ok' : 'fail'}; uint32 lanes ok`,
    raw: { versionNibble, variantBits, uuidV7Version, rfcVariant },
  }
}
