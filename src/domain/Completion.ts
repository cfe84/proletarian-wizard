import { IContext } from "../contract/IContext";
import { deepStrictEqual } from "assert";
import { IDependencies } from "../contract/IDependencies";

export class Completion {
  constructor(private deps: IDependencies, private context: IContext) { }

  private completeAttribute(beginning: string): string[] {
    return this.context.parsedFolder.attributes.filter(attr => attr.startsWith(beginning))
  }

  private completeAttributeValue(attributeName: string, beginning: string): string[] {
    const values = this.context.parsedFolder.attributeValues[attributeName]
    if (!values)
      return []
    return values.filter(value => value.startsWith(beginning))
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
    const valueBeginningIndex = currentWordBeginning.indexOf("(")
    if (valueBeginningIndex >= 0) {
      const attributeName = currentWordBeginning.substr(1, valueBeginningIndex - 1) // ignore @
      const valueBeginning = currentWordBeginning.substr(valueBeginningIndex + 1, currentWordBeginning.length - valueBeginningIndex - 1)
      return this.completeAttributeValue(attributeName, valueBeginning)
    }
    return this.completeAttribute(currentWordBeginning.substr(1, currentWordBeginning.length - 1))
  }
}