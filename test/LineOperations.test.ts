import * as should from "should"
import { LineOperations } from "../src/domain/LineOperations"
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import { TodoItem, TodoStatus } from "../src/domain/TodoItem"

interface ITestCase {
  description: string
  input: string
  expected: string
}

describe("LineOperations", () => {
  const deps = makeFakeDeps()
  const lineOperations = new LineOperations(deps)
  td.when(deps.date.todayAsYMDString()).thenReturn("TODAY")

  const runTestCases = (testCases: ITestCase[], func: (line: string) => string) =>
    testCases.forEach((testCase) => {
      it(testCase.description, () => {
        const testResult = func(testCase.input)
        should(testResult).equal(testCase.expected)
      })
    })

  describe("Add date", () => {
    const testCases = [
      { description: "adds date to regular line", input: "this just tells something", expected: "TODAY: this just tells something" },
      { description: "adds date to line with dash", input: "- this just tells something", expected: "- TODAY: this just tells something" },
      { description: "adds date to line with multi dash", input: "- - just tells something", expected: "- TODAY: - just tells something" },
      { description: "adds date to line with dash and indent", input: "  - this just tells something", expected: "  - TODAY: this just tells something" },
      { description: "adds date to line with star and indent", input: "  * this just tells something", expected: "  * TODAY: this just tells something" },
      { description: "adds date to line with checkmark", input: "[ ] this just tells something", expected: "[ ] TODAY: this just tells something" },
      { description: "adds date to line with checkmark and dash", input: "  - [ ] this just tells something", expected: "  - [ ] TODAY: this just tells something" },
      { description: "replace date with today", input: "  - [x] 2020-01-01: this just tells something", expected: "  - [x] TODAY: this just tells something" },
      { description: "replace partial date with today", input: "  - [ ] 01-01: this just tells something", expected: "  - [ ] TODAY: this just tells something" },

    ]
    runTestCases(testCases, (line) => lineOperations.addDate(line))
  })

  describe("Toggle todo", () => {
    const testCases = [
      { description: "adds empty checkbox", input: "this just tells something", expected: "[ ] this just tells something" },
      { description: "removes empty checkbox", input: "[ ] this just tells something", expected: "this just tells something" },
      { description: "adds empty checkbox to list item", input: " - this just tells something", expected: " - [ ] this just tells something" },
      { description: "adds empty checkbox to list item with date", input: " - 2020-01-02: this just tells something", expected: " - [ ] 2020-01-02: this just tells something" },
      { description: "removes empty checkbox to list item with date", input: " - [ ] 2020-01-02: this just tells something", expected: " - 2020-01-02: this just tells something" },
      { description: "removes checked checkbox to list item with date", input: " - [x] 2020-01-02: this just tells something", expected: " - 2020-01-02: this just tells something" },
    ]
    runTestCases(testCases, (line) => lineOperations.toggleTodo(line))
  })


  describe("Set checkmark", () => {
    const testCases = [
      { description: "adds checkmark", input: "this just tells something", expected: "[X] this just tells something" },
      { description: "adds mark to checkbox", input: "[ ] this just tells something", expected: "[X] this just tells something" },
      { description: "replaces mark", input: " - [D] this just tells something", expected: " - [X] this just tells something" },
      { description: "keeps mark in date", input: " - [X] 2020-01-02: this just tells something", expected: " - [X] 2020-01-02: this just tells something" },
    ]
    runTestCases(testCases, (line) => lineOperations.setCheckmark(line, "X"))
  })

  interface TodoParsingTestCase {
    description: string,
    input: string,
    expected: TodoItem | null
  }

  describe("Parses todo:", () => {
    const testCases: TodoParsingTestCase[] = [
      { description: "not a todo", input: "this is not a todo", expected: null },
      { description: "A todo to do", input: "[ ] Todo to do", expected: { status: TodoStatus.Todo, text: "Todo to do", file: "" } },
      { description: "A completed todo", input: "[x] Todo", expected: { status: TodoStatus.Complete, text: "Todo", file: "" } },
      { description: "A delegated todo", input: "[d] Todo", expected: { status: TodoStatus.Delegated, text: "Todo", file: "" } },
      { description: "An in progress todo", input: "[-] Todo", expected: { status: TodoStatus.InProgress, text: "Todo", file: "" } },
      { description: "A cancelled todo", input: "[] Todo", expected: { status: TodoStatus.Cancelled, text: "Todo", file: "" } },
    ]

    testCases.forEach((testCase) => {
      it(testCase.description, () => {
        const parsed = lineOperations.toTodo(testCase.input)
        should(parsed).deepEqual(testCase.expected)
      })
    })
  })
})
