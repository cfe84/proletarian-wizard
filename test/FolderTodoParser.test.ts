import * as should from "should"
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import { TodoItem, TodoStatus } from "../src/domain/TodoItem"
import { FolderTodoParser } from "../src/domain/FolderTodoParser"

describe("FolderTodoParser", () => {
  // given
  const rootFolder = "."
  const deps = makeFakeDeps()
  td.when(deps.fs.lstatSync(rootFolder)).thenReturn({ isDirectory: () => true })
  td.when(deps.fs.readdirSync(rootFolder)).thenReturn(["file.md", "folder", "file.txt"])
  td.when(deps.fs.lstatSync(".|file.md")).thenReturn({ isDirectory: () => false })
  td.when(deps.fs.lstatSync(".|file.txt")).thenReturn({ isDirectory: () => false })
  td.when(deps.fs.readFileSync(".|file.md")).thenReturn(new Buffer(`[ ] A todo todo
not a todo
[x] a completed todo`))
  td.when(deps.fs.readFileSync(".|file.txt")).thenReturn(new Buffer(`[ ] A todo that should not be loaded`))
  td.when(deps.fs.lstatSync(".|folder")).thenReturn({ isDirectory: () => true })
  td.when(deps.fs.readdirSync(".|folder")).thenReturn(["file2.md"])
  td.when(deps.fs.lstatSync(".|folder|file2.md")).thenReturn({ isDirectory: () => false })
  td.when(deps.fs.readFileSync(".|folder|file2.md")).thenReturn(new Buffer(`[-] An in progress todo
  not a todo again
  [d] a delegated todo`))

  // when
  const parser = new FolderTodoParser(deps)
  const todos = parser.parseFolder(rootFolder)

  // then
  it("should load normal todo", () => should(todos).containEql({ status: TodoStatus.Todo, text: "A todo todo" }))
  it("should skip non md files", () => should(todos).not.containEql({ status: TodoStatus.Todo, text: "A todo that should not be loaded" }))
  it("should load completed todo", () => should(todos).containEql({ status: TodoStatus.Complete, text: "a completed todo" }))
  it("should load in progress todo from subfolder", () => should(todos).containEql({ status: TodoStatus.InProgress, text: "An in progress todo" }))
  it("should load delegated todo from subfolder", () => should(todos).containEql({ status: TodoStatus.Delegated, text: "a delegated todo" }))
})