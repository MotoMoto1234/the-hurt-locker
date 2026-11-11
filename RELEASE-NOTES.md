# The Hurt Locker 1.0

The first public release of The Hurt Locker: a focused GM window for your latest Midi-QOL damage cards.

- Toggle from chat or with **Alt+H** (rebindable).
- Keep **3-10 cards**, defaulting to five, newest first.
- Use native Midi-QOL apply, undo, and damage multiplier controls.
- Remember position, size, and open state; minimize to a compact title-bar tab.
- Stay at the top when already there, without forcing a jump when reading older cards.
- Compact avatars and a dark steel/brass frame.

Built with a bounded card DOM, grouped updates, and selective rendering. Unrelated chat messages do not render in this window, and closing it stops card rendering. Performance depends on card complexity and your module stack; no live-world frame-time benchmark is claimed.

**Requirements:** Foundry VTT 13.351+ within generation 13; dnd5e 5.2.5+; Midi-QOL 13.0.72+. Reference versions: 13.351 / 5.2.5 / 13.0.72. Foundry 14 is not declared supported. Configure Midi-QOL to create GM damage cards.

**Known limitation:** apply/undo button feedback does not synchronize between The Hurt Locker and main chat. This release deliberately avoids adding cross-window synchronization work. Damage actions still use Midi-QOL's native handlers.

## Install

Paste into Foundry's Install Module > Manifest URL:

```
https://github.com/MotoMoto1234/the-hurt-locker/releases/latest/download/module.json
```

Or extract `the-hurt-locker-v1.0.0.zip` into `Data/modules`, enable the module, and reload.

**Local testers:** public 1.0.0 includes all fixes from development builds 1.0.1-1.0.3. Replace those builds manually; their higher version numbers may prevent Foundry from offering this as an update.
