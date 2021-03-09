import { ChunkExtractor } from "@loadable/server";
import path from "path";
import { renderLoadableReduxComponent } from "../../server/render";
import { createQtStore } from "../../store/create-store";
import { TestComponent } from "../data/test-component";
const assert = require("assert");

describe("RenderLoadableReduxComponent", () => {
  it("Renders the component by passing the stats and entry points ", () => {
    const store = createQtStore({}, {}, { location: { pathname: "/" } });
    // Mocking the stats file generated from webpack
    const statsFile = path.resolve("test/data/stats.json");
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ["topbarCriticalCss", "navbarCriticalCss"] });
    assert.strictEqual(`<h1>This is a test component to check loadable component</h1>`, renderLoadableReduxComponent(TestComponent, store, extractor))
  });
});
