import "./style.css";
import { Application, Assets, Container, Sprite, Spritesheet, Texture } from "pixi.js";

import { initFmod, playEvent, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as cat from "./cat.ts";
import * as treat from "./treat.ts";
import { Cat, CatRoute, updateCat } from "./cat.ts";
import { Treat, updateTreat } from "./treat.ts";
import { center, pixelPerfectScale, range } from "./util.ts";
import { Level, level1 } from "./level.ts";
import { initTreatCount, updateTreatCount } from "./treatCount.ts";
import { initShip, updateShip } from "./ship.ts";
import { initHealthCount, updateHealthIcons } from "./healthCount.ts";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

const cats: { [key: number]: Cat } = {};
let catId = 0;
const treats: { [key: number]: Treat } = {};
let treatId = 0;
let previousTreat = 0;
let maxTreatCount = 3;
let treatCount = 3;
let invul = 0;

let tickerFn = (_: number) => {};
let healthPickupAnimation: Spritesheet | null = null;

async function init() {
  playEvent("event:/music");
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
  preInitLevel(level1);

  // preload assets
  await Promise.all([
    Assets.load("assets/Lvl1.png"),
    Assets.load("assets/Hand.png"),
    Assets.load("assets/Basic.png"),
    Assets.load("assets/Treat Projectile.png"),
    Assets.load("assets/Treat Magazine.png"),
    Assets.load("assets/HealthPickup.png"),
  ]).then((n) => console.log("Preloaded assets count =", n.length));

  const healthPickupSheet = await Assets.load<Texture>("assets/HealthPickup.png");
  healthPickupAnimation = new Spritesheet(healthPickupSheet, {
    frames: Object.fromEntries(
      [...range(3)].flatMap((y) =>
        [...range(4)].map((x) => [
          `h${y * 4 + x}.png`,
          {
            frame: { x: x * 8, y: y * 8, w: 8, h: 8 },
            spriteSourceSize: { x: 0, y: 0, w: 8, h: 8 },
            sourceSize: { w: 8, h: 8 },
          },
        ]),
      ),
    ),
    animations: {
      health: [...range(12).map((n) => `h${n}.png`)],
    },
    meta: {
      image: "assets/HealthPickup.png",
      format: "RGBA8888",
      size: { w: 32, h: 32 },
      scale: "1",
    },
  });
  await healthPickupAnimation.parse();
}

function preInitLevel(level: Level) {
  console.log(stage.removeChildren());
  tickerFn = () => {};

  document.getElementById("story-title")!.innerHTML = level.title;
  document.getElementById("story-content")!.innerHTML = level.story;
  document.getElementById("story")!.style.display = "";
  document.getElementById("start-level")!.addEventListener("click", () => {
    playEvent("event:/meow");
    document.getElementById("story")!.style.display = "none";
    initLevel(level).then(console.log);
  });
}

async function initLevel(level: Level) {
  const bgAsset = await Assets.load<Texture>("assets/Lvl1.png");
  const shipAsset = await Assets.load<Texture>("assets/Hand.png");
  const catAsset = await Assets.load<Texture>("assets/Basic.png");
  const treatAsset = await Assets.load<Texture>("assets/Treat Projectile.png");
  const treatIconAsset = await Assets.load<Texture>("assets/Treat Magazine.png");

  window.catFactory = (route: CatRoute, speed = 1) => (cats[catId++] = cat.init(catAsset, route, speed));

  let nextEvent = 0;

  const bg = new Sprite(bgAsset);
  bg.x = 0;
  bg.y = -bg.height + gameHeight;
  stage.addChild(bg);

  const ship = initShip(shipAsset);
  initTreatCount(treatIconAsset);
  console.log(healthPickupAnimation);
  initHealthCount(healthPickupAnimation!.animations.health);

  const startTime = Date.now();

  const restartLevel = () => {
    preInitLevel(level);
    return;
  };

  // Listen for frame updates
  tickerFn = (delta) => {
    updateFmod();
    window.tick = Date.now() - startTime;
    window.delta = delta;
    window.inp = updateInputState();

    if (inp.a[1]) {
      return restartLevel();
    }

    while (nextEvent < level.events.length && level.events[nextEvent][0] < tick) {
      level.events[nextEvent][1]();
      nextEvent++;
    }

    treatCount += delta / 20;
    if (treatCount > maxTreatCount) treatCount = maxTreatCount;

    updateTreatCount(treatCount);

    bg.y += delta * 2.0;
    if (bg.y > 0) bg.y = 0;

    updateShip(ship);

    for (let catsKey in cats) {
      if (updateCat(cats[catsKey])) {
        delete cats[catsKey];
      }
    }

    // fire treats
    if (inp.b[0] && previousTreat + 100 < Date.now() && treatCount > 0) {
      previousTreat = Date.now();
      const firePoint = center(ship.sprite);
      firePoint.y = firePoint.y - ship.sprite.height / 2 + ship.sprite.width / 3;
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

    const shipRect = ship.sprite.getBounds();
    if (invul > 0) {
      invul -= delta;
      if (invul < 0) invul = 0;
      ship.sprite.rotation = invul / 360;
    }
    if (invul <= 0) {
      for (let catsKey in cats) {
        if (cats[catsKey].sprite.getBounds().intersects(shipRect)) {
          invul = 30;
          ship.health -= 1;
          cats[catsKey].health -= 1;
          if (cats[catsKey].health <= 0) {
            stage.removeChild(cats[catsKey].sprite);
            delete cats[catsKey];
          }
          break;
        }
      }
    }
    updateHealthIcons(ship.health);
    if (ship.health <= 0) {
      return restartLevel();
    }
  };
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  playEvent("event:/meow");
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
