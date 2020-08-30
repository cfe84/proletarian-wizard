import * as should from "should"
import { LineOperations } from "../src/domain/LineOperations"
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"

describe("LineOperations", () => {
  const deps = makeFakeDeps()
  const lineOperations = new LineOperations(deps)
  td.when(deps.date.todayAsYMDString()).thenReturn("TODAY")

  describe("Add date", () => {
    const testCases = [
      { description: "adds date to regular line", input: "this just tells something", expected: "TODAY: this just tells something" },
      { description: "adds date to line with dash", input: "- this just tells something", expected: "- TODAY: this just tells something" },
      { description: "adds date to line with multi dash", input: "- - just tells something", expected: "- TODAY: - just tells something" },
      { description: "adds date to line with dash and indent", input: "  - this just tells something", expected: "  - TODAY: this just tells something" },
      { description: "adds date to line with star and indent", input: "  * this just tells something", expected: "  * TODAY: this just tells something" },
      { description: "adds date to line with checkmark", input: "[ ] this just tells something", expected: "[ ] TODAY: this just tells something" },
      { description: "adds date to line with checkmark and dash", input: "  - [ ] this just tells something", expected: "  - [ ] TODAY: this just tells something" },
      { description: "replace date with today", input: "  - [ ] 2020-01-01: this just tells something", expected: "  - [ ] TODAY: this just tells something" },
      { description: "replace partial date with today", input: "  - [ ] 01-01: this just tells something", expected: "  - [ ] TODAY: this just tells something" },

    ]
    testCases.forEach((testCase) => {
      it(testCase.description, () => {
        const testResult = lineOperations.addDate(testCase.input)
        should(testResult).equal(testCase.expected)
      })
    })
  })
})
