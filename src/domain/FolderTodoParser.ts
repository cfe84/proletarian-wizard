import { IDependencies } from "../contract/IDependencies";
import { TodoItem } from "./TodoItem";
import { LineOperations } from "./LineOperations";
import { IContext } from "../contract/IContext";
import { FileInspector } from "./FileInspector";

export class FolderTodoParser {
  private lineOperations: LineOperations
  private fileInspector: FileInspector
  constructor(private deps: IDependencies, context: IContext) {
    this.lineOperations = new LineOperations(deps)
    this.fileInspector = new FileInspector(deps, context)
  }

  private parseFile(file: string): TodoItem[] {
    if (!file.endsWith(".md")) {
      return []
    }
    const content = `${this.deps.fs.readFileSync(file)}`
    const lines = content.split("\n")
    const todos = lines
      .map(line => this.lineOperations.toTodo(line))
      .filter(todo => todo !== null) as TodoItem[]
    const inspectionResults = this.fileInspector.inspect(file)
    todos.forEach(todo => {
      todo.file = file
      todo.project = inspectionResults.project
      todo.folderType = inspectionResults.containingFolderType
    })
    return todos
  }

  parseFolder(folder: string): TodoItem[] {
    const files = this.deps.fs.readdirSync(folder)
    const todos = files
      .map(file => this.deps.path.join(folder, file))
      .map((file) =>
        this.deps.fs.lstatSync(file).isDirectory() ?
          this.parseFolder(file) :
          this.parseFile(file)
      )
      .reduce((prev, curr) => {
        prev = prev.concat(curr)
        return prev
      }, [])
    return todos
  }
}