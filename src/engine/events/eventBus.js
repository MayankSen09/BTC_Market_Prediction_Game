/**
 * BITCOIN WAR — Normalized Event Bus
 * Dispatches unified market events across 3D WebGL Scene, Audio Engine, & UI Panels.
 */

class NormalizedEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) callbacks.delete(callback);
    };
  }

  emit(eventType, payload) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in event listener for ${eventType}:`, e);
        }
      });
    }

    // Also trigger wildcard listener '*'
    const wildcards = this.listeners.get('*');
    if (wildcards) {
      wildcards.forEach((cb) => cb(eventType, payload));
    }
  }
}

export const eventBus = new NormalizedEventBus();
