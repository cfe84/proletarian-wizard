export function fakeContext() {
  return {
    rootFolder: "ROOT", parsedFolder: { todos: [], attributeValues: {}, attributes: [] }, config: {
      folders: {
        inbox: "INBOX",
        archive: "ARCHIVE",
        projects: "PROJECTS",
        recurrences: "RECURRENCES",
        reference: "REFERENCE"
      }
    }
  }
}