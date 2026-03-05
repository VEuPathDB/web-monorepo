# Visualization refactor considerations

Each `*Visualization.tsx` file currently conflates data fetching, config management, axis range/log-scale/truncation logic, legend building, and rendering in a single large component. Key pain points to address in any future refactor:

- **Mixed abstraction levels in `libs/components`**: some plot components are thin Plotly wrappers, others are more abstracted — inconsistent mental models and two different look-and-feels make maintenance harder.
- **Faceted/unfaceted branching**: the `isFaceted` check cuts across data processing, legend logic, and rendering; ideally faceting would be handled by a transparent wrapper so individual viz components are unaware of it.
- **Axis range logic**: genuinely stateful (custom ranges, log scale, truncation warnings) and coupled to both UI controls and data request parameters — no clean seam to extract without a deliberate architectural decision.
- **Repeated config fallback patterns**: e.g. `vizConfig.foo ?? options?.foo ?? defaultValue` scattered across render, props objects, and JSX — derive once, reference everywhere.
- **Incremental improvement is realistic**: the risk surface is large, so small targeted cleanups (deriving computed values once, extracting hooks for self-contained concerns) are safer than wholesale rewrites.
