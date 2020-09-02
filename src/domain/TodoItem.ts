export enum TodoStatus {
  AttentionRequired = 0,
  Todo = 1,
  InProgress = 2,
  Delegated = 3,
  Complete = 4,
  Cancelled = 5,
}

export interface TodoItem {
  status: TodoStatus
  text: string
  file: string
  folderType?: string
  project?: string
}