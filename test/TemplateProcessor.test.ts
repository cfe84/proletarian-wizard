import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import * as should from "should"
import { TemplateProcessor } from "../src/domain/TemplateProcessor"


describe("Template processor", () => {
  context("Variable name extract", () => {
    // given
    const template = `---
title: $\{NAME\}
---

# $\{TITLE\} and $\{SOMETHING_ ELSE!-\}

A variable in the mid$\{le\}of a word
`
    const processor = new TemplateProcessor()
    // when
    const variables = processor.getTemplateVariables(template)
    // then
    it("should load variable in front matter", () => should(variables).containEql("NAME"))
    it("should load variable in header", () => {
      should(variables).containEql("TITLE")
      should(variables).containEql("SOMETHING_ ELSE!-")
    })
    it("should load variable in middle of word", () => should(variables).containEql("le"))
  })

  context("Variable replacement", () => {
    // given
    const template = `---
title: $\{NAME\}
---

# $\{NAME\} and $\{other\}
A variable in the mid$\{le\}of a word
`
    const variables = ["NAME", "other", "le"]
    const values = { NAME: "N_VALUE", other: "OTHER_VALUE", le: "bla" }
    const processor = new TemplateProcessor()
    // when
    const rendered = processor.replaceVariables(template, variables, values)
    // then
    const expected = `---
title: N_VALUE
---

# N_VALUE and OTHER_VALUE
A variable in the midblaof a word
`
    it("should replace adequately", () => should(rendered).eql(expected))
  })
})