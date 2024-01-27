import nipplejs, { JoystickEventTypes } from "../vendor/nipplejs";

export interface InputState {
  moveX: number;
  moveY: number;
  a: [boolean, boolean];
  b: [boolean, boolean];
}

type ButtonClickStates = { [key: number]: number | null };
export const defaultInputState: InputState = {
  moveX: 0,
  moveY: 0,
  a: [false, false],
  b: [false, false],
};

const gpInputStates: { [key: number]: InputState } = {};
window.addEventListener("gamepaddisconnected", (e) => {
  delete gpInputStates[e.gamepad.index];
});

const keyboardInputState = structuredClone(defaultInputState);

const isKeyDown = (() => {
  const state: any = {};

  window.addEventListener("keyup", (e) => (state[e.key] = false));
  window.addEventListener("keydown", (e) => (state[e.key] = true));

  return (key: any) => (state.hasOwnProperty(key) && state[key]) || false;
})();

function handleState(state: ButtonClickStates, idx: number, pressed: boolean): [boolean, boolean] {
  if (pressed) {
    if (!state[idx]) {
      state[idx] = Date.now();
    }
    return [true, false];
  } else if (state[idx] && Date.now() - state[idx]! < 200) {
    state[idx] = null;
    return [false, true];
  } else if (state[idx]) {
    state[idx] = null;
    return [false, false];
  } else {
    return [false, false];
  }
}

function pressed(gp: Gamepad, idx: number): boolean {
  return gp?.buttons?.[idx]?.value > 0 || gp?.buttons?.[idx]?.pressed;
}

function reduce(a: InputState | null, b: InputState | null): InputState {
  if (a && b)
    return {
      moveX: a.moveX || b.moveX || 0,
      moveY: a.moveY || b.moveY || 0,
      a: (a.a[0] || a.a[1] ? a.a : b.a) || [false, false],
      b: (a.b[0] || a.b[1] ? a.b : b.b) || [false, false],
    };
  if (a) return a;
  if (b) return b;
  return structuredClone(defaultInputState);
}

function absMax(a: number, b: number): number {
  if (!a && !b) return 0;
  if (!a) return b;
  if (!b) return a;
  return Math.abs(a) > Math.abs(b) ? a : b;
}

let gpButtonStates: { [index: number]: ButtonClickStates } = {};
let keyboardButtonStates: ButtonClickStates = {};

let feed = document.getElementById("feed")!;
let feedDown = false;
let nipplePosition = { x: 0, y: 0 };
if ("ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0) {
  feed.style.display = "";

  let manager = nipplejs.create({
    mode: "static",
    position: { bottom: "200px", left: "100px" },
  })[0];
  manager.on(
    "move end" as JoystickEventTypes,
    (_: any, data: any) => (nipplePosition = data?.vector ? { x: data.vector.x, y: -data.vector.y } : { x: 0, y: 0 }),
  );
}

feed.addEventListener("pointerdown", () => {
  feedDown = true;
});
feed.addEventListener("pointerup", () => {
  feedDown = false;
});

export function updateInputState(): InputState {
  for (const gp of navigator.getGamepads()) {
    if (gp) {
      if (!gpInputStates[gp.index]) {
        gpInputStates[gp.index] = structuredClone(defaultInputState);
        gpButtonStates[gp.index] = {};
      }
      gpInputStates[gp.index].a = handleState(gpButtonStates[gp.index], 0, pressed(gp, 0));
      gpInputStates[gp.index].b = handleState(gpButtonStates[gp.index], 1, pressed(gp, 1));
      gpInputStates[gp.index].moveY = absMax(gp.axes[1], gp.axes[7]);
      gpInputStates[gp.index].moveX = absMax(gp.axes[0], gp.axes[6]);
      if (pressed(gp, 12)) {
        gpInputStates[gp.index].moveY = -1;
      }
      if (pressed(gp, 13)) {
        gpInputStates[gp.index].moveY = 1;
      }
      if (pressed(gp, 14)) {
        gpInputStates[gp.index].moveX = -1;
      }
      if (pressed(gp, 15)) {
        gpInputStates[gp.index].moveX = 1;
      }
    }
  }

  {
    keyboardInputState.a = handleState(keyboardButtonStates, 0, isKeyDown("a") || isKeyDown("A"));
    keyboardInputState.b = handleState(keyboardButtonStates, 1, isKeyDown(" ") || feedDown);
    if (isKeyDown("ArrowUp")) {
      keyboardInputState.moveY = -1;
    }
    if (isKeyDown("ArrowDown")) {
      keyboardInputState.moveY = 1;
    }
    if (!isKeyDown("ArrowUp") && !isKeyDown("ArrowDown")) {
      keyboardInputState.moveY = 0;
    }
    if (isKeyDown("ArrowLeft")) {
      keyboardInputState.moveX = -1;
    }
    if (isKeyDown("ArrowRight")) {
      keyboardInputState.moveX = 1;
    }
    if (!isKeyDown("ArrowLeft") && !isKeyDown("ArrowRight")) {
      keyboardInputState.moveX = 0;
    }
    keyboardInputState.moveX = absMax(keyboardInputState.moveX, nipplePosition.x);
    keyboardInputState.moveY = absMax(keyboardInputState.moveY, nipplePosition.y);
  }

  return reduce(keyboardInputState, Object.values(gpInputStates).reduce(reduce, null));
}
