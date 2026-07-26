let settings = null;

async function loadSettings() {
  const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
  settings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    engines: { ...DEFAULT_SETTINGS.engines, ...(stored.engines || {}) },
    order: stored.order ? [...stored.order] : [...DEFAULT_SETTINGS.order]
  };

  // Pick up any engines added in a later version that aren't in the saved order yet.
  for (const engine of ENGINES) {
    if (!settings.order.includes(engine.id)) settings.order.push(engine.id);
  }
}

function saveSettings() {
  browser.storage.sync.set(settings);
}

function moveEngine(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= settings.order.length) return;
  [settings.order[index], settings.order[newIndex]] = [settings.order[newIndex], settings.order[index]];
  saveSettings();
  render();
}

function render() {
  const list = document.getElementById("engine-list");
  list.innerHTML = "";

  settings.order.forEach((id, index) => {
    const engine = ENGINES.find((e) => e.id === id);
    if (!engine) return;

    const row = document.createElement("li");
    row.className = "engine-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!settings.engines[id];
    checkbox.addEventListener("change", () => {
      settings.engines[id] = checkbox.checked;
      saveSettings();
    });

    const icon = document.createElement("img");
    icon.className = "engine-icon";
    icon.src = browser.runtime.getURL(engine.icon[32]);
    icon.alt = "";

    const label = document.createElement("span");
    label.className = "engine-name";
    label.textContent = engine.manualUpload ? `${engine.name} (manual paste/upload)` : engine.name;

    const upBtn = document.createElement("button");
    upBtn.className = "order-btn";
    upBtn.textContent = "↑";
    upBtn.title = "Move up";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => moveEngine(index, -1));

    const downBtn = document.createElement("button");
    downBtn.className = "order-btn";
    downBtn.textContent = "↓";
    downBtn.title = "Move down";
    downBtn.disabled = index === settings.order.length - 1;
    downBtn.addEventListener("click", () => moveEngine(index, 1));

    row.append(checkbox, icon, label, upBtn, downBtn);
    list.appendChild(row);
  });

  document.getElementById("open-in-background").checked = settings.openInBackground;
}

document.getElementById("open-in-background").addEventListener("change", (event) => {
  settings.openInBackground = event.target.checked;
  saveSettings();
});

document.getElementById("reset-defaults").addEventListener("click", () => {
  settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  saveSettings();
  render();
});

(async () => {
  await loadSettings();
  render();
})();
