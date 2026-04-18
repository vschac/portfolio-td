#!/usr/bin/env node
/**
 * Builds src/assets/gallery.json from the photos in src/assets/gallery/.
 *
 * For each photo:
 *  - samples a 48x48 average color → derives a quiet accent hex
 *  - reads dimensions → aspect ratio
 *  - emits an 800px-wide webp thumbnail to src/assets/gallery-thumbs/
 *
 * Sorts by lightness (dark → bright) so the gallery reads as a tonal
 * progression.
 *
 * Run manually whenever you add, remove, or replace photos:
 *   npm run gallery:build
 */
import { readdir, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GALLERY_DIR = join(ROOT, 'src', 'assets', 'gallery')
const THUMB_DIR = join(ROOT, 'src', 'assets', 'gallery-thumbs')
const OUTPUT = join(ROOT, 'src', 'assets', 'gallery.json')

const EXTS = /\.(jpe?g|png|webp|avif|svg)$/i
const THUMB_WIDTH = 800
const THUMB_QUALITY = 78

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return [h, s, l]
}

function hslToHex(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  let r, g, b
  if (s === 0) r = g = b = l
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

async function analyze(file) {
  const path = join(GALLERY_DIR, file)
  const img = sharp(path, { failOnError: false }).rotate()
  const meta = await img.metadata()
  // EXIF orientations 5–8 involve a 90° rotation; sharp.metadata() returns
  // the pre-rotation dimensions, so swap them to match what the browser sees.
  const orientation = meta.orientation ?? 1
  const swap = orientation >= 5 && orientation <= 8
  const width = (swap ? meta.height : meta.width) ?? 1
  const height = (swap ? meta.width : meta.height) ?? 1

  // 48x48 swatch → average color → accent hex
  const { data } = await img
    .clone()
    .resize(48, 48, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let r = 0, g = 0, b = 0, n = 0
  for (let i = 0; i < data.length; i += 3) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
  }
  r /= n; g /= n; b /= n

  const [h, s, l] = rgbToHsl(r, g, b)
  const hex = hslToHex(h, Math.min(s * 1.2, 0.55), 0.5)

  // 800px-wide webp thumbnail for the mosaic
  const thumbFile = file.replace(/\.[^.]+$/, '.webp')
  await img
    .clone()
    .rotate() // respect EXIF orientation
    .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toFile(join(THUMB_DIR, thumbFile))

  return {
    file,
    thumb: thumbFile,
    ratio: Number((width / height).toFixed(4)),
    l: Number(l.toFixed(4)),
    hex,
  }
}

async function main() {
  const files = (await readdir(GALLERY_DIR))
    .filter(f => EXTS.test(f))
    .sort()

  if (files.length === 0) {
    console.warn(`[gallery] no photos found in ${GALLERY_DIR}`)
    await writeFile(OUTPUT, JSON.stringify({ photos: [] }, null, 2))
    return
  }

  console.log(`[gallery] analyzing ${files.length} photos...`)
  const start = Date.now()

  // Rebuild thumbs fresh each run — keeps the dir in sync with the source.
  await rm(THUMB_DIR, { recursive: true, force: true })
  await mkdir(THUMB_DIR, { recursive: true })

  const photos = []
  for (const file of files) {
    try {
      const info = await analyze(file)
      photos.push(info)
      console.log(`  ${file}  →  ${info.thumb}  l=${info.l.toFixed(2)}  ${info.hex}`)
    } catch (err) {
      console.error(`  ${file}  ERROR: ${err.message}`)
    }
  }

  // Sort dark → bright. This becomes the canonical display order.
  photos.sort((a, b) => a.l - b.l)

  await writeFile(OUTPUT, JSON.stringify({ photos }, null, 2))
  console.log(`\n[gallery] wrote ${photos.length} entries to ${OUTPUT}  (${Date.now() - start}ms)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
