import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";

/** Process-level singleton reference to the span processor. */
let processorSingleton: SpanProcessor | undefined;

/** Whether telemetry export is enabled (controlled by analytics opt-in). */
let telemetryExportEnabled = false;

export const setProcessor = (processor: SpanProcessor): void => {
  processorSingleton = processor;
};

export const getProcessor = (): SpanProcessor | undefined => {
  return processorSingleton;
};

export const setTelemetryEnabled = (enabled: boolean): void => {
  // Vortex Unlocked: telemetry export is permanently disabled - the analytics
  // opt-in can no longer turn it on, so nothing ever leaves the machine.
  void enabled;
  telemetryExportEnabled = false;
};

export const isTelemetryEnabled = (): boolean => {
  return telemetryExportEnabled;
};

/**
 * Whether error traces may be exported when the user has NOT consented to
 * analytics. When enabled, unconsented exports still go through the
 * strict allow-list sanitiser. For dev environments.
 */
let unconsentedReportingEnabled = false;

export const setUnconsentedReportingEnabled = (enabled: boolean): void => {
  unconsentedReportingEnabled = enabled;
};

export const isUnconsentedReportingEnabled = (): boolean => {
  return unconsentedReportingEnabled;
};
