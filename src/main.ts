import "./style.css";
import { Application, Assets, Container, Sprite, Spritesheet, Texture } from "pixi.js";

import { initFmod, playEvent, updateFmod } from "./fmod";
import { defaultInputState, updateInputState } from "./input";
import { gameHeight, gameWidth } from "./const.ts";
import * as cat from "./cat.ts";
import * as treat from "./treat.ts";
import { Cat, CatAssets, CatRoute, updateCat } from "./cat.ts";
import { Treat, updateTreat } from "./treat.ts";
import { center, pixelPerfectScale, range } from "./util.ts";
import { endingStory, Level, level1, level2, level3 } from "./level.ts";
import { initTreatCount, updateTreatCount } from "./treatCount.ts";
import { initShip, updateShip } from "./ship.ts";
import { initHealthCount, updateHealthIcons } from "./healthCount.ts";
import { BigCat, initBigcat, updateBigCat } from "./bigcat.ts";

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

let feedTimer = 0;
let feedSpeedCount = 0;
let feedUnhitCount = 0;
const speedStreakTreshold = 5000; // ms

let currentLevel = 1;

const speedStreaks: [number, string][] = [
  [2, "Double Kill"],
  [3, "Multi Kill"],
  [4, "Mega Kill"],
  [5, "Ultra Kill"],
  [6, "MONSTER KILL"],
  [7, "LUDICROUS KILL"],
  [8, "HOLY *MEOW*"],
];

const unhitStreaks: [number, string][] = [
  [5, "event:/nohit_feed_1"],
  [10, "event:/nohit_feed_2"],
  [15, "event:/nohit_feed_3"],
  [20, "event:/nohit_feed_4"],
  [25, "event:/nohit_feed_5"],
  [30, "event:/nohit_feed_6"],
];

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
    Assets.load("assets/Lvl3.png"),
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
  console.log("Preinit", level.title);
  tickerFn = () => {};

  document.getElementById("story-title")!.innerHTML = level.title;
  document.getElementById("story-content")!.innerHTML = level.story;
  setTimeout(() => {
    document.getElementById("story-content")!.scrollTop = 0;
  }, 0);
  document.getElementById("story")!.style.display = "";

  function handler() {
    document.getElementById("start-level")!.removeEventListener("click", handler);
    console.log("start-level clicked");
    playEvent("event:/meow");
    document.getElementById("story")!.style.display = "none";
    initLevel(level).then(console.log);
  }
  document.getElementById("start-level")!.addEventListener("click", handler);
}

setInterval(() => {
  updateFmod();
});

async function initLevel(level: Level) {
  console.log("Init", level.title);
  const bgAsset = await Assets.load<Texture>(`assets/${level.bg}`);
  const shipAsset = await Assets.load<Texture>("assets/Hand.png");
  const treatAsset = await Assets.load<Texture>("assets/Treat Projectile.png");
  const treatIconAsset = await Assets.load<Texture>("assets/Treat Magazine.png");
  const bigcatAsset = await Assets.load<Texture>("assets/cat.png");

  const catAssets: CatAssets = {
    Buff: await Assets.load<Texture>("assets/Buff.png"),
    Basic: await Assets.load<Texture>("assets/Basic.png"),
    Zoomie: await Assets.load<Texture>("assets/Zoomie.png"),
    Chungus: await Assets.load<Texture>("assets/Chungus.png"),
  };

  window.catFactory = (ty: keyof CatAssets, route: CatRoute<Cat>, speed = 1) =>
    (cats[catId++] = cat.init(catAssets[ty], route, speed));
  let bigCat: BigCat | null = null;
  window.bigCat = () => (bigCat = initBigcat(bigcatAsset));

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
    if (bigCat) updateBigCat(bigCat);

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
      if (bigCat) {
        if (bigCat.sprite.getBounds().intersects(treatRect)) {
          bigCat.health -= 1;
          if (bigCat.health <= 0) {
            playEvent("event:/meow");
            stage.removeChild(bigCat.sprite);
            bigCat = null;
            if (currentLevel === 1) {
              currentLevel = 2;
              preInitLevel(level2);
            } else if (currentLevel === 2) {
              currentLevel = 3;
              preInitLevel(level3);
            } else if (currentLevel === 3) {
              {
                // ending?
                console.warn(endingStory);
              }
            }
          }
          stage.removeChild(treats[treatsKey].sprite);
          delete treats[treatsKey];
          continue;
        }
      }
      for (let catsKey in cats) {
        if (cats[catsKey].sprite.getBounds().intersects(treatRect)) {
          cats[catsKey].health -= 1;
          if (cats[catsKey].health <= 0) {
            stage.removeChild(cats[catsKey].sprite);
            delete cats[catsKey];

            const dt = Date.now() - feedTimer;
            if (dt < speedStreakTreshold) {
              feedSpeedCount += 1;
            } else {
              feedSpeedCount = 1;
            }
            feedUnhitCount += 1;
            feedTimer = Date.now();

            for (let i = 0; i < speedStreaks.length; i++) {
              if (speedStreaks[i][0] == feedSpeedCount) {
                console.warn(speedStreaks[i][1]);
              }
            }

            for (let i = 0; i < unhitStreaks.length; i++) {
              if (unhitStreaks[i][0] == feedUnhitCount) {
                playEvent(unhitStreaks[i][1]);
              }
            }
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
          feedUnhitCount = 0;
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
  console.log("start-playing clicked");
  playEvent("event:/meow");
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
