import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '..', '.env')

function parseEnvLine(line) {
  const trimmedLine = line.trim()

  if (!trimmedLine || trimmedLine.startsWith('#')) {
    return null
  }

  const separatorIndex = trimmedLine.indexOf('=')

  if (separatorIndex === -1) {
    return null
  }

  const key = trimmedLine.slice(0, separatorIndex).trim()
  let value = trimmedLine.slice(separatorIndex + 1).trim()

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  return { key, value }
}

if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf8')
  const logicalLines = []
  let currentLine = ''
  let quote = null

  for (const line of envFile.split(/\r?\n/)) {
    if (!currentLine) {
      currentLine = line
    } else {
      currentLine += `\n${line}`
    }

    const trimmedLine = currentLine.trim()

    if (!quote) {
      const separatorIndex = trimmedLine.indexOf('=')
      const value = separatorIndex === -1 ? '' : trimmedLine.slice(separatorIndex + 1).trim()

      if ((value.startsWith('"') && !value.endsWith('"')) || (value.startsWith("'") && !value.endsWith("'"))) {
        quote = value[0]
        continue
      }
    } else if (!trimmedLine.endsWith(quote)) {
      continue
    }

    logicalLines.push(currentLine)
    currentLine = ''
    quote = null
  }

  if (currentLine) {
    logicalLines.push(currentLine)
  }

  for (const line of logicalLines) {
    const parsedLine = parseEnvLine(line)

    if (parsedLine && !process.env[parsedLine.key]) {
      process.env[parsedLine.key] = parsedLine.value
    }
  }
}
