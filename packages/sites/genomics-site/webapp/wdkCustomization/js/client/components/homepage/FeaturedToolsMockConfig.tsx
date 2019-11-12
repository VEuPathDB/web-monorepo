import { FeaturedToolMetadata } from "./FeaturedTools";

const MOCK_FEATURED_TOOL_ORDER = [ "tour", "genome-browser", "tips" ];

const MOCK_FEATURED_TOOL_ENTRIES = {
  tour: {
    listIconKey: "globe",
    listTitle: "Take a Tour",
    descriptionTitle: "Take a Tour of VEuPathDB",
    descriptionBody: `
      <div>
        Place for the tour
      </div>
    `
  },
  "genome-browser": {
    listIconKey: "bar-chart",
    listTitle: "Genome Browser",
    descriptionTitle: "Genome Browser",
    descriptionBody: `
      <div>
        Place for the genome browser
      </div>
    `
  },
  tips: {
    listIconKey: "lightbulb-o",
    listTitle: "Featured Tip",
    descriptionBody: `
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
