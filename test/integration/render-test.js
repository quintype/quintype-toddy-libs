import { ChunkExtractor } from "@loadable/server";
import path from "path";
import { getCriticalCss, renderLoadableReduxComponent } from "../../server/render";
import { createQtStore } from "../../store/create-store";
import { TestComponent } from "../data/test-component";
import { TestComponent1 } from "../data/test-component-1";
const assert = require("assert");

describe("RenderLoadableReduxComponent", () => {
  it("Renders the component by passing the stats and entry points ", () => {
    const store = createQtStore({}, {}, { location: { pathname: "/" } });
    // Mocking the stats file generated from webpack
    const statsFile = path.resolve("test/data/stats.json");
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ["topbar"] });
    assert.strictEqual(`<h1>This is a test component to check loadable component</h1>`, renderLoadableReduxComponent(TestComponent, store, extractor))
  });

  it("Renders multiple component by passing the stats and entry points ", async () => {
    const store = createQtStore({}, {}, { location: { pathname: "/" } });
    // Mocking the stats file generated from webpack
    const statsFile = path.resolve("test/data/stats.json");
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ["topbar"] });
    assert.strictEqual(`<h1>This is a test component to check loadable component</h1>`, renderLoadableReduxComponent(TestComponent, store, extractor))
    assert.strictEqual(`<h1>This is the second test component to check loadable component</h1>`, renderLoadableReduxComponent(TestComponent1, store, extractor))
  });

  it("Renders multiple component by passing the stats and entry points ", async () => {
    const store = createQtStore({}, {}, { location: { pathname: "/" } });
    // Mocking the stats file generated from webpack
    const statsFile = path.resolve("test/data/stats.json");
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ["topbar"] });
    console.log("------------------", await getCriticalCss(extractor))
    assert.strictEqual(`<h1>This is a test component to check loadable component</h1>`, getCriticalCss(extractor))
  });
});
