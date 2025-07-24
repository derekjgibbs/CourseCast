import { chunked, range, zip } from "itertools";
import { parse } from "valibot";

import type { FetchedCourses } from "@/features/scenario/update/query";

import { type OptimizationRequest, OptimizationResponse } from "./schema";

async function enqueueOptimizationJob(worker: Worker, request: OptimizationRequest) {
  const controller = new AbortController();
  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

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
}

export class MissingSimulationSeedValue extends Error {
  constructor(public forecastId: string) {
    super(`Missing simulation seed value for course ${forecastId}`);
    this.name = "MissingSimulationSeedValue";
  }
}

interface OptimizationPoolRequest extends Omit<OptimizationRequest, "seed" | "courses"> {
  courses: FetchedCourses;
}

// TODO: Allow the user to configure the concurrency limit.
export async function spawnOptimizerPool({ courses, ...request }: OptimizationPoolRequest) {
  const workers = Array.from(
    range(navigator.hardwareConcurrency),
    () => new Worker(new URL("./worker.ts", import.meta.url)),
  );
  try {
    const promises: Promise<OptimizationResponse>[] = [];
    for (const seeds of chunked(range(100), workers.length))
      for (const [worker, seed] of zip(workers, seeds))
        promises.push(
          enqueueOptimizationJob(worker, {
            ...request,
            courses: courses.map(({ truncated_price_fluctuations, ...course }) => {
              const truncatedPrice = truncated_price_fluctuations[seed];
              if (typeof truncatedPrice === "undefined")
                throw new MissingSimulationSeedValue(course.forecast_id);
              return { ...course, truncated_price: truncatedPrice };
            }),
          }),
        );
    return await Promise.all(promises);
  } finally {
    // Clean up the worker resources
    for (const worker of workers) worker.terminate();
  }
}
