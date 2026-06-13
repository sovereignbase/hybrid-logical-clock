import * as api from '../../../dist/index.js'
import { ensurePassing, printResults, runHLCSuite } from '../shared/suite.mjs'

const results = runHLCSuite(api, { label: 'deno esm' })
printResults(results)
ensurePassing(results)
