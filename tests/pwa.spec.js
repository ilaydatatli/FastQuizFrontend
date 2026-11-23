import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Tests run from the repo root (npm run test); jsdom makes import.meta.url an http URL.
const file = (path) => resolve(process.cwd(), path)
const manifest = JSON.parse(readFileSync(file('public/manifest.webmanifest'), 'utf8'))

describe('PWA manifest', () => {
  it('has what browsers need to offer "install"', () => {
    expect(manifest.name).toBe('Fast Quiz')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    const sizes = manifest.icons.map((icon) => icon.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
  })

  it('points only at icons that exist', () => {
    for (const icon of manifest.icons) {
      expect(existsSync(file(`public${icon.src}`)), icon.src).toBe(true)
    }
  })

  it('uses the page background colour from the design system', () => {
    const css = readFileSync(file('src/styles/variables.css'), 'utf8')
    const bg = css.match(/--color-bg:\s*(#[0-9A-Fa-f]{6})/)[1]
    expect(manifest.background_color).toBe(bg)
    expect(manifest.theme_color).toBe(bg)
  })
})
