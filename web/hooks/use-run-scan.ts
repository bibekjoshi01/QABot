"use client";

import { useMutation } from "@tanstack/react-query";
import { runScan } from "@/lib/api";
import { ScanPayload, ScanReport } from "@/types/scan";

export function useRunScan(onSuccess?: (report: ScanReport) => void) {
  return useMutation({
    mutationFn: (payload: ScanPayload) => runScan(payload),
    onSuccess
  });
}