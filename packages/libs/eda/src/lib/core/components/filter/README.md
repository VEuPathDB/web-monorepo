# Design of Filter UI Delegation

The top-level `Filter` Component for EDA uses delgation based on the type of variable passed to it. It will accept any `StudyVariable` type and render the correct filter display based on its properties.

Each Filter component is responsible for acquiring its own data. In most cases, it will use a EDADataService, but this is not strictly enforced. This will allow us to use other services, if the need arises.

Latitude and longitude variables of geo-enabled entities are delegated to `GeoCoordFilter`, a semantic-zooming map on which the user draws one or more freehand lasso shapes (editable via the on-map toolbar). The shapes are converted to a multi-scale geohash prefix cover and stored as a single `stringPrefixSet` filter on the entity's finest geohash variable. See [docs/geo-coordinate-filtering.md](../../../../../docs/geo-coordinate-filtering.md) for the design notes.
