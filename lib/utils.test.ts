import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("combina clases y resuelve conflictos de Tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold")
    expect(cn()).toBe("")
  })
})
