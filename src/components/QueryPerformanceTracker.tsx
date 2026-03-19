import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  appendQueryPerformanceSample,
  clearQueryPerformanceSamples,
  getQueryPerformanceSamples,
  summarizeQueryPerformance,
} from "@/lib/queryPerformance";

const MONITORED_QUERY_PREFIXES = new Set([
  "dashboard_snapshot",
  "header_weekly_consistency",
  "calendar_data",
  "calendar_day_logs",
  "calendar_day_sleep",
  "calendar_day_biofeedback",
  "calendar_day_note",
  "calendar_day_nutrition",
  "nutrition_day_summary",
]);

const QueryPerformanceTracker = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const fetchStartRef = useRef<Map<string, number>>(new Map());
  const previousFetchStatusRef = useRef<Map<string, string>>(new Map());
  const locationRef = useRef(location.pathname);

  locationRef.current = location.pathname;

  const shouldLogToConsole = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.search.includes("perf=1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const api = {
      samples: () => getQueryPerformanceSamples(),
      report: () => summarizeQueryPerformance(getQueryPerformanceSamples()),
      clear: () => clearQueryPerformanceSamples(),
    };
    Object.assign(window as Window & { __appfitPerf?: typeof api }, { __appfitPerf: api });
  }, []);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const query = event.query;
      const keyFirst = query.queryKey[0];
      const keyLabel = typeof keyFirst === "string" ? keyFirst : String(keyFirst);
      if (!MONITORED_QUERY_PREFIXES.has(keyLabel)) return;

      const queryHash = query.queryHash;
      const previousFetchStatus = previousFetchStatusRef.current.get(queryHash);
      const currentFetchStatus = query.state.fetchStatus;

      if (currentFetchStatus === "fetching" && previousFetchStatus !== "fetching") {
        fetchStartRef.current.set(queryHash, Date.now());
      }

      if (previousFetchStatus === "fetching" && currentFetchStatus === "idle") {
        const startedAt = fetchStartRef.current.get(queryHash);
        if (startedAt) {
          const finishedAt = Date.now();
          const durationMs = Math.max(0, finishedAt - startedAt);
          appendQueryPerformanceSample({
            queryKey: keyLabel,
            durationMs,
            route: locationRef.current,
            startedAt,
            finishedAt,
          });
          fetchStartRef.current.delete(queryHash);

          if (shouldLogToConsole && import.meta.env.DEV) {
            const summary = summarizeQueryPerformance(getQueryPerformanceSamples());
            const compact = summary.map((row) => ({
              query: row.queryKey,
              count: row.count,
              avg: `${row.avgMs}ms`,
              p50: `${row.p50Ms}ms`,
              p95: `${row.p95Ms}ms`,
              max: `${row.maxMs}ms`,
            }));
            console.table(compact);
          }
        }
      }

      previousFetchStatusRef.current.set(queryHash, currentFetchStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, shouldLogToConsole]);

  return null;
};

export default QueryPerformanceTracker;
