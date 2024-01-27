import "./style.css";
import { Application, Assets, Container, Sprite } from "pixi.js";

import { initFmod, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as ship from "./ship.ts";
import * as cat from "./cat.ts";
import * as treat from "./treat.ts";
import { Cat, CatRoute, updateCat } from "./cat.ts";
import { Treat, updateTreat } from "./treat.ts";
import { center, pixelPerfectScale } from "./util.ts";
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

let tickerFn = (_: number) => {};
async function init() {
  const scale = pixelPerfectScale(gameWidth, gameHeight, window.innerWidth, window.innerHeight);

  window.inp = defaultInputState;
  window.app = new Application({ width: scale * gameWidth, height: scale * gameHeight });
  window.delta = 0;
  await fmodPromise;
  document.getElementById("app")!.appendChild(app.view as any);

  window.stage = new Container();
  stage.width = gameWidth;
  stage.height = gameHeight;
  stage.scale.x = scale;
  stage.scale.y = scale;
  app.stage.addChild(stage);

  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (!iOS) {
    window.addEventListener("resize", () => {
      const scale = pixelPerfectScale(gameWidth, gameHeight, window.innerWidth, window.innerHeight);
      stage.scale.x = scale;
      stage.scale.y = scale;
      app.renderer.resize(gameWidth * scale, gameHeight * scale);
      //app.stage.width = gameWidth;
      //app.stage.height = gameHeight;
      //app.view.width = gameWidth * scale;
      //app.view.height = gameHeight * scale;
      //app.resize();
    });
  }
  app.ticker.add((delta) => tickerFn(delta));
  await initLevel();
}
async function initLevel() {
  stage.removeChildren();
  const bgAsset = await Assets.load("assets/bg1.png");
  const shipAsset = await Assets.load("assets/Hand.png");
  const catAsset = await Assets.load("assets/Basic.png");
  const treatAsset = await Assets.load("assets/Treat Projectile.png");
  const treatIconAsset = await Assets.load("assets/Treat Magazine.png");

  window.catFactory = (route: CatRoute, speed = 1) => (cats[catId++] = cat.init(catAsset, route, speed));

  const level = level1;
  let nextEvent = 0;

  const bg = new Sprite(bgAsset);
  bg.x = 0;
  bg.y = -bg.height + gameHeight;
  stage.addChild(bg);

  ship.init(shipAsset);
  initTreatCount(treatIconAsset);

  const startTime = Date.now();

  // Listen for frame updates
  tickerFn = (delta) => {
    updateFmod();
    window.tick = Date.now() - startTime;
    window.delta = delta;
    window.inp = updateInputState();

    if (inp.a[1]) {
      initLevel();
      return;
    }

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

    // fire treats
    if (inp.b[0] && previousTreat + 100 < Date.now() && treatCount > 0) {
      previousTreat = Date.now();
      const firePoint = center(ship.ship);
      firePoint.y = firePoint.y - ship.ship.height / 2 + ship.ship.width / 3;
      treats[treatId++] = treat.init(treatAsset, firePoint);
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
          cats[catsKey].health -= 1;
          if (cats[catsKey].health <= 0) {
            stage.removeChild(cats[catsKey].sprite);
            delete cats[catsKey];
          }
          stage.removeChild(treats[treatsKey].sprite);
          delete treats[treatsKey];
          break;
        }
      }
    }
  };
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
