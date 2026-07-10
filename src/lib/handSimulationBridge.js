// ============================================================
// HAND SIMULATION WORKER BRIDGE
// ============================================================

let _worker = null;
let _callId = 0;
const _pending = new Map();

function getWorker() {
  if (!_worker) {
    _worker = new Worker(new URL('../workers/handSimulationWorker.js', import.meta.url), { type: 'module' });
    _worker.onmessage = (e) => {
      const { type, callId, data, done, total, message } = e.data;
      const pending = _pending.get(callId);
      if (!pending) return;
      if (type === 'PROGRESS') { pending.onProgress?.(done, total); return; }
      if (type === 'RESULT') { _pending.delete(callId); pending.resolve(data); return; }
      if (type === 'ERROR') { _pending.delete(callId); pending.reject(new Error(message)); return; }
    };
    _worker.onerror = (err) => {
      for (const p of _pending.values()) p.reject(err);
      _pending.clear();
      _worker = null;
    };
  }
  return _worker;
}

export function runHandSimulation(params, onProgress) {
  const callId = ++_callId;
  const worker = getWorker();
  return new Promise((resolve, reject) => {
    _pending.set(callId, { resolve, reject, onProgress });
    worker.postMessage({ type: 'RUN', payload: { ...params, callId } });
  });
}

export function abortHandSimulation() {
  if (_worker) {
    _worker.terminate();
    _worker = null;
  }
  for (const p of _pending.values()) p.reject(new Error('Aborted'));
  _pending.clear();
}