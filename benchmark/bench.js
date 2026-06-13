import { runBenchmarks } from './shared/runner.mjs'
import { run as performanceThroughput } from './performance/throughput/driver.mjs'
import { run as performanceLatency } from './performance/latency/driver.mjs'
import { run as efficiencyMemoryUse } from './efficiency/memory-use/driver.mjs'
import { run as efficiencyStorageUse } from './efficiency/storage-use/driver.mjs'
import { run as efficiencyCpuUse } from './efficiency/cpu-use/driver.mjs'
import { run as sizeBundleSize } from './size/bundle-size/driver.mjs'
import { run as sizeDependencyWeight } from './size/dependency-weight/driver.mjs'
import { run as scalabilityComplexityGrowth } from './scalability/complexity-growth/driver.mjs'
import { run as reliabilityCorrectness } from './reliability/correctness/driver.mjs'
import { run as reliabilityErrorHandling } from './reliability/error-handling/driver.mjs'
import { run as compatibilityRuntimeSupport } from './compatibility/runtime-support/driver.mjs'
import { run as compatibilityStandardsSupport } from './compatibility/standards-support/driver.mjs'
import { run as licensingLicenseFit } from './licensing/license-fit/driver.mjs'

await runBenchmarks([
  performanceThroughput,
  performanceLatency,
  efficiencyMemoryUse,
  efficiencyStorageUse,
  efficiencyCpuUse,
  sizeBundleSize,
  sizeDependencyWeight,
  scalabilityComplexityGrowth,
  reliabilityCorrectness,
  reliabilityErrorHandling,
  compatibilityRuntimeSupport,
  compatibilityStandardsSupport,
  licensingLicenseFit,
])
