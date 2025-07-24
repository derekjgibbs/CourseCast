import { parse } from "valibot";

import { type OptimizationRequest, OptimizationResponse } from "./schema";

export async function spawnOptimizer(request: OptimizationRequest) {
  const worker = new Worker(new URL("./worker.ts", import.meta.url));
  try {
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();

    const controller = new AbortController();
    worker.addEventListener(
      "message",
      event => {
        resolve(event.data);
        controller.abort();
      },
      { once: true, signal: controller.signal },
    );
    worker.addEventListener(
      "error",
      event => {
        reject(event.error);
        controller.abort();
      },
      { once: true, signal: controller.signal },
    );

    worker.postMessage(request);
    return parse(OptimizationResponse, await promise);
  } finally {
    // Just in case...
    worker.terminate();
  }
}
