# Adding a new plot

Look at an existing plot, such as `Boxplot` ([source](../src/plots/Boxplot.tsx)) to see how things work, especially

- The `data` prop is of type `BoxplotData`, defined in `types/plots/boxplot.ts`
- The various plotdata types are coalesced in `types/plots/index.ts`
- The universal props (e.g. title, interactive, containerStyles etc) are defined in `PlotlyPlot`
- Commonly (but not universally) reused props can be added like `OrientationAddon` and `OpacityAddon` in `Boxplot`. You will still need to implement these in your code.
- Be sure to catch all props not used in your code in `restProps` and pass to `PlotlyPlot`. See `Heatmap` for an example of bypassing/re-implementing a universal prop (`legendTitle`).
- Define and export an `EmptyXXXXData` constant
- Provide at least two stories that use Storybook controls: [Mosaic.stories.tsx](../src/stories/plots/MosaicPlot.stories.tsx) and [Heatmap.stories.tsx](../src/stories/plots/Heatmap.stories.tsx) are quite simple examples.
  - A plot with data
  - A plot with `EmptyXXXXData`
- Add extra stories for extra demo data structures, not for props settings (which can be changed with storybook controls - provide default values for props of interest in `YourStory.args` so that the controls appear at the top of the list)
- Styling and layout - not quite perfected.
  - `containerStyles` handles the plot size (default is `{width: '100%', height: '400px'}`). In Storybook, the plots don't respond to new `containerStyles` prop values until the browser window (or storybook panel) is resized. Storybook controls require strict JSON with full double quoting.
  - Fonts: don't add font family, style and size in your plot component - we will style these in a more coordinated way later
- There is no need to implement anything for `usePlotControls` - this is mothballed for now.
