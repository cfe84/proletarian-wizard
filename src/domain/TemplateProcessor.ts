import { IDependencies } from "../contract/IDependencies";
import { IDictionary } from "./IDictionary";

export type TemplateVariableName = string

export class TemplateProcessor {
  constructor() { }

  getTemplateVariables(templateContent: string): TemplateVariableName[] {
    const regex = /\${([a-z0-9_ .?!,;-]+)}/mig
    const res = templateContent.match(regex)
    return res?.map(r => r.substr(2, r.length - 3)) || []
  }

  replaceVariables(templateContent: string, variables: TemplateVariableName[], values: IDictionary<string>): string {
    variables.forEach(variableName => {
      const regex = new RegExp("\\${" + variableName + "}", "g")
      const value = values[variableName]
      templateContent = templateContent.replace(regex, value)
    })
    return templateContent
  }
}