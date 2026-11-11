export function cardLimit(value) {
  return Math.max(3, Math.min(10, Math.trunc(Number(value)) || 5));
}

export function isDamageCard(message, isGM) {
  return Boolean(isGM && message?.visible && message.type === "midi-qol.damage"
    && message.system?.player === false && !message.flags?.["midi-qol"]?.playerDamageCard
    && Array.isArray(message.flags?.["midi-qol"]?.undoDamage));
}

export function latestCards(messages, limit, isGM) {
  let result = [];
  for (let index = messages.length - 1; index >= 0 && result.length < cardLimit(limit); index--) {
    if (isDamageCard(messages[index], isGM)) result.push(messages[index]);
  }
  return result;
}

export class DamageFeed {
  constructor({ source, isGM, limit, render, commit, error, delay = 75 }) {
    Object.assign(this, { source, isGM, limit, render, commit, error, delay });
    this.active = false;
    this.generation = 0;
    this.revision = 0;
    this.cards = [];
    this.dirty = new Set();
    this.nodes = new Map();
    this.timer = null;
    this.running = false;
  }

  open() {
    this.stop();
    this.active = true;
    this.reload();
  }

  stop() {
    this.active = false;
    this.generation++;
    clearTimeout(this.timer);
    this.timer = null;
    this.cards = [];
    this.dirty.clear();
    this.nodes.clear();
  }

  reload() {
    if (!this.active) return;
    this.cards = latestCards(this.source(), this.limit(), this.isGM());
    for (let message of this.cards) if (!this.nodes.has(message.id)) this.dirty.add(message.id);
    this.schedule();
  }

  changed(message, deleted = false) {
    if (!this.active) return;
    let existing = this.cards.some(card => card.id === message.id);
    if (deleted || !isDamageCard(message, this.isGM())) {
      if (existing) this.reload();
      return;
    }
    if (!existing) {
      this.cards.unshift(message);
      this.cards.sort((a, b) => b.timestamp - a.timestamp);
      this.cards.length = Math.min(this.cards.length, cardLimit(this.limit()));
    } else {
      this.cards = this.cards.map(card => card.id === message.id ? message : card);
    }
    if (this.cards.some(card => card.id === message.id)) {
      this.dirty.add(message.id);
      this.schedule();
    }
  }

  schedule() {
    this.revision++;
    if (!this.active || this.timer || this.running) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, this.delay);
  }

  async flush() {
    if (!this.active || this.running) return;
    this.running = true;
    let generation = this.generation;
    let revision = this.revision;
    let cards = [...this.cards];
    let dirty = new Set(this.dirty);
    this.dirty.clear();
    let next = new Map();
    try {
      for (let message of cards) {
        let node = this.nodes.get(message.id);
        if (!node || dirty.has(message.id)) {
          try { node = await this.render(message); }
          catch (error) { node = this.error(error, message); }
        }
        if (!this.active || generation !== this.generation) return;
        next.set(message.id, node);
      }
      if (revision !== this.revision) {
        for (let id of dirty) this.dirty.add(id);
        return;
      }
      this.nodes = next;
      this.commit(cards.map(card => next.get(card.id)));
    } finally {
      this.running = false;
      if (this.active && (revision !== this.revision || generation !== this.generation)) this.schedule();
    }
  }
}
