import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

function getNestedKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const newPath = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value as Record<string, unknown>, newPath))
    } else {
      keys.push(newPath)
    }
  }
  return keys
}

describe("i18n Key Parity Test (es.json vs en.json)", () => {
  it("ensures recursive key paths are 100% identical between es.json and en.json", () => {
    const esPath = path.join(process.cwd(), "messages/es.json")
    const enPath = path.join(process.cwd(), "messages/en.json")

    const esContent = JSON.parse(fs.readFileSync(esPath, "utf-8"))
    const enContent = JSON.parse(fs.readFileSync(enPath, "utf-8"))

    const esKeys = getNestedKeys(esContent).sort()
    const enKeys = getNestedKeys(enContent).sort()

    expect(esKeys).toEqual(enKeys)
  })
})
