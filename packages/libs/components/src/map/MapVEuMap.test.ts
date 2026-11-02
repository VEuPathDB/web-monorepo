import { Handler, Map as LeafletMap } from 'leaflet';
import './MapVEuMap'; // installs the Leaflet teardown guards

// like leaflet-lasso's handler: re-enables map dragging when it is disabled
class ReenableDraggingHandler extends Handler {
  static lastCreated: ReenableDraggingHandler | undefined;
  constructor(private readonly leafletMap: LeafletMap) {
    super(leafletMap);
    ReenableDraggingHandler.lastCreated = this;
  }
  addHooks() {}
  removeHooks() {
    this.leafletMap.dragging.enable();
  }
}

describe('Leaflet container re-initialisation guard', () => {
  it('removes the orphaned map, so its drag handler cannot hijack the container', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.createElement('div');
    document.body.appendChild(container);

    const orphan = new LeafletMap(container);
    // addHandler registers it, so Map.remove() disables it with the others
    orphan.addHandler('reenableDragging', ReenableDraggingHandler);
    ReenableDraggingHandler.lastCreated?.enable();
    expect(orphan.dragging.enabled()).toBe(true);

    // react-leaflet 3 can create a second map on the same element
    const live = new LeafletMap(container);

    expect(orphan.dragging.enabled()).toBe(false);
    expect(container.contains(orphan.getPane('mapPane') ?? null)).toBe(false);
    expect(live.dragging.enabled()).toBe(true);
    expect(container.querySelectorAll('.leaflet-map-pane')).toHaveLength(1);

    live.remove();
    container.remove();
  });
});
