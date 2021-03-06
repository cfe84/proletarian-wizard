import should from "should";
import { fakeContext } from "./FakeContext";
import { makeFakeDeps } from "./FakeDeps";
import td from "testdouble";
import { TodoItem, TodoStatus } from "../src/domain/TodoItem";
import { FolderTodoParser } from "../src/domain/FolderTodoParser";
import { IContext } from "../src/contract/IContext";
import { IDictionary } from "../src/domain/IDictionary";
const ctx: IContext = fakeContext();
describe("FolderTodoParser", () => {
  context("Hierarchy", () => {
    // given
    const rootFolder = "ROOT";
    const deps = makeFakeDeps();

    td.when(deps.fs.lstatSync(rootFolder)).thenReturn({
      isDirectory: () => true,
    });
    td.when(deps.fs.readdirSync(rootFolder)).thenReturn([
      "file.md",
      "PROJECTS|2020-01-02 - Something",
      "file.doc",
      ".pw",
    ]);
    td.when(deps.fs.lstatSync("ROOT|.pw")).thenReturn({
      isDirectory: () => true,
    });
    td.when(deps.fs.readdirSync(deps.path.join(rootFolder, ".pw"))).thenReturn([
      "templates",
    ]);
    td.when(deps.fs.lstatSync("ROOT|.pw|templates")).thenReturn({
      isDirectory: () => true,
    });
    td.when(
      deps.fs.readdirSync(deps.path.join(rootFolder, ".pw", "templates"))
    ).thenReturn(["file.md"]);
    td.when(deps.fs.lstatSync("ROOT|.pw|templates|file.md")).thenReturn({
      isDirectory: () => false,
    });
    td.when(deps.fs.lstatSync("ROOT|file.md")).thenReturn({
      isDirectory: () => false,
    });
    td.when(deps.fs.lstatSync("ROOT|file.doc")).thenReturn({
      isDirectory: () => false,
    });
    td.when(deps.fs.readFileSync("ROOT|file.md")).thenReturn(
      Buffer.from(`[ ] A todo todo
not a todo
[x] a completed todo @assignee(Pete) @booleanAttribute`)
    );
    td.when(deps.fs.readFileSync("ROOT|file.doc")).thenReturn(
      Buffer.from(`[ ] A todo that should not be loaded`)
    );
    td.when(
      deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something")
    ).thenReturn({ isDirectory: () => true });
    td.when(
      deps.fs.readdirSync("ROOT|PROJECTS|2020-01-02 - Something")
    ).thenReturn(["file2.md", "file3.md"]);
    td.when(
      deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")
    ).thenReturn({ isDirectory: () => false });
    td.when(
      deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file2.md")
    ).thenReturn(
      Buffer.from(`[-] An in progress todo
not a todo again @notAnAttribute
[ ] a todo with @project(this project)
  - [ ] a substask of that todo
    - An item on the line
    - [x] a sub, subtask of that todo @project(in another project)
  - [ ] another subtask of that todo
 - [d] and another

[d] a delegated todo @assignee(Leah) @anotherBooleanAttr`)
    );
    td.when(
      deps.fs.lstatSync("ROOT|PROJECTS|2020-01-02 - Something|file3.md")
    ).thenReturn({ isDirectory: () => false });
    td.when(
      deps.fs.readFileSync("ROOT|PROJECTS|2020-01-02 - Something|file3.md")
    ).thenReturn(
      Buffer.from(`[ ] A todo for another project @project(2020-03-03 - Another project)
    `)
    );
    td.when(deps.fs.readFileSync("ROOT|.pw|templates|file.md")).thenReturn(
      Buffer.from(`[ ] A todo in a template`)
    );

    // when
    const parser = new FolderTodoParser(deps, ctx);
    const parsedFolder = parser.parseFolder(rootFolder);
    const todos = parsedFolder.todos;

    // then
    it("should load normal todo", () =>
      should(todos).containEql({
        status: TodoStatus.Todo,
        text: "A todo todo",
        file: "ROOT|file.md",
        project: "",
        folderType: "",
        attributes: {},
        line: 0,
      }));
    it("should skip non md files", () =>
      should(todos).not.containEql({
        status: TodoStatus.Todo,
        text: "A todo that should not be loaded",
        file: "ROOT|file.txt",
        project: "",
        folderType: "",
        attributes: {},
        line: 0,
      }));
    it("should skip templates", () =>
      should(todos).not.containEql({
        status: TodoStatus.Todo,
        text: "A todo in a template",
        file: "ROOT|.pw|templates|file.md",
        project: "",
        folderType: "",
        attributes: {},
        line: 0,
      }));
    it("should load completed todo", () =>
      should(todos).containEql({
        status: TodoStatus.Complete,
        text: "a completed todo",
        file: "ROOT|file.md",
        project: "",
        folderType: "",
        attributes: { assignee: "Pete", booleanAttribute: true },
        line: 2,
      }));
    it("should load in progress todo from subfolder", () =>
      should(todos).containEql({
        status: TodoStatus.InProgress,
        text: "An in progress todo",
        file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md",
        folderType: "projects",
        project: "2020-01-02 - Something",
        attributes: {},
        line: 0,
      }));
    it("should load delegated todo from subfolder", () =>
      should(todos).containEql({
        status: TodoStatus.Delegated,
        text: "a delegated todo",
        file: "ROOT|PROJECTS|2020-01-02 - Something|file2.md",
        folderType: "projects",
        project: "2020-01-02 - Something",
        attributes: { assignee: "Leah", anotherBooleanAttr: true },
        line: 9,
      }));
    it("should load todo with subtasks and project correctly", () => {
      const parent = todos.find(
        (todo) => todo.text === "a todo with"
      ) as TodoItem;
      should(parent).not.be.undefined();
      should(parent.project).eql("this project");
      should((parent.attributes as IDictionary<string>)["project"]).eql(
        "this project"
      );
      should(parent.subtasks).length(3);
      const firstSub = (parent.subtasks as TodoItem[]).find(
        (task) => task.text === "a substask of that todo"
      ) as TodoItem;
      const secondSub = (parent.subtasks as TodoItem[]).find(
        (task) => task.text === "another subtask of that todo"
      ) as TodoItem;
      const thirdSub = (parent.subtasks as TodoItem[]).find(
        (task) => task.text === "and another"
      ) as TodoItem;
      const validateSubCommon = (sub: TodoItem) => {
        should(sub.project).eql("this project");
        should(
          (sub.attributes as IDictionary<string>)["project"]
        ).be.undefined();
      };
      should(firstSub.text).eql("a substask of that todo");
      should(firstSub).not.be.undefined();
      validateSubCommon(firstSub);
      should(firstSub.subtasks).length(1);

      const subsub = (firstSub.subtasks as TodoItem[])[0] as TodoItem;
      should(subsub.text).eql("a sub, subtask of that todo");
      should(subsub.project).eql("in another project");
      should((subsub.attributes as IDictionary<string>)["project"]).eql(
        "in another project"
      );

      should(secondSub).not.be.undefined();
      should(secondSub.text).eql("another subtask of that todo");
      validateSubCommon(secondSub);
      should(thirdSub).not.be.undefined();
      should(thirdSub.text).eql("and another");
      validateSubCommon(thirdSub);
    });

    it("doesn't load subtasks as todos", () => {
      const todo = todos.find(
        (todo) => todo.text === "a sub, subtask of that todo"
      );
      should(todo).be.undefined();
    });
    it("should move task to the corresponding project when specified", () =>
      should(todos).containEql({
        status: TodoStatus.Todo,
        text: "A todo for another project",
        file: "ROOT|PROJECTS|2020-01-02 - Something|file3.md",
        folderType: "projects",
        project: "2020-03-03 - Another project",
        attributes: { project: "2020-03-03 - Another project" },
        line: 0,
      }));
    it("loads attributes", () => {
      should(parsedFolder.attributes).containEql("assignee");
      should(parsedFolder.attributes).containEql("project");
      should(parsedFolder.attributes).containEql("booleanAttribute");
      should(parsedFolder.attributes).containEql("anotherBooleanAttr");
      should(parsedFolder.attributes).not.containEql("notAnAttribute");
    });
    it("loads attribute values", () => {
      should(parsedFolder.attributeValues["assignee"]).containEql("Pete");
      should(parsedFolder.attributeValues["assignee"]).containEql("Leah");
      should(parsedFolder.attributeValues["project"]).containEql(
        "this project"
      );
    });
    it("adds projects as attribute values", () => {
      should(parsedFolder.attributeValues["project"]).containEql(
        "2020-01-02 - Something"
      );
    });
  });
  context("No content", () => {
    // given
    const rootFolder = "ROOT";
    const deps = makeFakeDeps();
    td.when(deps.fs.lstatSync(rootFolder)).thenReturn({
      isDirectory: () => true,
    });
    td.when(deps.fs.readdirSync(rootFolder)).thenReturn(["file.md"]);
    td.when(deps.fs.lstatSync("ROOT|file.md")).thenReturn({
      isDirectory: () => false,
    });
    td.when(deps.fs.readFileSync("ROOT|file.md")).thenReturn(
      new Buffer(`This is just
    content`)
    );

    // when
    const parser = new FolderTodoParser(deps, ctx);
    const todos = parser.parseFolder(rootFolder).todos;

    // then
    it("should load empty todos", () => should(todos).have.length(0));
  });
});
