# Design of Filter UI Delegation

The top-level `Filter` Component for EDA uses delgation based on the type of variable passed to it. It will accept any `StudyVariable` type and render the correct filter display based on its properties.

Each Filter component is responsible for acquiring its own data. In most cases, it will use a EDADataService, but this is not strictly enforced. This will allow us to use other services, if the need arises.
