import * as should from "should"
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import { TodoItem, TodoStatus } from "../src/domain/TodoItem"
import { FolderTodoParser } from "../src/domain/FolderTodoParser"
import { IContext } from "../src/contract/IContext"
const ctx: IContext = {
  rootFolder: "ROOT", todos: [], config: {
    folders: {
      inbox: "INBOX",
      archive: "ARCHIVE",
      projects: "PROJECTS",
      recurrences: "RECURRENCES",
      reference: "REFERENCE"
    }
  }
}
describe("FolderTodoParser", () => {
  context("Hierarchy", () => {
    // given
    const rootFolder = "ROOT"
    const deps = makeFakeDeps()

    td.when(deps.fs.lstatSync(rootFolder)).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync(rootFolder)).thenReturn(["file.md", "PROJECTS|2020-01-02 - Something", "file.txt"])
    td.when(deps.fs.lstatSync("ROOT|file.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.lstatSync("ROOT|file.txt")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|file.md")).thenReturn(new Buffer(`[ ] A todo todo
not a todo
[x] a completed todo`))
    td.when(deps.fs.readFileSync("ROOT|file.txt")).thenReturn(new Buffer(`[ ] A todo that should not be loaded`))
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn(["file2.md"])
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn(new Buffer(`[-] An in progress todo
not a todo again
[d] a delegated todo`))

    // when
    const parser = new FolderTodoParser(deps, ctx)
    const todos = parser.parseFolder(rootFolder)

    // then
    it("should load normal todo", () => should(todos).containEql({ status: TodoStatus.Todo, text: "A todo todo", file: "ROOT|file.md", project: "", folderType: "" }))
    it("should skip non md files", () => should(todos).not.containEql({ status: TodoStatus.Todo, text: "A todo that should not be loaded", file: "ROOT|file.txt", project: "", folderType: "" }))
    it("should load completed todo", () => should(todos).containEql({ status: TodoStatus.Complete, text: "a completed todo", file: "ROOT|file.md", project: "", folderType: "" }))
    it("should load in progress todo from subfolder", () => should(todos).containEql({ status: TodoStatus.InProgress, text: "An in progress todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something" }))
    it("should load delegated todo from subfolder", () => should(todos).containEql({ status: TodoStatus.Delegated, text: "a delegated todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something" }))
  })
  context("No content", () => {
    // given
    const rootFolder = "ROOT"
    const deps = makeFakeDeps()
    td.when(deps.fs.lstatSync(rootFolder)).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync(rootFolder)).thenReturn(["file.md"])
    td.when(deps.fs.lstatSync("ROOT|file.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|file.md")).thenReturn(new Buffer(`This is just
    content`))

    // when
    const parser = new FolderTodoParser(deps, ctx)
    const todos = parser.parseFolder(rootFolder)

    // then
    it("should load empty todos", () => should(todos).have.length(0))
  })
})