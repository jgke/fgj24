import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { appear, CatRoute, fade, hideDanger, interpolate, setPos, showDanger, stay } from "./cat.ts";
import { gameHeight, gameWidth } from "./const.ts";
import { timesInterval } from "./level.ts";

export interface BigCat {
  health: number;
  sprite: Sprite;
  routeDelta: number;
  attackIndex: [number, number] | null;
  speed: number;
  hard: boolean;
  getPosition(delta: number, cat: BigCat): Point;
}

const initialRoute: CatRoute<BigCat> = interpolate(
  new Point(gameWidth / 2, -500),
  new Point(gameWidth / 2, gameHeight / 4),
);

export function initBigcat(texture: Texture, hard: boolean): BigCat {
  const bigcat = new Sprite(texture);
  bigcat.x = app.renderer.width / 2;
  bigcat.y = app.renderer.height / 2;

  bigcat.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  bigcat.eventMode = "static";

  // Rotate around the center
  bigcat.anchor.x = 0.5;
  bigcat.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  stage.addChild(bigcat);

  const health = 80;
  (document.getElementById("boss-hp-value") as HTMLProgressElement).max = health;
  (document.getElementById("boss-hp-value") as HTMLProgressElement).value = health;
  return {
    health: health,
    sprite: bigcat,
    routeDelta: 0,
    attackIndex: null,
    speed: 1,
    getPosition: initialRoute,
    hard,
  };
}

const swipe = (from: Point, to: Point, ...danger: string[]): [number, CatRoute<BigCat>][] => [
  [1, stay],
  [1, fade],
  [1, setPos(from)],
  ...danger.map((d) => [0, showDanger(d)] as [number, CatRoute<BigCat>]),
  [1, appear],
  [1, interpolate(from, to)],
  ...danger.map((d) => [0, hideDanger(d)] as [number, CatRoute<BigCat>]),
];
const multiSwipe = (...danger: [Point, Point, string][]): [number, CatRoute<BigCat>][] => [
  [1, stay],
  [1, fade],
  [1, setPos(new Point(-500, -500))],
  ...danger.map(([_1, _2, d]) => [0, showDanger(d)] as [number, CatRoute<BigCat>]),
  [1, appear],
  ...danger.map(([from, to, _]) => [0.35, interpolate(from, to)] as [number, CatRoute<BigCat>]),
  ...danger.map(([_1, _2, d]) => [0, hideDanger(d)] as [number, CatRoute<BigCat>]),
];

function beam(center: number): CatRoute<BigCat> {
  return (_delta, cat) => {
    const x = center + (Math.random() - 0.5) * 100;
    catFactory("Zoomie", interpolate(new Point(x, 0), new Point(x, gameHeight)), 5);
    return cat.sprite.position;
  };
}

const attacks: [number, [number, CatRoute<BigCat>][]][] = [
  [
    1,
    multiSwipe(
      [new Point(-5000, gameHeight / 4), new Point(gameWidth + 5000, gameHeight / 4), "l"],
      [new Point(5000, gameHeight / 4), new Point(gameWidth - 5000, gameHeight / 4), "r"],
      [new Point(50, gameHeight + 5000), new Point(50, -5000), "bl"],
    ),
  ],
  [
    1,
    multiSwipe(
      [new Point(-5000, gameHeight / 4), new Point(gameWidth + 5000, gameHeight / 4), "l"],
      [new Point(5000, gameHeight / 4), new Point(gameWidth - 5000, gameHeight / 4), "r"],
      [new Point(gameWidth - 50, gameHeight + 5000), new Point(gameWidth - 50, -5000), "br"],
    ),
  ],
  [1, swipe(new Point(-5000, gameHeight / 4), new Point(gameWidth + 5000, gameHeight / 4), "l")],
  [1, swipe(new Point(5000, gameHeight / 4), new Point(gameWidth - 5000, gameHeight / 4), "r")],
  [1, swipe(new Point(50, gameHeight + 5000), new Point(50, -5000), "bl")],
  [1, swipe(new Point(gameWidth - 50, gameHeight + 5000), new Point(gameWidth - 50, -5000), "br")],
];

const hardAttacks: [number, [number, CatRoute<BigCat>][]][] = [
  [
    1,
    [
      [1, stay],
      [1, fade],
      [1, setPos(new Point(-1000, -1000))],
      [0, showDanger("b")],
      [1, appear],
      [1, beam(gameWidth / 2)],
      [0, hideDanger("b")],
    ],
  ],
  [
    1,
    multiSwipe(
      [new Point(-5000, gameHeight / 4), new Point(gameWidth + 5000, gameHeight / 4), "l"],
      [new Point(5000, gameHeight / 4), new Point(gameWidth - 5000, gameHeight / 4), "r"],
      [new Point(50, gameHeight + 5000), new Point(50, -5000), "bl"],
    ),
  ],
  [
    1,
    multiSwipe(
      [new Point(-5000, gameHeight / 4), new Point(gameWidth + 5000, gameHeight / 4), "l"],
      [new Point(5000, gameHeight / 4), new Point(gameWidth - 5000, gameHeight / 4), "r"],
      [new Point(gameWidth - 50, gameHeight + 5000), new Point(gameWidth - 50, -5000), "br"],
    ),
  ],
];

export function updateBigCat(cat: BigCat): boolean {
  const list = cat.hard ? hardAttacks : attacks;
  cat.routeDelta += (delta / 100) * cat.speed;
  (document.getElementById("boss-hp-value") as HTMLProgressElement).value = cat.health;

  const curAttack = cat.attackIndex ? list[cat.attackIndex[0]] : null;
  const curSubAttack = cat.attackIndex ? curAttack![1][cat.attackIndex[1]] : null;

  if (cat.routeDelta > (curSubAttack?.[0] ?? 1)) {
    console.log(cat.routeDelta, curSubAttack?.[0]);
    if (cat.attackIndex && curAttack![1].length - 1 == cat.attackIndex[1]) {
      // stop attack, back to initial
      cat.speed = 1;
      cat.routeDelta = 0;
      cat.getPosition = initialRoute;
      cat.attackIndex = null;
    } else if (cat.attackIndex) {
      // next sub attack
      cat.attackIndex[1] += 1;
      cat.routeDelta = 0;
      cat.getPosition = curAttack![1][cat.attackIndex[1]][1];
    } else {
      // new attack
      const attackId = Math.floor(Math.random() * list.length);
      const [_, getPosition] = list[attackId];
      cat.getPosition = getPosition[0][1];
      //cat.speed = 1 / attackSpeed;
      cat.speed = 1;
      cat.routeDelta = 0;
      cat.attackIndex = [attackId, 0];
    }
  }

  const pos = cat.getPosition(cat.routeDelta / (curSubAttack?.[0] ?? 1), cat);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
