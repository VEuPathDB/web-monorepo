import { worldShiftsIntoView, MAX_WORLD_COPIES } from './worldCopies';

describe('worldShiftsIntoView', () => {
  it('is just the main world when the viewport sits inside it', () => {
    expect(worldShiftsIntoView(-180, 180, -50, 60)).toEqual([0]);
  });

  it('includes the neighbour when the viewport crosses the dateline', () => {
    expect(worldShiftsIntoView(-180, 180, 120, 240)).toEqual([0, 360]);
    expect(worldShiftsIntoView(-180, 180, -240, -120)).toEqual([-360, 0]);
  });

  it('follows the viewport several worlds away', () => {
    expect(worldShiftsIntoView(-180, 180, 700, 800)).toEqual([720]);
  });

  it('shifts a narrow object (a shape) into the viewport', () => {
    // shape at 170..190; viewport 500..600 sees its +360 copy only
    expect(worldShiftsIntoView(170, 190, 500, 600)).toEqual([360]);
  });

  it('caps the number of copies, keeping those nearest the centre', () => {
    const shifts = worldShiftsIntoView(-180, 180, -5000, 5000);
    expect(shifts).toHaveLength(MAX_WORLD_COPIES);
    expect(shifts).toContain(0);
  });
});
