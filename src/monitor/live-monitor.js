const fs = require('fs');
const path = require('path');

function stopLiveMonitor(state) {
  if (state?.watcher) {
    try {
      state.watcher.close();
    } catch {
      // ignore
    }
  }
}

function createLiveMonitor(targetPath, sendMonitorEvent, previousState = {}) {
  const resolved = path.resolve(targetPath);

  if (!fs.existsSync(resolved)) {
    throw new Error('Target does not exist.');
  }

  stopLiveMonitor(previousState);

  const state = {
    watcher: null,
    targetPath: resolved
  };

  state.watcher = fs.watch(resolved, { recursive: true }, (eventType, filename) => {
    sendMonitorEvent({
      eventType,
      filename: filename || 'unknown',
      targetPath: resolved,
      time: new Date().toISOString()
    });
  });

  return state;
}

module.exports = {
  createLiveMonitor,
  stopLiveMonitor
};