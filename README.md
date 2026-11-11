# The Hurt Locker

A GM-only floating window for the latest Midi-QOL GM damage cards. Dark steel framing, warm brass accents, and readable native cards. Release **1.0** (manifest version **1.0.0**); module ID **the-hurt-locker**.

## Install and use

Install through Foundry Setup using this Manifest URL:

```
https://github.com/MotoMoto1234/the-hurt-locker/releases/latest/download/module.json
```

Or install manually:

1. Extract the release ZIP into your Foundry user-data `Data/modules` directory. The result should be `Data/modules/the-hurt-locker/module.json`.
2. Enable **The Hurt Locker** in Manage Modules alongside Midi-QOL, then reload.
3. Click the vault button beside the chat controls, or press **Alt+H**. Rebind it in Configure Controls → The Hurt Locker if that shortcut is already used.
4. Set **Keep** to 3–10 cards (default: 5). This is also available in module settings.

Move and resize the window normally. Position, dimensions, card limit, and whether it was open are remembered on this client. An open window returns after reloading. Closing it stops all card rendering and releases its card DOM; reopening loads the latest matching messages. The normal Foundry minimize control is also available, but minimizing does not stop updates; use the toggle or close button to do that.

Cards are ordered newest first. Midi-QOL must be configured to create GM damage cards. Player damage cards, ordinary rolls, and other chat messages do not appear. Existing stored cards of the current Midi-QOL damage-message type can populate the window immediately. Legacy HTML-only cards from older Midi-QOL versions are deliberately excluded.

When already at the top (within 2 pixels), new or updated cards keep the view at the top. Browser scroll anchoring is disabled there so delayed content growth does not move the view away. When reading farther down, the module does not force a scroll; normal browser anchoring applies, subject to cards being replaced or removed by the limit.

The API `game.modules.get("the-hurt-locker").api.toggle()` is available to GMs.

## Performance design

- A separate ApplicationV2, not a second ChatLog and not a replacement for `CONFIG.ui.chat`.
- At most 3–10 connected card elements; no hidden backlog of rendered messages.
- One backwards pass over message data on opening, refilling after a retained card disappears, or changing the limit. Ordinary chat traffic does not rescan history.
- Creation and updates filter message metadata first. Relevant bursts coalesce over 75 ms. Only new or changed cards render; unaffected nodes remain in place.
- Rendering is serialized and stale asynchronous results are discarded on changes or closing. Detached replacement elements are assembled before the DOM update.
- No polling, MutationObserver, custom animation, backdrop blur, or chat DOM scanning. Each card batch reads the scroll position once before DOM changes and resets it only if already at the top; it does not measure individual card heights. The fixed-size window has a separately scrolling area with layout containment.
- No writes to chat documents, `message.logged`, Chatlog Prune state, or actor data by this module. Damage actions are Midi-QOL's native controls.

Rendering a card still invokes Foundry/system/module render hooks. A busy module stack or a card with many targets can therefore have a cost even with a small cap. These bounds control this module's workload; they do not eliminate all browser reflow or third-party hook work.

## Compatibility and behavior

Reference versions inspected: Foundry **13.351**, dnd5e **5.2.5**, Midi-QOL **13.0.72**, Chat Log Prune **1.1.10**. CPR **1.5.51** utilities were reviewed; this module does not need an additional CPR dependency. Foundry 14 is not declared supported.

The module renders the original message using Foundry's message renderer, allowing dnd5e's damage-message model to attach Midi-QOL's apply, undo, and multiplier handlers. It does not manually attach a second set of damage handlers or forward clicks into the main chat. The original chat remains intact, and DOM pruning in the main chat does not remove cards here. Actual message deletion does remove/refill cards here.

**Native feedback limitation:** Midi-QOL updates apply/undo highlighting and some damage display directly in the clicked card's DOM. Those visual changes are not saved to the ChatMessage, so two rendered copies do not automatically share that feedback, and reopening can restore the original presentation. ChatMessage document updates do refresh the corresponding card. This module does not introduce global DOM observers or replace Midi-QOL's damage implementation to synchronize local feedback.

The window omits the original message delete/dismiss controls. Use the regular chat for chat management. It does not add chat history pagination or promise a full set of ChatLog context-menu actions.

## Validation

Automated feed tests cover filtering, the card cap, 10,000-message history, ignored chat spam, burst coalescing, retained node identity, deletion/refill, permission visibility, same-time arrivals, render errors, and close/update races. A headless browser harness uses the module UI and the supplied Midi-QOL template/CSS against a mocked Foundry runtime to check toggle, limit changes, selective replacement, reopening, and width.

This is **not a live-world integration or frame-time benchmark**. Before relying on it in a session, check native apply/undo/multiplier behavior on a test actor, the chat button with Chat Log Prune enabled, position restoration after reload, and responsiveness with your actual module stack. Do not test damage actions on a live encounter you need to preserve.

Rebuild packages from the repository root with Python 3:

```
python tools/build_release.py
```

Output: `dist/v1.0.0/`. See `RELEASE-SETUP.md` for publishing instructions. The development test harness depends on local Foundry reference copies and is not bundled.
