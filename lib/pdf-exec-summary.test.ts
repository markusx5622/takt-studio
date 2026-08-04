import { describe, it, expect } from "vitest"
import { createTranslator } from "next-intl"
import esMessages from "../messages/es.json"
import enMessages from "../messages/en.json"

describe("PDF Executive Summary Translator Test", () => {
  it("interpolates all placeholders in ES execPass and execFail without leaving { or }", () => {
    const tEs = createTranslator({ locale: "es", messages: esMessages, namespace: "simulator.pdf" })

    const execValues = {
      demand: "30",
      throughput: "39",
      delta: "9",
      bottleneck: "Alicatado y revestimientos cerámicos",
      bottleneckTime: "12.0",
      efficiency: "85",
      gap: "0",
    }

    const resPass = tEs("execPass", execValues)
    const resFail = tEs("execFail", execValues)

    console.log("ES Pass:", resPass)
    console.log("ES Fail:", resFail)

    expect(resPass).not.toContain("{")
    expect(resPass).not.toContain("}")
    expect(resPass).toContain("Alicatado y revestimientos cerámicos")

    expect(resFail).not.toContain("{")
    expect(resFail).not.toContain("}")
    expect(resFail).toContain("Alicatado y revestimientos cerámicos")
  })

  it("interpolates all placeholders in EN execPass and execFail without leaving { or }", () => {
    const tEn = createTranslator({ locale: "en", messages: enMessages, namespace: "simulator.pdf" })

    const execValues = {
      demand: "30",
      throughput: "39",
      delta: "9",
      bottleneck: "Tiling and ceramic wall cladding",
      bottleneckTime: "12.0",
      efficiency: "85",
      gap: "0",
    }

    const resPass = tEn("execPass", execValues)
    const resFail = tEn("execFail", execValues)

    console.log("EN Pass:", resPass)
    console.log("EN Fail:", resFail)

    expect(resPass).not.toContain("{")
    expect(resPass).not.toContain("}")
    expect(resPass).toContain("Tiling and ceramic wall cladding")

    expect(resFail).not.toContain("{")
    expect(resFail).not.toContain("}")
    expect(resFail).toContain("Tiling and ceramic wall cladding")
  })
})
