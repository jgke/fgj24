import "./style.css";
import { Application } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  app = new Application({ width: gameWidth, height: gameHeight });
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  await ship.init();

  // Listen for frame updates
  app.ticker.add((delta) => {
    updateFmod();
    const inp = updateInputState();
    ship.updateShip(delta, inp);
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
