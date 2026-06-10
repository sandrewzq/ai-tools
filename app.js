import { initRouter } from "./src/core/router.js";
import * as colorPalette from "./src/tools/color-palette/index.js";
import * as promptTemplates from "./src/tools/prompt-templates/index.js";
import * as speedTest from "./src/tools/speed-test/index.js";
import * as textChunker from "./src/tools/text-chunker/index.js";
import * as textDiffer from "./src/tools/text-differ/index.js";

const toolsMap = {
  home: { init: () => {}, destroy: () => {} },
  "speed-test": speedTest,
  "color-palette": colorPalette,
  "prompt-templates": promptTemplates,
  "text-chunker": textChunker,
  "text-differ": textDiffer,
};

initRouter(toolsMap);
