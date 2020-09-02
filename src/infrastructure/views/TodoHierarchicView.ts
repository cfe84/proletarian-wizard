import * as vscode from 'vscode';
import { IContext } from '../../contract/IContext';
import { IDependencies } from '../../contract/IDependencies';
import { TodoItem, TodoStatus } from '../../domain/TodoItem';
import { IDictionary } from '../../domain/IDictionary';

enum ItemType {
  Group,
  Todo
}

abstract class GroupOrTodo extends vscode.TreeItem {
  abstract type: ItemType;

  public asGroup(): Group {
    if (this.type === ItemType.Group)
      return this as unknown as Group
    throw (Error("Invalid cast (to group)"))
  }

  public asTodoItem(): TodoTreeItem {
    if (this.type === ItemType.Todo)
      return this as unknown as TodoTreeItem
    throw (Error("Invalid cast (to todo item)"))
  }
}

const statusToIcon = (status: TodoStatus): string => {
  switch (status) {
    case TodoStatus.Complete: return "✔"
    case TodoStatus.AttentionRequired: return "❗"
    case TodoStatus.Cancelled: return "❌"
    case TodoStatus.Delegated: return "👬"
    case TodoStatus.InProgress: return "🏃‍♂️"
    case TodoStatus.Todo: return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? "⬜" : "⬛"
    default: return ""
  }
}

class Group extends GroupOrTodo {
  type: ItemType = ItemType.Group
  constructor(public name: string, public todos: TodoItem[]) {
    super(name)
    this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
  }
  todosAsTreeItems = () => this.todos.map(todo => new TodoTreeItem(todo))
}

class TodoTreeItem extends GroupOrTodo {
  type: ItemType = ItemType.Todo
  constructor(private todo: TodoItem) {
    super(statusToIcon(todo.status) + " " + todo.text)
    const mapAttributeName = (attributeName: string): string =>
      attributeName === "selected" ? "📌"
        : attributeName === "assignee" || attributeName.toLowerCase() === "assignedto" || attributeName === "assigned" || attributeName === "who" ? "🧍‍♂️"
          : attributeName === "due" || attributeName.toLowerCase() === "duedate" || attributeName === "when" ? "📆"
            : "#️⃣ " + attributeName
    const mapAttributeValue = (attributeName: string, attributeValue: string): string =>
      (attributeName === "priority" || attributeName === "importance") ?
        attributeValue === "critical" ? "❗❗"
          : attributeValue === "high" ? "❗"
            : attributeValue === "medium" ? "➖"
              : attributeValue === "low" ? "⬇"
                : attributeValue
        : attributeValue
    const flattenAttributes = (attributes: IDictionary<string | boolean> | undefined): string =>
      attributes ?
        Object.keys(attributes)
          .map(attributeName => mapAttributeName(attributeName) + (attributes[attributeName] === true ? "" : `: ${mapAttributeValue(attributeName, attributes[attributeName] as string)}`))
          .join(", ")
        : ""
    this.command = {
      title: "Open",
      command: "vscode.open",
      arguments: [vscode.Uri.file(todo.file)]
    }
    this.description = (todo.project || todo.file) + " " + flattenAttributes(todo.attributes)
    this.collapsibleState = vscode.TreeItemCollapsibleState.None
  }
}

export enum GroupByOption {
  project,
  status,
}

export class TodoHierarchicView implements vscode.TreeDataProvider<GroupOrTodo> {

  constructor(private deps: IDependencies, private context: IContext) { }

  private _groupBy: GroupByOption = GroupByOption.status
  private _showSelectedOnTop: boolean = true

  public set groupBy(value: GroupByOption) {
    this._groupBy = value
    this.refresh()
  }
  public set showSelectedOnTop(value: boolean) {
    this._showSelectedOnTop = value
    this.refresh()
  }


  private onDidChangeTreeDataEventEmitter: vscode.EventEmitter<GroupOrTodo | undefined> = new vscode.EventEmitter<GroupOrTodo | undefined>();

  readonly onDidChangeTreeData: vscode.Event<GroupOrTodo | undefined> = this.onDidChangeTreeDataEventEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEventEmitter.fire(undefined);
  }

  getTreeItem(element: GroupOrTodo): GroupOrTodo {
    return element.type === ItemType.Group ? element.asGroup() : element.asTodoItem()
  }

  private getSelectedGroup(): Group {
    const getSelectedTasks = (): TodoItem[] =>
      this.context.todos.filter(todo => todo.attributes && todo.attributes.selected)
    return new Group("Selected tasks", getSelectedTasks())
  }

  private getGroupsByStatus(): Group[] {
    const getTodosByStatus = (status: TodoStatus): TodoItem[] =>
      this.context.todos.filter(todo => todo.status === status)
    return [
      { label: "Attention required", status: TodoStatus.AttentionRequired },
      { label: "Todo", status: TodoStatus.Todo },
      { label: "In progress", status: TodoStatus.InProgress },
      { label: "Delegated", status: TodoStatus.Delegated },
      { label: "Complete", status: TodoStatus.Complete },
      { label: "Cancelled", status: TodoStatus.Cancelled },
    ]
      .map(({ label, status }) => new Group(label, getTodosByStatus(status)))
      .filter((group) => group.todos.length > 0)
  }

  private getGroupsByProject(): Group[] {
    const getProjects = () =>
      this.context.todos.reduce((projects: IDictionary<TodoItem[]>, todo: TodoItem) => {
        const project = todo.project || "Empty"
        if (!projects[project]) {
          projects[project] = []
        }
        projects[project].push(todo)
        return projects
      }, {})
    const projects = getProjects()
    Object.keys(projects).forEach(key => {
      projects[key] = projects[key].sort((a, b) => a.status - b.status)
    })
    return Object.keys(projects)
      .map(project => new Group(project, projects[project]))
      .sort((a, b) => a.name === "Empty" ? 1 : a.name.localeCompare(b.name))
  }

  private getGroupByGroups() {
    switch (this._groupBy) {
      case GroupByOption.project:
        return this.getGroupsByProject()
      case GroupByOption.status:
      default:
        return this.getGroupsByStatus()
    }
  }

  async getChildren(element?: GroupOrTodo | undefined): Promise<GroupOrTodo[]> {
    if (element) {
      if (element.type === ItemType.Group) {
        return element.asGroup().todosAsTreeItems()
      }
      return []
    }
    const groupByGroups = this.getGroupByGroups()
    if (!this._showSelectedOnTop) return groupByGroups
    const selectedTodos = this.getSelectedGroup()
    return [selectedTodos].concat(groupByGroups)
  }

}