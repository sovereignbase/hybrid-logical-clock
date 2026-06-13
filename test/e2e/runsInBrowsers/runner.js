import * as api from '/dist/index.js'
import { printResults, runHLCSuite } from '../shared/suite.mjs'

const results = runHLCSuite(api, { label: 'browser esm' })
printResults(results)
window.__HLC_RESULTS__ = results
const status = document.getElementById('status')
if (status)
  status.textContent = results.ok ? 'ok' : 'failed: ' + results.errors.length
