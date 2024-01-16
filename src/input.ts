interface InputState {
  moveX: number;
  moveY: number;
  a: [boolean, boolean];
  b: [boolean, boolean];
}

const buttonClickStates: { [key: number]: number } = {};
const defaultInputState: InputState = {
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

function handleState(idx: number, pressed: boolean): [boolean, boolean] {
  if (pressed) {
    if (!buttonClickStates[idx]) {
      buttonClickStates[idx] = 1;
    } else {
      buttonClickStates[idx] += 1;
    }
    return [true, false];
  } else if (buttonClickStates[idx] && buttonClickStates[idx] < 200) {
    buttonClickStates[0] = 0;
    return [false, true];
  } else {
    return [false, false];
  }
}

function pressed(gp: Gamepad, idx: number): boolean {
  return gp.buttons[idx].value > 0 || gp.buttons[idx].pressed;
}

function reduce(a: InputState, b: InputState): InputState {
  if (!b) return a;
  if (!a) return b;
  return {
    moveX: a.moveX || b.moveX || 0,
    moveY: a.moveY || b.moveY || 0,
    a: (a.a[0] || a.a[1] ? a.a : b.a) || [false, false],
    b: (a.b[0] || a.b[1] ? a.b : b.b) || [false, false],
  };
}

export function updateInputState(): InputState {
  for (const gp of navigator.getGamepads()) {
    if (gp) {
      if (!gpInputStates[gp.index])
        gpInputStates[gp.index] = structuredClone(defaultInputState);
      gpInputStates[gp.index].a = handleState(0, pressed(gp, 0));
      gpInputStates[gp.index].b = handleState(1, pressed(gp, 1));
      gpInputStates[gp.index].moveY = gp.axes[1];
      gpInputStates[gp.index].moveX = gp.axes[0];
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
  }

  return reduce(
    keyboardInputState,
    Object.values(gpInputStates).reduce(reduce, null),
  );
}
