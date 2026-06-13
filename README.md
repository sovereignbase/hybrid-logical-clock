[![npm version](https://img.shields.io/npm/v/@sovereignbase/hybrid-logical-clock)](https://www.npmjs.com/package/@sovereignbase/hybrid-logical-clock)
[![CI](https://github.com/sovereignbase/hybrid-logical-clock/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sovereignbase/hybrid-logical-clock/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/sovereignbase/hybrid-logical-clock/branch/master/graph/badge.svg)](https://codecov.io/gh/sovereignbase/hybrid-logical-clock)
[![license](https://img.shields.io/npm/l/@sovereignbase/hybrid-logical-clock)](LICENSE)

# hybrid-logical-clock

A timestamp model for ordering asynchronous events idempotently.

## Installation

```sh
npm install @sovereignbase/hybrid-logical-clock
# or
pnpm add @sovereignbase/hybrid-logical-clock
# or
yarn add @sovereignbase/hybrid-logical-clock
# or
bun add @sovereignbase/hybrid-logical-clock
# or
deno add jsr:@sovereignbase/hybrid-logical-clock
# or
vlt install jsr:@sovereignbase/hybrid-logical-clock
```

## Usage

```ts
import { HLC } from '@sovereignbase/hybrid-logical-clock'

const clock = new HLC()

const firstEvent = {
  type: 'profile.updated',
  timestamp: clock.tick(),
}

const secondEvent = {
  type: 'profile.updated',
  timestamp: clock.tick(1, firstEvent.timestamp[1]),
}
```

## Tests

```sh
npm run test
```

Current test results:

- Invariants: 20/20 passing.
- Runtime matrix: Node ESM/CJS, Bun ESM/CJS, Deno, Cloudflare Workers, Edge Runtime, browsers.
- Coverage: c8 enforces 100% statements, branches, functions, and lines.

| group         | result      |
| ------------- | ----------- |
| `constructor` | 1/1 passing |
| `tick`        | 8/8 passing |
| `compare`     | 2/2 passing |
| `validate`    | 7/7 passing |
| `exports`     | 1/1 passing |

## Benchmarks

```sh
npm run bench
```

Last measured on Node `v24.16.0` (`win32 x64`):

| group         | scenario          | result                                                                                |
| ------------- | ----------------- | ------------------------------------------------------------------------------------- |
| speed         | Throughput        | tick 13,560,866.59 ops/s; compare 52,307,821.07 ops/s; validate 7,927,121.22 ops/s    |
| speed         | Latency           | construct 4,724.54 ns/op; tick 61.88 ns/op; compare 27.97 ns/op; validate 49.62 ns/op |
| cost          | Memory use        | 8.45 MiB heap delta for 50,000 retained timestamps (177.28 B each)                    |
| cost          | Storage use       | dist 33.05 KiB; package metadata/docs 16.9 KiB                                        |
| cost          | CPU use           | 32 ms CPU for 500,000 ticks (64 ns CPU/op)                                            |
| size          | Bundle size       | esm 4.18 KiB (1.57 KiB gzip); cjs 4.37 KiB (1.63 KiB gzip); d.ts 3.38 KiB             |
| size          | Dependency weight | 2 direct production deps; direct package bytes 158.16 KiB; node_modules 281.16 MiB    |
| growth        | Complexity growth | 138.4 ns/op at 1,000 ticks; 48.53 ns/op at 100,000 ticks; 0.35x ratio                 |
| checks        | Correctness       | 1999/1999 generated-chain checks passed                                               |
| checks        | Error handling    | 9/9 invalid inputs rejected without throwing                                          |
| compatibility | Runtime support   | esm ok; cjs ok; web primitives 3/3                                                    |
| compatibility | Standards support | UUIDv7 version nibble ok; RFC variant bits ok; uint32 lanes ok                        |
| licensing     | License fit       | package Apache-2.0; dependency licenses 2/2 known                                     |

Results vary by machine.

## License

Apache-2.0
