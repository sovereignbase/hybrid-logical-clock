import test from 'node:test'
import * as api from '../../dist/index.js'
import {
  ensurePassing,
  printResults,
  runHLCSuite,
} from '../e2e/shared/suite.mjs'

test('HLC upholds every timestamp invariant', () => {
  const results = runHLCSuite(api, { label: 'unit' })
  printResults(results)
  ensurePassing(results)
})
