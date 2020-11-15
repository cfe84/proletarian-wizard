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
    td.when(deps.fs.readdirSync(rootFolder)).thenReturn(["file.md", "PROJECTS|2020-01-02 - Something", "file.txt", ".pw"])
    td.when(deps.fs.lstatSync("ROOT|.pw")).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync(deps.path.join(rootFolder, ".pw"))).thenReturn(["templates"])
    td.when(deps.fs.lstatSync("ROOT|.pw|templates")).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync(deps.path.join(rootFolder, ".pw", "templates"))).thenReturn(["file.md"])
    td.when(deps.fs.lstatSync("ROOT|.pw|templates|file.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.lstatSync("ROOT|file.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.lstatSync("ROOT|file.txt")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|file.md")).thenReturn(Buffer.from(`[ ] A todo todo
not a todo
[x] a completed todo @assignee(Pete) @booleanAttribute`))
    td.when(deps.fs.readFileSync("ROOT|file.txt")).thenReturn(Buffer.from(`[ ] A todo that should not be loaded`))
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn({ isDirectory: () => true })
    td.when(deps.fs.readdirSync("ROOT|PROJECTS|2020-01-02 - Something")).thenReturn(["file2.md", "file3.md"])
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")).thenReturn(new Buffer(`[-] An in progress todo
not a todo again @notAnAttribute
[ ] a todo with @project(this project)

[d] a delegated todo @assignee(Leah) @anotherBooleanAttr`))
    td.when(deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file3.md")).thenReturn({ isDirectory: () => false })
    td.when(deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file3.md")).thenReturn(Buffer.from(`[ ] A todo for another project @project(2020-03-03 - Another project)
    `))
    td.when(deps.fs.readFileSync("ROOT|.pw|templates|file.md")).thenReturn(Buffer.from(`[ ] A todo in a template`))

    // when
    const parser = new FolderTodoParser(deps, ctx)
    const parsedFolder = parser.parseFolder(rootFolder)
    const todos = parsedFolder.todos

    // then
    it("should load normal todo", () => should(todos).containEql({ status: TodoStatus.Todo, text: "A todo todo", file: "ROOT|file.md", project: "", folderType: "", attributes: {}, line: 0 }))
    it("should skip non md files", () => should(todos).not.containEql({ status: TodoStatus.Todo, text: "A todo that should not be loaded", file: "ROOT|file.txt", project: "", folderType: "", attributes: {}, line: 0 }))
    it("should skip templates", () => should(todos).not.containEql({ status: TodoStatus.Todo, text: "A todo in a template", file: "ROOT|.pw|templates|file.md", project: "", folderType: "", attributes: {}, line: 0 }))
    it("should load completed todo", () => should(todos).containEql({ status: TodoStatus.Complete, text: "a completed todo", file: "ROOT|file.md", project: "", folderType: "", attributes: { assignee: "Pete", booleanAttribute: true }, line: 2 }))
    it("should load in progress todo from subfolder", () => should(todos).containEql({ status: TodoStatus.InProgress, text: "An in progress todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something", attributes: {}, line: 0 }))
    it("should load delegated todo from subfolder", () => should(todos).containEql({ status: TodoStatus.Delegated, text: "a delegated todo", file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md", folderType: "projects", project: "2020-01-02 - Something", attributes: { assignee: "Leah", anotherBooleanAttr: true }, line: 4 }))
    it("should move task to the corresponding project when specified", () => should(todos).containEql({ status: TodoStatus.Todo, text: "A todo for another project", file: "ROOT|PROJECTS|2020-01-02 - Something|file3.md", folderType: "projects", project: "2020-03-03 - Another project", attributes: { project: "2020-03-03 - Another project" }, line: 0 }))
    it("loads attributes", () => {
      should(parsedFolder.attributes).containEql("assignee")
      should(parsedFolder.attributes).containEql("project")
      should(parsedFolder.attributes).containEql("booleanAttribute")
      should(parsedFolder.attributes).containEql("anotherBooleanAttr")
      should(parsedFolder.attributes).not.containEql("notAnAttribute")
    })
    it("loads attribute values", () => {
      should(parsedFolder.attributeValues["assignee"]).containEql("Pete")
      should(parsedFolder.attributeValues["assignee"]).containEql("Leah")
      should(parsedFolder.attributeValues["project"]).containEql("this project")
    })
    it("adds projects as attribute values", () => {
      should(parsedFolder.attributeValues["project"]).containEql("2020-01-02 - Something")
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