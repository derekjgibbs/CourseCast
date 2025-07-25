import { useQuery } from "@tanstack/react-query";

import { type OptimizationPoolRequest, spawnOptimizerPool } from "./solver";

interface QueryOptions {
  queryKey: ["optimizer", OptimizationPoolRequest];
}

async function queryFn({ queryKey: [_, request] }: QueryOptions) {
  return await spawnOptimizerPool(request);
}

export function useSpawnOptimizerPool(request: OptimizationPoolRequest) {
  return useQuery({
    queryKey: ["optimizer", request],
    queryFn,
    staleTime: "static",
    gcTime: 0,
  });
}
