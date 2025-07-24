import { parse } from "valibot";

import { OptimizationRequest } from "./schema";
import { optimize } from "./optimize";

self.addEventListener(
  "message",
  function (event) {
    this.postMessage(optimize(parse(OptimizationRequest, event.data)));
    this.close();
  },
  { once: true },
);
