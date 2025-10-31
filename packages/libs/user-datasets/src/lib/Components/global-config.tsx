import { DatasetVisibilityOption, } from "../Utils/types";
import { DatasetVisibility } from "../Service/Types";


/**
 * Initializes an object containing constructors for all possible dataset
 * visibility options that may be rendered in dataset upload or update forms.
 */
export const initDatasetVisibilities = (): DatasetVisibilityIndex => ({
  "private": {
    display: "Private",
    value: "private",
    description: () => "Can only be accessed by you and collaborators"
      + " explicitly granted access by you.",
  },
  "protected": {
    display: "Protected",
    value: "protected",
    description: () => <>
      <span>
        Guest users can view aggregated data via the "Browse and subset" and
        "Visualize" tabs, but must register, request, and obtain approval from
        the data providers to download data. The request may be submitted via a
        form that pops up when a registered user is logged in and clicks on any
        file in the "Download" tab.
      </span>
      <ul>
        <li>
          <strong>Active approval:</strong>
          <span>Access must be explicitly approved by the study team.</span>
        </li>
        <li>
          <strong>Passive approval:</strong>
          <span>
            Access is automatically granted after the defined "review period".
          </span>
        </li>
      </ul>
    </>,
  },
  "controlled": {
    display: "Controlled",
    value: "controlled",
    description: () => "Guest users can view aggregated data via the \"Browse"
      + " and subset\" and \"Visualize\" tabs, but must register and request"
      + " access to download data. The request may be submitted via a form that"
      + " pops up when a user logs in with a registered account and clicks on"
      + " any file in the \"Download\" tab. Data can be downloaded by the"
      + " registered user immediately following request submission.",
  },
  "public": {
    display: "Public",
    value: "public",
    description: () => "Accessible by all users with no access restrictions."
      + " Users can view and download the data as \"Guests\" without logging"
      + " in.",
  },
});

type DatasetVisibilityIndex = {
  readonly [K in DatasetVisibility]: DatasetVisibilityOption
}
