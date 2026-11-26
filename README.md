# The Hurt Locker

[![The Hurt Locker 1.1.0](https://img.shields.io/badge/The%20Hurt%20Locker-1.1.0-435D8C?style=for-the-badge)](https://github.com/MotoMoto1234/the-hurt-locker/releases/tag/v1.1.0)
[![Foundry VTT 13.351](https://img.shields.io/badge/Foundry%20VTT-13.351-287D3C?style=for-the-badge&logo=foundryvirtualtabletop&logoColor=white)](#compatibility-and-behavior)
[![D&D 5e 5.2.5](https://img.shields.io/badge/D%26D%205e-5.2.5-A12635?style=for-the-badge&logo=dungeonsanddragons&logoColor=white)](#compatibility-and-behavior)
[![Midi-QOL 13.0.72](https://img.shields.io/badge/Midi--QOL-13.0.72-684785?style=for-the-badge)](#compatibility-and-behavior)

[![Buy me a coffee on Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/motomoto0295)

> [!IMPORTANT]
> **My release-testing pledge**  
> I test every build in my live Foundry games before releasing it. Hotfixes are the only exception. This pledge applies to all of my Foundry modules.

A GM-only floating window for the latest Midi-QOL GM damage cards and optional NPC recharge results. Version **1.1.0**. The module ID is **the-hurt-locker**.

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

**Automatically open and close with combat** is enabled by default in module settings, separately for each client. The GM window opens when an encounter starts and closes when the last running encounter ends or resets to round zero. Ordinary turns do not reopen a manually closed window. Disable the setting to use only manual controls.

Enable **Include NPC recharge cards** in module settings to see each NPC item's name, whether it recharged, and the roll total in one compact row. The setting is off by default and applies to the current client. It includes manual NPC recharge rolls and automatic rolls posted to chat by dnd5e. Set dnd5e's NPC auto-recharge option to post to chat if you want automatic results in The Hurt Locker. Recharge and damage cards share the **Keep** limit.

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
- New NPC recharge messages store the item name as chat metadata when dnd5e creates the message. The module does not update existing chat documents, `message.logged`, Chat Log Prune state, or actor data. Damage actions are Midi-QOL's native controls.

Rendering a damage card still invokes Foundry/system/module render hooks. A busy module stack or a card with many targets can therefore have a cost even with a small cap. These bounds control this module's workload; they do not eliminate all browser reflow or third-party hook work.

## Compatibility and behavior

Reference versions inspected: Foundry **13.351**, dnd5e **5.2.5**, Midi-QOL **13.0.72**, Chat Log Prune **1.1.10**. CPR **1.5.51** utilities were reviewed; this module does not need an additional CPR dependency. Foundry 14 is not declared supported.

The module renders damage cards using Foundry's message renderer, allowing dnd5e's damage-message model to attach Midi-QOL's apply, undo, and multiplier handlers. It does not manually attach a second set of damage handlers or forward clicks into the main chat. The original chat remains intact, and DOM pruning in the main chat does not remove cards here. Actual message deletion does remove/refill cards here.

Damage cards in The Hurt Locker show a small timestamp above the expanded target rows. The sender and whisper header and the HP status heading are omitted from this view.

**Native feedback limitation:** Midi-QOL updates apply/undo highlighting and some damage display directly in the clicked card's DOM. Those visual changes are not saved to the ChatMessage, so two rendered copies do not automatically share that feedback, and reopening can restore the original presentation. ChatMessage document updates do refresh the corresponding card. This module does not introduce global DOM observers or replace Midi-QOL's damage implementation to synchronize local feedback.

The window omits the original message delete/dismiss controls. Use the regular chat for chat management. It does not add chat history pagination or promise a full set of ChatLog context-menu actions.

## Validation

Automated tests cover filtering, recharge visibility, the shared card limit, ignored chat spam, selective rendering, and updates during open and close. A headless browser harness uses the module UI and the Midi-QOL 13.0.73 template and CSS against a mocked Foundry runtime to check both compact card layouts, retained controls, and scrolling.

This is **not a live-world integration or frame-time benchmark**. Before relying on it in a session, check native apply/undo/multiplier behavior on a test actor, the chat button with Chat Log Prune enabled, position restoration after reload, and responsiveness with your actual module stack. Do not test damage actions on a live encounter you need to preserve.

Rebuild packages from the repository root with Python 3:

```
python tools/build_release.py
```

By default, the builder writes the packages to `dist/v1.1.0/`. Use `--output <directory>` to choose another output directory. Workspace release artifacts are saved under `Temp/the-hurt-locker/v1.1.0/`. See `RELEASE-SETUP.md` for publishing instructions. The development test harness depends on local Foundry reference copies and is not bundled.
