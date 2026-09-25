// HUD adapter: mirrors simulation state into the DOM. No game rules here.

const TOOL_LABELS = { mcnorton: 'McNorton' };

export function createHud() {
  const incidentsEl = document.getElementById('incidents');
  const inventoryEl = document.getElementById('inventory');

  return {
    update(state) {
      incidentsEl.textContent = `Incidents ${state.incidentsResolved}/${state.incidentsTotal}`;
      incidentsEl.classList.toggle('done', state.incidentsResolved === state.incidentsTotal);
      const items = ['Shotgun'].concat(
        state.inventory.tools.map((tool) => TOOL_LABELS[tool] ?? tool),
      );
      inventoryEl.textContent = items.join(' · ');
    },
  };
}
