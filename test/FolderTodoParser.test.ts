import * as should from "should"
import { fakeContext } from "./FakeContext"
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import { TodoItem, TodoStatus } from "../src/domain/TodoItem"
import { FolderTodoParser } from "../src/domain/FolderTodoParser"
import { IContext } from "../src/contract/IContext"
const ctx: IContext = fakeContext()
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
[x] a completed todo @assignee(Pete) @booleanAttribute`))
    td.when(deps.fs.readFileSync("ROOT|file.txt")).thenReturn(new Buffer(`[ ] A todo that should not be loaded`))
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn(["file2.md"])
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn(new Buffer(`[-] An in progress todo
not a todo again @notAnAttribute
[d] a delegated todo @assignee(Leah) @anotherBooleanAttr`))

    // when
    const parser = new FolderTodoParser(deps, ctx)
    const parsedFolder = parser.parseFolder(rootFolder)
    const todos = parsedFolder.todos

    // then
    it("should load normal todo", () => should(todos).containEql({ status: TodoStatus.Todo, text: "A todo todo", file: "ROOT|file.md", project: "", folderType: "", attributes: {} }))
    it("should skip non md files", () => should(todos).not.containEql({ status: TodoStatus.Todo, text: "A todo that should not be loaded", file: "ROOT|file.txt", project: "", folderType: "", attributes: {} }))
    it("should load completed todo", () => should(todos).containEql({ status: TodoStatus.Complete, text: "a completed todo", file: "ROOT|file.md", project: "", folderType: "", attributes: { assignee: "Pete", booleanAttribute: true } }))
    it("should load in progress todo from subfolder", () => should(todos).containEql({ status: TodoStatus.InProgress, text: "An in progress todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something", attributes: {} }))
    it("should load delegated todo from subfolder", () => should(todos).containEql({ status: TodoStatus.Delegated, text: "a delegated todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something", attributes: { assignee: "Leah", anotherBooleanAttr: true } }))
    it("loads attributes", () => {
      should(parsedFolder.attributes).containEql("assignee")
      should(parsedFolder.attributes).containEql("booleanAttribute")
      should(parsedFolder.attributes).containEql("anotherBooleanAttr")
      should(parsedFolder.attributes).not.containEql("notAnAttribute")
    })
    it("loads attribute values", () => {
      should(parsedFolder.attributeValues["assignee"]).containEql("Pete")
      should(parsedFolder.attributeValues["assignee"]).containEql("Leah")
    })
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
    const todos = parser.parseFolder(rootFolder).todos

    // then
    it("should load empty todos", () => should(todos).have.length(0))
  })
})