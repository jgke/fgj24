import "./style.css";
import { Application, Assets } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";
import * as cats from "./cat.ts";
import { updateCat } from "./cat.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  window.inp = defaultInputState;
  window.app = new Application({ width: gameWidth, height: gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  const catAsset = await Assets.load("assets/cat.png");

  await ship.init();
  let cat: cats.Cat | null = null;

  // Listen for frame updates
  app.ticker.add((delta) => {
    window.delta = delta;
    updateFmod();
    inp = updateInputState();
    ship.updateShip();

    if (!cat && inp.a[1]) {
      cat = cats.init(catAsset);
    }
    if (cat) {
      if (updateCat(cat)) {
        console.log("rip cat");
        cat = null;
      }
    }
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
