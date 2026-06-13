import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as api from '../dist/index.js'
import { runHLCSuite } from '../test/e2e/shared/suite.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readmePath = resolve(root, 'README.md')

function replaceSection(content, commandBlock, nextHeading, body) {
  const match = content.match(commandBlock)
  const eol = content.includes('\r\n') ? '\r\n' : '\n'

  if (!match) throw new Error(`missing README command block: ${commandBlock}`)

  const start = match.index + match[0].length
  const end = content.indexOf(nextHeading, start)

  if (end === -1) throw new Error(`missing README heading: ${nextHeading}`)

  return `${content.slice(0, start)}${eol}${eol}${body.replaceAll('\n', eol)}${eol}${eol}${content.slice(end)}`
}

function table(rows) {
  const widths = rows[0].map((_, column) =>
    Math.max(...rows.map((row) => row[column].length))
  )

  return rows
    .map((row, index) => {
      const cells = row.map((cell, column) => cell.padEnd(widths[column]))
      const line = `| ${cells.join(' | ')} |`
      if (index !== 0) return line
      const separator = `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`
      return `${line}\n${separator}`
    })
    .join('\n')
}

function renderTestsBody() {
  const results = runHLCSuite(api, { label: 'README' })
  const passed = results.tests.filter((entry) => entry.ok).length
  const groups = [
    ['constructor', /^constructor /],
    ['tick', /^tick |^sequential ticks|^generated chains/],
    ['compare', /^compare /],
    ['validate', /^validate /],
    ['exports', /^exports /],
  ].map(([name, pattern]) => {
    const tests = results.tests.filter((entry) => pattern.test(entry.name))
    return { name, tests }
  })

  return [
    'Current test results:',
    '',
    `- Invariants: ${passed}/${results.tests.length} passing.`,
    '- Runtime matrix: Node ESM/CJS, Bun ESM/CJS, Deno, Cloudflare Workers, Edge Runtime, browsers.',
    '- Coverage: c8 enforces 100% statements, branches, functions, and lines.',
    '',
    table([
      ['group', 'result'],
      ...groups.map((group) => {
        const groupPassed = group.tests.filter((entry) => entry.ok).length
        return [
          `\`${group.name}\``,
          `${groupPassed}/${group.tests.length} passing`,
        ]
      }),
    ]),
  ].join('\n')
}

function splitBenchmark(row) {
  const names = {
    Performance: 'speed',
    Efficiency: 'cost',
    Size: 'size',
    Scalability: 'growth',
    Reliability: 'checks',
    Compatibility: 'compatibility',
    Licensing: 'licensing',
  }

  return [
    names[row.category] ?? row.category.toLowerCase(),
    row.metric,
    row.result,
  ]
}

function renderBenchmarksBody() {
  const result = spawnSync(
    process.execPath,
    [resolve(root, 'benchmark', 'bench.js'), '--json'],
    { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )

  if (result.status !== 0) {
    throw new Error(`benchmark failed:\n${result.stderr || result.stdout}`)
  }

  const report = JSON.parse(result.stdout)
  const rows = report.rows.map(splitBenchmark)

  return [
    `Last measured on Node \`${report.node}\` (\`${report.platform} ${report.arch}\`):`,
    '',
    table([['group', 'scenario', 'result'], ...rows]),
    '',
    'Results vary by machine.',
  ].join('\n')
}

function main() {
  const flags = new Set(process.argv.slice(2))
  const checkOnly = flags.has('--check')
  const skipBench = flags.has('--no-bench') || checkOnly
  const original = readFileSync(readmePath, 'utf8')

  let updated = replaceSection(
    original,
    /```sh\r?\nnpm run test\r?\n```/,
    '## Benchmarks',
    renderTestsBody()
  )

  if (!skipBench) {
    updated = replaceSection(
      updated,
      /```sh\r?\nnpm run bench\r?\n```/,
      '## License',
      renderBenchmarksBody()
    )
  }

  if (checkOnly) {
    if (updated !== original) {
      console.error(
        'README is out of date. Run: node scripts/update-readme.mjs'
      )
      process.exit(1)
    }

    console.log('README is up to date.')
    return
  }

  writeFileSync(readmePath, updated)
  console.log(`Updated README ${skipBench ? 'tests' : 'tests and benchmarks'}.`)
}

main()
