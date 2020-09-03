import { IContext } from "../contract/IContext";

export class Completion {
  constructor(private context: IContext) { }

  private completeAttribute(beginning: string): string[] {
    return this.context.parsedFolder.attributes.filter(attr => attr.startsWith(beginning))
  }

  private findCurrentWordBeginning(content: string, position: number): string {
    let beginning = position
    while (beginning > 0 && content[beginning] !== "@" && content[beginning] !== "\n") {
      beginning--
    }
    if (beginning <= 1 || content[beginning] !== "@" || content[beginning - 1] !== " ") {
      return ""
    }
    return content.substr(beginning, position - beginning)
  }

  complete(content: string, position: number): string[] {
    const currentWordBeginning = this.findCurrentWordBeginning(content, position)
    if (currentWordBeginning === "") {
      return []
    }
    return this.completeAttribute(currentWordBeginning.substr(1, currentWordBeginning.length - 1))
  }
}