import assert from "node:assert/strict";
import { launchBrowser, withPreview } from "./helpers/browser.mjs";

assert.equal(typeof withPreview, "function", "withPreview should be exported");
assert.equal(typeof launchBrowser, "function", "launchBrowser should be exported");

console.log("browser helper tests passed");
