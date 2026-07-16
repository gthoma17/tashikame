import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'node:fs'

function envFromNetlifyToml() {
  const toml = readFileSync('netlify.toml', 'utf8')
  const env: Record<string, string> = {}
  const section = toml.match(/\[build\.environment\]([\s\S]*?)(?=\n\[|$)/)?.[1] ?? ''
  for (const line of section.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"([^"]*)"/)
    if (match) env[match[1]] = match[2]
  }
  return env
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: envFromNetlifyToml(),
  },
})
