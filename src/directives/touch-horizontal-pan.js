// taken from https://github.com/quasarframework/quasar/blob/v1-work/src/utils/event.js

const listenOpts = {};

Object.defineProperty(listenOpts, "passive", {
  configurable: true,
  get() {
    let passive;

    try {
      var opts = Object.defineProperty({}, "passive", {
        get() {
          passive = { passive: true };
        }
      });
      window.addEventListener("qtest", null, opts);
      window.removeEventListener("qtest", null, opts);
    } catch (e) {
      // do nothing
    }

    listenOpts.passive = passive;
    return passive;
  },
  set(val) {
    Object.defineProperty(this, "passive", {
      value: val
    });
  }
});

function position(e) {
  if (e.touches && e.touches[0]) {
    e = e.touches[0];
  } else if (e.changedTouches && e.changedTouches[0]) {
    e = e.changedTouches[0];
  }

  return {
    top: e.clientY,
    left: e.clientX
  };
}

const leftClick = e  => e.button === 0;

function processChanges(evt, ctx, isFinal) {
  const pos = position(evt);
  const distX = pos.left - ctx.event.x;
  const distY = pos.top - ctx.event.y;
  const direction = distX < 0 ? "rtl" : "ltr";

  return {
    evt,
    direction,
    isFirst: ctx.event.isFirst,
    isFinal,
    offset: {
      x: distX,
      y: distY
    },
  };
}

const shouldTrigger = changes => Math.abs(changes.offset.x) > 0;

export default {
  name: "touch-pan",

  bind(el, binding) {
    const mouse = binding.modifiers.noMouse !== true,
      stopPropagation = binding.modifiers.stop,
      preventDefault = binding.modifiers.prevent,
      evtOpts =
        preventDefault || binding.modifiers.mightPrevent
          ? null
          : listenOpts.passive;

    let ctx = {
      handler: binding.value,
      mouseStart(evt) {
        if (leftClick(evt)) {
          document.addEventListener("mousemove", ctx.move, evtOpts);
          document.addEventListener("mouseup", ctx.mouseEnd, evtOpts);
          ctx.start(evt);
        }
      },

      mouseEnd(evt) {
        document.removeEventListener("mousemove", ctx.move, evtOpts);
        document.removeEventListener("mouseup", ctx.mouseEnd, evtOpts);
        ctx.end(evt);
      },

      start(evt) {
        const pos = position(evt);

        ctx.event = {
          x: pos.left,
          y: pos.top,
          time: new Date().getTime(),
          detected: false,
          abort: false,
          isFirst: true,
        };
      },

      move(evt) {
        if (ctx.event.abort) {
          return;
        }

        if (ctx.event.detected) {
          stopPropagation && evt.stopPropagation();
          preventDefault && evt.preventDefault();

          const changes = processChanges(evt, ctx, false);
          if (shouldTrigger(changes)) {
            ctx.handler(changes);
            ctx.event.isFirst = false;
          }

          return;
        }

        const pos = position(evt),
          distX = Math.abs(pos.left - ctx.event.x),
          distY = Math.abs(pos.top - ctx.event.y);

        if (distX === distY) {
          return;
        }

        ctx.event.detected = true;
        ctx.event.abort = distX < distY;

        ctx.move(evt);
      },

      end(evt) {
        el.classList.remove("q-touch");
        if (ctx.event.abort || !ctx.event.detected || ctx.event.isFirst) {
          return;
        }

        stopPropagation && evt.stopPropagation();
        preventDefault && evt.preventDefault();
        ctx.handler(processChanges(evt, ctx, true));
      }
    };

    if (el.__qtouchpan) {
      el.__qtouchpan_old = el.__qtouchpan;
    }

    el.__qtouchpan = ctx;

    if (mouse) {
      el.addEventListener("mousedown", ctx.mouseStart, evtOpts);
    }
    el.addEventListener("touchstart", ctx.start, evtOpts);
    el.addEventListener("touchmove", ctx.move, evtOpts);
    el.addEventListener("touchend", ctx.end, evtOpts);
  },

  update(el, { oldValue, value }) {
    const ctx = el.__qtouchpan;

    if (oldValue !== value) {
      ctx.handler = value;
    }
  },

  unbind(el, binding) {
    let ctx = el.__qtouchpan_old || el.__qtouchpan;
    if (ctx !== void 0) {
      const evtOpts = binding.modifiers.prevent ? null : listenOpts.passive;

      el.removeEventListener("mousedown", ctx.mouseStart, evtOpts);

      el.removeEventListener("touchstart", ctx.start, evtOpts);
      el.removeEventListener("touchmove", ctx.move, evtOpts);
      el.removeEventListener("touchend", ctx.end, evtOpts);

      delete el[el.__qtouchpan_old ? "__qtouchpan_old" : "__qtouchpan"];
    }
  }
};
