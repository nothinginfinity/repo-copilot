/**
 * context-frame-player.js  —  ContextFrames Runtime v0.1.0
 *
 * HTML-native Context App composition for agents.
 *
 * A ContextFrame is a self-contained HTML artifact (iframe) that:
 *   - Emits typed events to its host via postMessage
 *   - Receives commands from its host via postMessage
 *   - Declares its own capabilities via a READY event
 *   - Manages its own lifecycle (mount, update, destroy)
 *
 * Usage (inside a ContextFrame artifact):
 *
 *   <script src="../../runtime/context-frame-player.js"></script>
 *   <script>
 *     ContextFrame.ready({ id: 'repo-match-card', version: '0.1.0' });
 *     ContextFrame.on('update', (payload) => { render(payload); });
 *     ContextFrame.emit('action', { type: 'card-clicked', repoId: '123' });
 *   </script>
 *
 * Usage (inside a host page):
 *
 *   <script src="runtime/context-frame-player.js"></script>
 *   <script>
 *     const host = ContextFrameHost.mount('#my-iframe');
 *     host.on('action', (payload) => console.log('Frame action:', payload));
 *     host.send('update', { repo: 'nothinginfinity/repo-copilot' });
 *   </script>
 */

(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const SOURCE  = 'context-frame';
  const isFrame = global.self !== global.top;

  // ── Shared utilities ────────────────────────────────────────────────────────

  function makeEnvelope(type, payload, meta) {
    return {
      source:  SOURCE,
      version: VERSION,
      type,
      payload: payload ?? null,
      meta:    meta   ?? {},
      ts:      Date.now()
    };
  }

  // ── ContextFrame API (runs inside the iframe artifact) ───────────────────────

  const ContextFrame = {
    _handlers: {},
    _meta: {},

    /**
     * Declare this frame ready and announce capabilities to the host.
     * Call once, after your DOM is set up.
     *
     * @param {Object} meta  - { id, version, capabilities[] }
     */
    ready(meta) {
      if (!isFrame) {
        console.warn('[ContextFrame] ready() called outside of an iframe — no-op.');
        return;
      }
      this._meta = meta || {};
      this._startListening();
      this._send('ready', { capabilities: meta.capabilities || [] }, meta);
    },

    /**
     * Emit an event to the host.
     *
     * @param {string} type    - Event type (e.g. 'action', 'data', 'error')
     * @param {*}      payload - Any serialisable value
     */
    emit(type, payload) {
      if (!isFrame) {
        console.warn('[ContextFrame] emit() called outside of an iframe — no-op.');
        return;
      }
      this._send(type, payload);
    },

    /**
     * Register a handler for messages from the host.
     *
     * @param {string}   type    - Message type to handle
     * @param {Function} handler - (payload) => void
     */
    on(type, handler) {
      if (!this._handlers[type]) this._handlers[type] = [];
      this._handlers[type].push(handler);
      return this; // chainable
    },

    /** Remove all handlers for a given type (or all handlers if no type). */
    off(type) {
      if (type) delete this._handlers[type];
      else this._handlers = {};
    },

    // ── Internal ────────────────────────────────────────────────────────────

    _send(type, payload, meta) {
      const envelope = makeEnvelope(type, payload, meta || this._meta);
      global.parent.postMessage(envelope, '*');
    },

    _startListening() {
      global.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || msg.source !== SOURCE + '-host') return;
        const handlers = this._handlers[msg.type] || [];
        handlers.forEach(fn => {
          try { fn(msg.payload, msg); }
          catch (e) { console.error('[ContextFrame] Handler error:', e); }
        });
      });
    }
  };

  // ── ContextFrameHost API (runs in the host page) ─────────────────────────────

  const ContextFrameHost = {
    /**
     * Mount a host bridge onto an <iframe> element.
     *
     * @param {string|HTMLIFrameElement} target  - CSS selector or element ref
     * @returns {FrameBridge}
     */
    mount(target) {
      const el = typeof target === 'string'
        ? document.querySelector(target)
        : target;

      if (!el || el.tagName !== 'IFRAME') {
        throw new Error('[ContextFrameHost] mount() requires a valid <iframe> element.');
      }

      return new FrameBridge(el);
    }
  };

  // ── FrameBridge ──────────────────────────────────────────────────────────────

  class FrameBridge {
    constructor(iframe) {
      this._iframe   = iframe;
      this._handlers = {};
      this._ready    = false;

      global.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || msg.source !== SOURCE) return;
        // Only handle messages from this specific iframe
        if (event.source !== iframe.contentWindow) return;

        if (msg.type === 'ready') this._ready = true;

        const handlers = this._handlers[msg.type] || [];
        const wildcards = this._handlers['*']     || [];
        [...handlers, ...wildcards].forEach(fn => {
          try { fn(msg.payload, msg); }
          catch (e) { console.error('[ContextFrameHost] Handler error:', e); }
        });
      });
    }

    /**
     * Send a command to the frame.
     *
     * @param {string} type    - Command type (e.g. 'update', 'reset', 'destroy')
     * @param {*}      payload - Any serialisable value
     */
    send(type, payload) {
      const envelope = makeEnvelope(type, payload);
      envelope.source = SOURCE + '-host';
      this._iframe.contentWindow?.postMessage(envelope, '*');
      return this;
    }

    /**
     * Listen for events from the frame.
     *
     * @param {string}   type    - Event type, or '*' for all events
     * @param {Function} handler - (payload, envelope) => void
     */
    on(type, handler) {
      if (!this._handlers[type]) this._handlers[type] = [];
      this._handlers[type].push(handler);
      return this;
    }

    /** Remove handlers. */
    off(type) {
      if (type) delete this._handlers[type];
      else this._handlers = {};
    }

    /** True once the frame has fired its 'ready' event. */
    get isReady() { return this._ready; }

    /** Destroy the bridge and remove the iframe from the DOM. */
    destroy() {
      this.off();
      this._iframe.remove();
    }
  }

  // ── Expose globally ──────────────────────────────────────────────────────────

  global.ContextFrame     = ContextFrame;
  global.ContextFrameHost = ContextFrameHost;
  global.ContextFrame.VERSION = VERSION;

}(typeof globalThis !== 'undefined' ? globalThis : window));
