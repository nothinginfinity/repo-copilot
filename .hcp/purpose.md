# repo-copilot — HCP Purpose

## What This Repo Is

`repo-copilot` is the **orchestration layer** for a multi-agent, HTML-native software deployment system. It is the home of the Repo Copilot app itself and the reference implementation for all protocol standards (HCP, gitzip, ContextFrames, HyperFrames, M-MCP Rooms).

## Role in the Network

| Layer | This repo's role |
|---|---|
| HyperFrames | Consumer — renders HTML-native video compositions |
| ContextFrames | Host — ships the runtime player (`runtime/context-frame-player.js`) |
| gitzip-push | Dogfood target — deploys its own updates via `.gitzip/manifest.json` |
| M-MCP Rooms | Participant — Bob/Alice agents operate within the spaces/ protocol |
| HCP | **Origin** — defines and seeds the `.hcp/` standard |

## What It Does NOT Do

- It is not a backend server
- It is not a database
- It does not store user data
- It does not execute untrusted code at runtime

## Why HTML as Artifact Format

HTML is the correct artifact format for agent-generated software because it is:
- Easy for agents to write and verify
- Instantly previewable by humans
- Deployable with zero build step
- Self-contained (inline CSS + JS + content)
- Inspectable without tooling

## Vision

MCP connects intelligence to capabilities. gitzip-push converts intelligence **into** capabilities — turning agent-generated HTML artifacts into live, deployed software. This repo is the proof that the loop closes.
