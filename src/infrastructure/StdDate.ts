import { IDate } from "../contract/IDate";

export class StdDate implements IDate {
  todayAsYMDString(): string {
    const date = new Date()
    return date.toISOString().substr(0, 10)
  }
}