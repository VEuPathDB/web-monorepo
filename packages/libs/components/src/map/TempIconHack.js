// temporary hack to work-around webpack/leaflet incompatibility
// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
// we will have custom markers soon so no need to worry
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

