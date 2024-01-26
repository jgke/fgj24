import "./style.css";
import { Application, Assets } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";
import * as cat from "./cat.ts";
import { Cat, updateCat } from "./cat.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  window.inp = defaultInputState;
  window.app = new Application({ width: gameWidth, height: gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  const catAsset = await Assets.load("assets/cat.png");

  await ship.init();
  const cats: { [key: number]: Cat } = {};
  let catId = 0;

  // Listen for frame updates
  app.ticker.add((delta) => {
    window.delta = delta;
    updateFmod();
    inp = updateInputState();
    ship.updateShip();

    if (inp.a[1]) {
      cats[catId++] = cat.init(catAsset);
    }
    for (let catsKey in cats) {
      if (updateCat(cats[catsKey])) {
        delete cats[catsKey];
      }
    }
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
