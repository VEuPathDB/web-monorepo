// Written as an explicit terminal list, not `!== 'queued' && !== 'in-progress'`,
// on purpose: if the service ever adds a status, an unrecognized value should
// keep polling (visibly wrong, easy to spot) rather than silently stop (looks
// stuck).
const TERMINAL_STATUSES = ['complete', 'failed', 'expired'];
export function getPollingDisposition(status) {
  return TERMINAL_STATUSES.includes(status) ? 'stop' : 'continue';
}
// Three flat rates, not a smooth ramp: fast while the user is most likely
// watching, then cheap over the long tail of a multi-minute alignment.
const TIERS = [
  { throughPollCount: 5, intervalMs: 2000 },
  { throughPollCount: 11, intervalMs: 5000 },
];
const STEADY_INTERVAL_MS = 15000;
export function getPollingIntervalMs(pollCount) {
  var _a;
  const tier = TIERS.find((t) => pollCount < t.throughPollCount);
  return (_a = tier === null || tier === void 0 ? void 0 : tier.intervalMs) !==
    null && _a !== void 0
    ? _a
    : STEADY_INTERVAL_MS;
}
//# sourceMappingURL=polling-schedule.js.map
