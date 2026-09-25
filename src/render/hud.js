// HUD adapter: mirrors simulation state into the DOM. No game rules here.

const ITEM_LABELS = { shotgun: 'Shotgun', mcnorton: 'McNorton' };

export function createHud() {
  const incidentsEl = document.getElementById('incidents');
  const inventoryEl = document.getElementById('inventory');

  return {
    update(state) {
      const { incidentsResolved, incidentsTotal } = state;
      incidentsEl.textContent = `Incidents ${incidentsResolved}/${incidentsTotal}`;
      incidentsEl.classList.toggle(
        'done',
        incidentsTotal > 0 && incidentsResolved === incidentsTotal,
      );
      inventoryEl.textContent = state.inventory.weapons
        .concat(state.inventory.tools)
        .map((item) => ITEM_LABELS[item] ?? item)
        .join(' · ');
    },
  };
}
