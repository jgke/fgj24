import "./style.css";
import {Application, Assets, Sprite} from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";
import * as cat from "./cat.ts";
import * as treat from "./treat.ts";
import { Cat, updateCat } from "./cat.ts";
import { Treat, updateTreat } from "./treat.ts";
import { center } from "./util.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  window.inp = defaultInputState;
  window.app = new Application({ width: gameWidth, height: gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  const bgAsset = await Assets.load("assets/bg1.png");
  const catAsset = await Assets.load("assets/cat.png");
  const treatAsset = await Assets.load("assets/cat.png");

  const bg = new Sprite(bgAsset);
  bg.x = 0;
  bg.y = -bg.height + gameHeight;
  app.stage.addChild(bg);

  await ship.init();
  const cats: { [key: number]: Cat } = {};
  let catId = 0;
  const treats: { [key: number]: Treat } = {};
  let treatId = 0;
  let previousTreat = 0;

  // Listen for frame updates
  app.ticker.add((delta) => {
    bg.y += delta * 0.9;
    if(bg.y > 0) bg.y = 0;
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

    if (inp.b[0] && previousTreat + 100 < Date.now()) {
      previousTreat = Date.now();
      treats[treatId++] = treat.init(treatAsset, center(ship.ship));
    }
    for (let treatsKey in treats) {
      if (updateTreat(treats[treatsKey])) {
        delete treats[treatsKey];
      }
    }

    // advanced collision checking logic, highly optimized
    for (let treatsKey in treats) {
      const treatRect = treats[treatsKey].sprite.getBounds();
      for (let catsKey in cats) {
        if (cats[catsKey].sprite.getBounds().intersects(treatRect)) {
          app.stage.removeChild(cats[catsKey].sprite);
          app.stage.removeChild(treats[treatsKey].sprite);
          delete cats[catsKey];
          delete treats[treatsKey];
          break;
        }
      }
    }
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
