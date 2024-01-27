import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { CatRoute, combine, interpolate, wobblyLine } from "./cat.ts";
import { gameHeight, gameWidth } from "./const.ts";

export interface BigCat {
  health: number;
  sprite: Sprite;
  routeDelta: number;
  didAttack: boolean;
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

  return { health: 200, sprite: bigcat, routeDelta: 0, didAttack: false, speed: 1, getPosition: initialRoute };
}

function fade(delta: number, cat: BigCat): Point {
  cat.sprite.alpha = Math.max(0, 1 - delta * 1.5);
  return cat.sprite.position;
}

const setPos = (pos: Point) => interpolate(pos, pos);
const stay: CatRoute<BigCat> = (_delta, cat) => cat.sprite.position;

function appear(delta: number, cat: BigCat): Point {
  cat.sprite.alpha = Math.max(0, delta * 1.5);
  return cat.sprite.position;
}

const attacks: [number, CatRoute<BigCat>][] = [
  [
    3,
    combine(
      [1, stay],
      [1, fade],
      [1, setPos(new Point(-500, gameHeight / 2))],
      [1, appear],
      [1, interpolate(new Point(-500, gameHeight / 2), new Point(gameWidth + 500, gameHeight / 2))],
    ),
  ],
];

export function updateBigCat(cat: BigCat): boolean {
  cat.routeDelta += (delta / 100) * cat.speed;
  if (cat.routeDelta > 1) {
    if (cat.didAttack) {
      cat.speed = 1;
      cat.routeDelta = 0;
      cat.getPosition = initialRoute;
      cat.didAttack = false;
    } else {
      const attackId = 0;
      const [attackSpeed, getPosition] = attacks[attackId];
      cat.getPosition = getPosition;
      cat.speed = 1 / attackSpeed;
      cat.routeDelta = 0;
      cat.didAttack = true;
    }
  }

  const pos = cat.getPosition(cat.routeDelta, cat);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
