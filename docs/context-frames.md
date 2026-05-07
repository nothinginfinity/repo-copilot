# ContextFrames — HTML-native Context App Composition

ContextFrames is the runtime that makes HTML artifacts composable. An agent generates a self-contained HTML file (a **ContextFrame**); a host page embeds it in an iframe and communicates with it via a typed postMessage protocol. The runtime (`context-frame-player.js`) is the bridge.

## Quick Start

### Inside a ContextFrame artifact

```html
<script src="../../runtime/context-frame-player.js"></script>
<script>
  // 1. Announce capabilities to the host
  ContextFrame.ready({
    id:           'my-card',
    version:      '0.1.0',
    capabilities: ['render', 'action:clicked']
  });

  // 2. Listen for commands from the host
  ContextFrame.on('update', (data) => {
    document.getElementById('title').textContent = data.title;
  });

  // 3. Emit events to the host
  document.querySelector('button').addEventListener('click', () => {
    ContextFrame.emit('action', { type: 'clicked', id: 'my-card' });
  });
</script>
```

### Inside a host page

```html
<iframe id="my-frame" src="./my-card.html"></iframe>
<script src="runtime/context-frame-player.js"></script>
<script>
  const host = ContextFrameHost.mount('#my-frame');

  // Send data to the frame
  host.on('ready', () => host.send('update', { title: 'Hello World' }));

  // Receive events from the frame
  host.on('action', (payload) => console.log('Frame action:', payload));
</script>
```

## Message Envelope

Every message is a plain JSON object:

```json
{
  "source":  "context-frame",
  "version": "0.1.0",
  "type":    "action",
  "payload": { "type": "card-clicked", "repoId": "123" },
  "meta":    { "id": "repo-match-card" },
  "ts":      1746621600000
}
```

Host-to-frame messages use `source: "context-frame-host"`.

## Standard Event Types

| Direction | Type | Payload | Meaning |
|---|---|---|---|
| Frame → Host | `ready` | `{ capabilities[] }` | Frame mounted, ready to receive commands |
| Frame → Host | `action` | `{ type, ...data }` | User interaction occurred |
| Frame → Host | `data` | any | Frame wants to share data with host |
| Frame → Host | `error` | `{ message, code }` | Frame encountered an error |
| Host → Frame | `update` | any | Host sending new data to render |
| Host → Frame | `reset` | null | Host requesting frame return to empty state |
| Host → Frame | `destroy` | null | Host about to remove the iframe |

## Security

ContextFrames uses `sandbox="allow-scripts allow-same-origin"` on iframes. The runtime validates `event.source` against the specific iframe's `contentWindow` before dispatching events to handlers, preventing cross-frame message injection. Origin checking (`event.origin`) is recommended for production deployments.

## Architecture in the Five-Layer Stack

```
HyperFrames          — HTML-native video composition
ContextFrames  ← YOU ARE HERE
  └ agent generates a ContextFrame .html artifact
  └ host page composes multiple frames
  └ frames communicate via typed postMessage (this runtime)
gitzip-push          — deploys the .html artifacts
M-MCP Rooms          — multiplayer runtime where frames are used collaboratively
HCP                  — memory/protocol layer (.hcp/ directory standard)
```

## Files

| File | Purpose |
|---|---|
| `runtime/context-frame-player.js` | The runtime (ContextFrame + ContextFrameHost + FrameBridge APIs) |
| `examples/repo-match-card.html` | Reference ContextFrame artifact — renders a repo card, emits click actions |
| `examples/context-frames-host.html` | Reference host — mounts multiple frames, shows live event log |
