const localStorageStateKey = 'dashboard-tiles-badges';

function fetchConfig() {
  return JSON.parse(window.localStorage.getItem(localStorageStateKey));
}

function saveConfig(config) {
  if (typeof (config) !== 'string') {
    config = JSON.stringify(config);
  }
  window.localStorage.setItem(localStorageStateKey, config);
}

export { fetchConfig, saveConfig };
