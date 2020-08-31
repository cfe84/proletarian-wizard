export enum TodoStatus {
  Todo,
  InProgress,
  Complete,
  Cancelled,
  Delegated,
  AttentionRequired
}

export interface TodoItem {
  status: TodoStatus
  text: string
}