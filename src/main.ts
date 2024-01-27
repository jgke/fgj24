import "./style.css";
import { Application, Assets, Sprite } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";
import * as cat from "./cat.ts";
import * as treat from "./treat.ts";
import { Cat, CatRoute, updateCat } from "./cat.ts";
import { Treat, updateTreat } from "./treat.ts";
import { center } from "./util.ts";
import { level1 } from "./level.ts";
import { initTreatCount, updateTreatCount } from "./treatCount.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

const cats: { [key: number]: Cat } = {};
let catId = 0;
const treats: { [key: number]: Treat } = {};
let treatId = 0;
let previousTreat = 0;
let maxTreatCount = 3;
let treatCount = 3;

async function init() {
  window.inp = defaultInputState;
  window.app = new Application({ width: gameWidth, height: gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  window.catFactory = (route: CatRoute, speed = 1) => (cats[catId++] = cat.init(catAsset, route, speed));

  const bgAsset = await Assets.load("assets/bg1.png");
  const shipAsset = await Assets.load("assets/cat.png");
  const catAsset = await Assets.load("assets/Basic.png");
  const treatAsset = await Assets.load("assets/Treat Projectile.png");
  const treatIconAsset = await Assets.load("assets/Treat Magazine.png");

  const level = level1;
  let nextEvent = 0;

  const bg = new Sprite(bgAsset);
  bg.x = 0;
  bg.y = -bg.height + gameHeight;
  app.stage.addChild(bg);

  ship.init(shipAsset);
  initTreatCount(treatIconAsset);

  const startTime = Date.now();

  // Listen for frame updates
  app.ticker.add((delta) => {
    updateFmod();
    window.tick = Date.now() - startTime;
    window.delta = delta;
    window.inp = updateInputState();

    while (nextEvent < level.length && level[nextEvent][0] < tick) {
      level[nextEvent][1]();
      nextEvent++;
    }

    treatCount += delta / 20;
    if (treatCount > maxTreatCount) treatCount = maxTreatCount;

    updateTreatCount(treatCount);

    bg.y += delta * 0.9;
    if (bg.y > 0) bg.y = 0;

    ship.updateShip();

    for (let catsKey in cats) {
      if (updateCat(cats[catsKey])) {
        delete cats[catsKey];
      }
    }

    if (inp.b[0] && previousTreat + 100 < Date.now() && treatCount > 0) {
      previousTreat = Date.now();
      treats[treatId++] = treat.init(treatAsset, center(ship.ship));
      treatCount -= 1;
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
