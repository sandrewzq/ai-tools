import { initRouter } from "./src/core/router.js";
import * as colorPalette from "./src/tools/color-palette/index.js";
import * as speedTest from "./src/tools/speed-test/index.js";

const toolsMap = {
  home: { init: () => {}, destroy: () => {} },
  "speed-test": speedTest,
  "color-palette": colorPalette,
};

initRouter(toolsMap);
