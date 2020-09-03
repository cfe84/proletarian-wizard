import { makeFakeDeps } from "./FakeDeps"
import { fakeContext } from "./FakeContext"
import { Completion } from "../src/domain/Completion"
import * as should from "should"

describe("Completion", () => {
  // given
  const ctx = fakeContext()
  ctx.parsedFolder.attributes.push("attribute1", "attribute2", "due")
  ctx.parsedFolder.attributeValues = {
    "attribute1": ["value1", "value2", "something else"]
  }
  const completion = new Completion(ctx)

  context("attributes", () => {
    it("proposes all attributes", () => {
      const completions = completion.complete("This @", 6)
      should(completions).deepEqual(ctx.parsedFolder.attributes)
    })
    it("proposes corresponding attributes", () => {
      const completions = completion.complete("This @attr", 10)
      should(completions).containEql("attribute1")
      should(completions).containEql("attribute2")
      should(completions).not.containEql("due")
    })
    it("proposes corresponding attribute", () => {
      const completions = completion.complete("This @du", 8)
      should(completions).not.containEql("attribute1")
      should(completions).not.containEql("attribute2")
      should(completions).containEql("due")
    })
    it("ignores characters after the carret", () => {
      const completions = completion.complete("This @de", 7)
      should(completions).not.containEql("attribute1")
      should(completions).not.containEql("attribute2")
      should(completions).containEql("due")
    })
    it("proposes nothing if nothing matches", () => {
      const completions = completion.complete("This @de", 8)
      should(completions).be.empty()
    })
    it("doesn't propose for previous line", () => {
      const completions = completion.complete("This @d\nu", 9)
      should(completions).be.empty()
    })
  })
})