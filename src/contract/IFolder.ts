export interface IFolder {
  path: string
  name: string
  underSpecialFolder: SpecialFolder
  isSpecialFolder: boolean
}

export type SpecialFolder = "Inbox" | "Project" | "Recurrence" | "Reference" | "Archive";
