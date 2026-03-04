import apiClient from "./apiClient";

const state = new Map();

export function sendProgressDebounced(videoId, payload, delay = 5000) {
  const key = String(videoId);
  const now = Date.now();
  const entry = state.get(key) || { lastSentAt: 0, timer: null, latestPayload: null };
  entry.latestPayload = payload;

  const dueIn = Math.max(0, delay - (now - entry.lastSentAt));
  if (entry.timer) {
    state.set(key, entry);
    return;
  }

  const timer = setTimeout(async () => {
    const current = state.get(key);
    if (!current || !current.latestPayload) return;
    try {
      await apiClient.post(`/progress/videos/${videoId}`, current.latestPayload);
      current.lastSentAt = Date.now();
    } catch (e) {
      // Ignore transient errors. Next interval will retry.
    } finally {
      current.timer = null;
      state.set(key, current);
    }
  }, dueIn);

  entry.timer = timer;
  state.set(key, entry);
}

export async function flushProgress(videoId, payload) {
  const key = String(videoId);
  const existing = state.get(key);
  if (existing?.timer) {
    clearTimeout(existing.timer);
  }
  try {
    await apiClient.post(`/progress/videos/${videoId}`, payload);
  } catch (e) {
    // Ignore transient errors.
  } finally {
    state.delete(key);
  }
}
