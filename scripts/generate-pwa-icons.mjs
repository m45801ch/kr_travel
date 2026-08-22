import fs from 'node:fs'
import zlib from 'node:zlib'

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const body = Buffer.concat([name, data])
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(body))
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  return Buffer.concat([length, body, checksum])
}

function icon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const center = size / 2
  const radius = size * .29
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - center
      const dy = y - center
      const distance = Math.sqrt(dx * dx + dy * dy)
      const i = (y * size + x) * 4
      const isCircle = distance < radius
      const isHead = ((x - center) ** 2 + (y - size * .39) ** 2) < (size * .12) ** 2
      const isBody = x > size * .35 && x < size * .65 && y > size * .43 && y < size * .68
      const isTrip = isHead || isBody
      pixels[i] = isCircle ? 239 : 255
      pixels[i + 1] = isCircle ? 132 : 250
      pixels[i + 2] = isCircle ? 144 : 240
      pixels[i + 3] = 255
      if (isTrip) {
        pixels[i] = 255; pixels[i + 1] = 243; pixels[i + 2] = 233
      }
    }
  }
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4)
  header[8] = 8; header[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

fs.mkdirSync('public/icons', { recursive: true })
for (const size of [192, 512]) fs.writeFileSync(`public/icons/icon-${size}.png`, icon(size))
