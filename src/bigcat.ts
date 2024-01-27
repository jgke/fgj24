import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { CatRoute, interpolate } from "./cat.ts";
import { gameHeight, gameWidth } from "./const.ts";

export interface BigCat {
  health: number;
  sprite: Sprite;
  routeDelta: number;
  attackIndex: [number, number] | null;
  speed: number;
  getPosition(delta: number, cat: BigCat): Point;
}

const initialRoute: CatRoute<BigCat> = interpolate(
  new Point(gameWidth / 2, -500),
  new Point(gameWidth / 2, gameHeight / 4),
);

export function initBigcat(texture: Texture): BigCat {
  const bigcat = new Sprite(texture);
  bigcat.x = app.renderer.width / 2;
  bigcat.y = app.renderer.height / 2;
  bigcat.scale.x = 10;
  bigcat.scale.y = 10;

  bigcat.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  bigcat.eventMode = "static";

  // Rotate around the center
  bigcat.anchor.x = 0.5;
  bigcat.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  stage.addChild(bigcat);

  return { health: 10, sprite: bigcat, routeDelta: 0, attackIndex: null, speed: 1, getPosition: initialRoute };
}

function fade(delta: number, cat: BigCat): Point {
  cat.sprite.alpha = Math.max(0, 1 - delta * 1.5);
  return cat.sprite.position;
}

const setPos = (pos: Point) => interpolate(pos, pos);
function showDanger(danger: string): CatRoute<BigCat> {
  return (_delta, cat) => {
    document.getElementById("onscreen-" + danger)!.style.opacity = "0.75";
    return cat.sprite.position;
  };
}
function hideDanger(danger: string): CatRoute<BigCat> {
  return (_delta, cat) => {
    document.getElementById("onscreen-" + danger)!.style.opacity = "0";
    return cat.sprite.position;
  };
}
const stay: CatRoute<BigCat> = (_delta, cat) => cat.sprite.position;

function appear(delta: number, cat: BigCat): Point {
  cat.sprite.alpha = Math.max(0, delta * 1.5);
  return cat.sprite.position;
}

const attacks: [number, [number, CatRoute<BigCat>][]][] = [
  [
    1,
    [
      [1, stay],
      [1, fade],
      [1, setPos(new Point(-500, gameHeight / 2))],
      [0, showDanger("tl")],
      [1, showDanger("l")],
      [1, appear],
      [1, interpolate(new Point(-500, gameHeight / 2), new Point(gameWidth + 500, gameHeight / 2))],
      [0, hideDanger("tl")],
      [1, hideDanger("l")],
    ],
  ],
];

export function updateBigCat(cat: BigCat): boolean {
  cat.routeDelta += (delta / 100) * cat.speed;

  const curAttack = cat.attackIndex ? attacks[cat.attackIndex[0]] : null;
  const curSubAttack = cat.attackIndex ? curAttack![1][cat.attackIndex[1]] : null;

  if (cat.routeDelta > (curSubAttack?.[0] ?? 1)) {
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
      const attackId = 0;
      const [_, getPosition] = attacks[attackId];
      cat.getPosition = getPosition[0][1];
      //cat.speed = 1 / attackSpeed;
      cat.speed = 1;
      cat.routeDelta = 0;
      cat.attackIndex = [attackId, 0];
    }
  }

  const pos = cat.getPosition(cat.routeDelta, cat);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
