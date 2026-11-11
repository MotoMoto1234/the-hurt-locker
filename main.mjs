import { cardLimit, DamageFeed } from "./feed.mjs";

let ID = "the-hurt-locker";
let locker;
let toggling = false;
let buttons = new Set();
let preferenceWrites = Promise.resolve();

function save(key, value) {
  preferenceWrites = preferenceWrites.then(() => game.settings.set(ID, key, value)).catch(error => {
    console.error("The Hurt Locker | Could not save preference", error);
  });
  return preferenceWrites;
}

function updateButtons() {
  for (let button of buttons) {
    if (!button.isConnected) { buttons.delete(button); continue; }
    button.setAttribute("aria-pressed", String(Boolean(locker?.rendered)));
  }
}

function addButton(app, element) {
  if (!game.user.isGM) return;
  let root = element instanceof HTMLElement ? element : element?.[0];
  let controls = root?.querySelector("#chat-controls .control-buttons")
    ?? document.querySelector("#chat-controls .control-buttons");
  if (!controls || controls.querySelector(".hurt-locker-toggle")) return;
  let button = document.createElement("button");
  button.type = "button";
  button.className = "ui-control icon fa-solid fa-vault hurt-locker-toggle";
  button.setAttribute("aria-label", "Toggle The Hurt Locker");
  button.setAttribute("title", "The Hurt Locker — GM damage cards");
  button.addEventListener("click", () => void toggle());
  controls.append(button);
  buttons.add(button);
  updateButtons();
}

class HurtLocker extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: ID,
    classes: ["hurt-locker"],
    window: { title: "The Hurt Locker", icon: "fa-solid fa-vault", resizable: true, minimizable: true },
    position: { width: 440, height: 620 }
  };

  constructor(options = {}) {
    super(options);
    this.feed = new DamageFeed({
      source: () => game.messages.contents,
      isGM: () => game.user.isGM,
      limit: () => game.settings.get(ID, "cardLimit"),
      render: message => this.renderCard(message),
      commit: nodes => this.commitCards(nodes),
      error: (error, message) => {
        console.error(`The Hurt Locker | Could not render card ${message.id}`, error);
        let node = document.createElement("li");
        node.className = "hl-card-error";
        node.dataset.messageId = message.id;
        node.textContent = "This card could not be rendered. Check the original in chat.";
        return node;
      }
    });
    this.savePosition = foundry.utils.debounce(position => void save("position", position), 300);
  }

  _canRender() { return game.user.isGM; }

  async _renderHTML() {
    let shell = document.createElement("div");
    shell.className = "hl-shell";
    shell.innerHTML = `
      <header class="hl-banner">
        <div class="hl-insignia" aria-hidden="true"><i class="fa-solid fa-vault"></i></div>
        <div><div class="hl-eyebrow">GAME MASTER / DAMAGE CONTROL</div><h2>The Hurt Locker</h2></div>
        <span class="hl-badge">GM ONLY</span>
      </header>
      <div class="hl-toolbar">
        <span><span class="hl-status-dot" aria-hidden="true"></span> Latest damage cards</span>
        <label>Keep <select class="hl-limit" aria-label="Number of damage cards to keep">
          ${Array.from({ length: 8 }, (_, index) => `<option value="${index + 3}">${index + 3}</option>`).join("")}
        </select></label>
      </div>
      <div class="hl-scroll hl-at-top">
        <div class="hl-empty"><i class="fa-solid fa-shield-heart" aria-hidden="true"></i>
          <h3>All quiet. For now.</h3><p>New Midi-QOL GM damage cards will appear here.</p>
          <p class="hl-hint">Midi-QOL must be configured to create GM damage cards.</p>
        </div>
        <ol class="hl-cards themed theme-light" aria-label="Recent GM damage cards, newest first"></ol>
      </div>
      <footer class="hl-footer"><span class="hl-count">0 cards</span><span>NEWEST FIRST <span aria-hidden="true">↑</span></span></footer>`;
    let select = shell.querySelector(".hl-limit");
    select.value = String(cardLimit(game.settings.get(ID, "cardLimit")));
    select.addEventListener("change", () => void save("cardLimit", cardLimit(select.value)));
    let scroll = shell.querySelector(".hl-scroll");
    scroll.addEventListener("scroll", () => {
      scroll.classList.toggle("hl-at-top", scroll.scrollTop <= 2);
    }, { passive: true });
    return shell;
  }

  _replaceHTML(result, content) { content.replaceChildren(result); }

  _onRender() {
    this.feed.open();
    void save("open", true);
    updateButtons();
  }

  _onPosition(position) {
    if (!this.rendered || this.minimized) return;
    let { top, left, width, height } = position;
    if ([top, left, width, height].every(Number.isFinite)) this.savePosition({ top, left, width, height });
  }

  async close(options = {}) {
    this.feed.stop();
    await super.close(options);
    void save("open", false);
    updateButtons();
    return this;
  }

  async renderCard(message) {
    let node = await foundry.applications.sidebar.tabs.ChatLog.renderMessage(message);
    node.classList.add("hl-card");
    node.querySelectorAll(".message-delete, .message-dismiss").forEach(control => control.remove());
    return node;
  }

  commitCards(nodes) {
    let list = this.element?.querySelector(".hl-cards");
    if (!list) return;
    let scroll = this.element.querySelector(".hl-scroll");
    let atTop = scroll.scrollTop <= 2;
    scroll.classList.toggle("hl-at-top", atTop);
    let keep = new Set(nodes);
    for (let child of [...list.children]) if (!keep.has(child)) child.remove();
    for (let index = 0; index < nodes.length; index++) {
      if (list.children[index] !== nodes[index]) list.insertBefore(nodes[index], list.children[index] ?? null);
    }
    this.element.querySelector(".hl-empty").hidden = nodes.length > 0;
    this.element.querySelector(".hl-count").textContent = `${nodes.length} / ${cardLimit(game.settings.get(ID, "cardLimit"))} cards`;
    if (atTop) scroll.scrollTop = 0;
  }
}

function restoredPosition() {
  let saved = game.settings.get(ID, "position");
  let width = Math.min(Math.max(Number(saved.width) || 440, 340), window.innerWidth);
  let height = Math.min(Math.max(Number(saved.height) || 620, 300), window.innerHeight);
  let position = { width, height };
  if (Number.isFinite(saved.left)) position.left = Math.max(0, Math.min(saved.left, window.innerWidth - width));
  if (Number.isFinite(saved.top)) position.top = Math.max(0, Math.min(saved.top, window.innerHeight - height));
  return position;
}

async function toggle() {
  if (!game.user.isGM || toggling) return;
  toggling = true;
  try {
    locker ??= new HurtLocker({ position: restoredPosition() });
    if (locker.rendered) await locker.close();
    else await locker.render({ force: true, position: restoredPosition() });
  } catch (error) {
    console.error("The Hurt Locker | Could not toggle window", error);
    ui.notifications.error("The Hurt Locker could not open. See the console for details.");
  } finally { toggling = false; }
}

Hooks.once("init", () => {
  game.settings.register(ID, "cardLimit", {
    name: "Damage cards to keep", hint: "Maximum cards rendered in The Hurt Locker (3–10). Newest cards appear first.",
    scope: "client", config: true, type: Number, default: 5, range: { min: 3, max: 10, step: 1 },
    onChange: value => {
      let select = locker?.element?.querySelector(".hl-limit");
      if (select) select.value = String(cardLimit(value));
      locker?.feed.reload();
    }
  });
  game.settings.register(ID, "position", { scope: "client", config: false, type: Object, default: {} });
  game.settings.register(ID, "open", { scope: "client", config: false, type: Boolean, default: false });
  game.keybindings.register(ID, "toggle", {
    name: "Toggle The Hurt Locker", hint: "Show or close your GM damage-card window.",
    editable: [{ key: "KeyH", modifiers: ["Alt"] }], restricted: true,
    onDown: () => { void toggle(); return true; }
  });
});

Hooks.once("ready", () => {
  if (!game.user.isGM) return;
  if (!game.modules.get("midi-qol")?.active) {
    ui.notifications.warn("The Hurt Locker requires Midi-QOL to be enabled.");
    return;
  }
  game.modules.get(ID).api = Object.freeze({ toggle });
  Hooks.on("renderChatLog", addButton);
  Hooks.on("renderChatInput", addButton);
  Hooks.on("createChatMessage", message => locker?.feed.changed(message));
  Hooks.on("updateChatMessage", message => locker?.feed.changed(message));
  Hooks.on("deleteChatMessage", message => locker?.feed.changed(message, true));
  addButton(ui.chat, ui.chat?.element);
  if (game.settings.get(ID, "open")) void toggle();
});
