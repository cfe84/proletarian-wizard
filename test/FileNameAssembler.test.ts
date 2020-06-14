import { makeFakeDeps } from "./FakeDeps"
import { FileNameAssembler } from "../src/domain/FileNameAssembler"
import * as td from "testdouble"
import * as should from "should"

describe("FileNameAssembler", () => {
  // given
  const deps = makeFakeDeps()
  const fileNameAssembler = new FileNameAssembler(deps)

  context("Fixing markdown extension", () => {
    it("adds missing markdown extension", () => {
      // when
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something", path: "" })
      // then
      should(filename1).endWith("2020-01-10 - something.md")

      // when
      const filename2 = fileNameAssembler.assembleFileName({ fileName: "something", path: "" })
      // then
      should(filename2).endWith("something.md")
    })

    it("adds missing markdown extension even if there's an .md somewhere in the name", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.mdsomewhereinthename", path: "" })
      // then
      should(filename).endWith("2020-01-10 - something.mdsomewhereinthename.md")
    })

    it("doesn't add an addition markdown extension when already there", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.md", path: "" })
      // then
      should(filename).endWith("2020-01-10 - something.md")
    })

    it("doesn't add an addition markdown extension when capitalized md already there", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.MD", path: "" })
      // then
      should(filename).endWith("2020-01-10 - something.MD")
    })

    it("doesn't add extension if setting is turned off", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something", path: "", fixExtension: false })
      // then
      should(filename).endWith("2020-01-10 - something")
    })
  })

  context("Default name", () => {
    it("adds default name if none is specified", () => {
      // when
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "", path: "" })
      // then
      should(filename1).endWith("notes.md")
    })

    it("adds specified default name if none is specified", () => {
      // when
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "2020-01-02 - ", path: "", defaultName: "DEFAULT" })
      // then
      should(filename1).endWith("2020-01-02 - DEFAULT.md")
    })

    it("does not add default name if only date is specified", () => {
      // when
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "2020-01-02", path: "", defaultName: "DEFAULT" })
      // then
      should(filename1).endWith("2020-01-02.md")
    })

    it("does not add default name if setting is turned off", () => {
      // when
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "2020-01-02 - ", path: "", fixFilename: false })
      // then
      should(filename1).endWith("2020-01-02 - .md")
    })
  })

  context("Fixing date prefix in filename", () => {
    before(() =>
      td.when(() => deps.date.todayAsYMDString()).thenReturn("_DATE_")
    )
    it("adds date as prefix if missing", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "something", path: "" })
      // then
      should(filename).containEql("_DATE_ - something")
    })
    it("does not add date as prefix if it's there", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-02 - something.md", path: "" })
      should(filename).containEql("2020-01-02 - something")
      should(filename).not.containEql("_DATE_")
    })
    it("doesn't add date if setting is turned off", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "something.md", path: "", fixDate: false })
      // then
      should(filename).endWith("something.md")
      should(filename).not.endWith("_DATE_ - something.md")
    })
  })

  context("Assembling path", () => {
    it("assembles path", () => {
      // when
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-02 - something.md", path: "THE_PATH" })
      //then
      should(filename).eql("THE_PATH|2020-01-02 - something.md")
    })
  })
})