import "./style.css";
import { Application } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  window.inp = defaultInputState;
  window.app = new Application({ width: gameWidth, height: gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  await ship.init();

  // Listen for frame updates
  app.ticker.add((delta) => {
    window.delta = delta;
    updateFmod();
    inp = updateInputState();
    ship.updateShip();
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
