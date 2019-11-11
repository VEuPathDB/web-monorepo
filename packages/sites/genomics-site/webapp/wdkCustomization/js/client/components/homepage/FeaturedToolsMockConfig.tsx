import { FeaturedToolMetadata } from "./FeaturedTools";

const MOCK_FEATURED_TOOL_ORDER = [ "tour", "genome-browser", "tips" ];

const MOCK_FEATURED_TOOL_ENTRIES = {
  tour: {
    iconKey: "globe",
    title: "Take a Tour",
    description: `
      <div>
        Place for the tour
      </div>
    `
  },
  "genome-browser": {
    iconKey: "bar-chart",
    title: "Genome Browser",
    description: `
      <div>
        Place for the genome browser
      </div>
    `
  },
  tips: {
    iconKey: "lightbulb-o",
    title: "Featured Tip",
    description: `
      <div>
        Place to share little tips or vignettes
      </div>
    `
  }
};

export const MOCK_FEATURED_TOOLS_METADATA: FeaturedToolMetadata = {
  toolListOrder: MOCK_FEATURED_TOOL_ORDER,
  toolEntries: MOCK_FEATURED_TOOL_ENTRIES
};
