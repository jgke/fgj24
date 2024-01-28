import { AnimatedSprite, Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { BigCat } from "./bigcat.ts";
import { firepoint } from "./util.ts";

export type CatKey = "Basic" | "Buff" | "Zoomie" | "Chungus" | "Murder" | "CeilingCat";

export interface Cat {
  health: number;
  sprite: AnimatedSprite;
  routeDelta: number;
  speed: number;
  ty: CatKey;
  getPosition(delta: number, cat: Cat): Point;
}
export type CatRoute<T extends { sprite: Sprite }> = (delta: number, cat: T) => Point;

export function combine<T extends { sprite: Sprite }>(...routes: [number, CatRoute<T>][]): CatRoute<T> {
  const total = routes.map(([n, _]) => n).reduce((a, b) => a + b);
  return (delta, cat) => {
    const cur = total * delta;
    let start = 0;
    for (let i = 0; i < routes.length; i++) {
      const end = start + routes[i][0];
      if (start <= cur && cur <= end) {
        const innerDelta = (cur - start) / (end - start);
        return routes[i][1](innerDelta, cat);
      }
      start = end;
    }
    return routes[routes.length - 1][1](1, cat);
  };
}

export function interpolate<T extends { sprite: Sprite }>(from: Point, to: Point): CatRoute<T> {
  return (delta) => new Point(from.x + delta * (to.x - from.x), from.y + delta * (to.y - from.y));
}

export function interpolateToShip<T extends { sprite: Sprite }>(from: Point): CatRoute<T> {
  return (delta, cat) => bezier(from, cat.sprite.position, firepoint(ship.sprite))(delta, cat);
}

export function wobblyLine<T extends { sprite: Sprite }>(from: Point, to: Point): CatRoute<T> {
  return (delta, cat) => {
    const p = interpolate(from, to)(delta, cat);
    p.y += Math.sin(delta * 10) * 10;
    return p;
  };
}

export function bezier<T extends { sprite: Sprite }>(...points: Point[]): CatRoute<T> {
  return (delta, cat) => {
    if (points.length <= 1) return points[0];
    if (points.length == 2) return interpolate(points[0], points[1])(delta, cat);
    const pn = [];
    for (let i = 0; i < points.length - 1; i++) {
      pn.push(interpolate(points[i], points[i + 1])(delta, cat));
    }
    return bezier(...pn)(delta, cat);
  };
}

export const setPos = (pos: Point) => interpolate(pos, pos);
export function showDangerElem(danger: string) {
  document.getElementById("onscreen-" + danger)!.style.opacity = "0.75";
}
export function hideDangerElem(danger: string) {
  document.getElementById("onscreen-" + danger)!.style.opacity = "0";
}
export function showDanger<T extends { sprite: Sprite }>(danger: string): CatRoute<T> {
  return (_delta, cat) => {
    showDangerElem(danger);
    return cat.sprite.position;
  };
}
export function hideDanger<T extends { sprite: Sprite }>(danger: string): CatRoute<T> {
  return (_delta, cat) => {
    hideDangerElem(danger);
    return cat.sprite.position;
  };
}
export const stay = (_delta: number, cat: { sprite: Sprite }) => cat.sprite.position;

export function appear<T extends { sprite: Sprite }>(delta: number, cat: T): Point {
  cat.sprite.alpha = Math.max(0, delta * 1.5);
  return cat.sprite.position;
}

export function fade(delta: number, cat: BigCat): Point {
  cat.sprite.alpha = Math.max(0, 1 - delta * 1.5);
  return cat.sprite.position;
}

export function init(texture: Texture[], route: CatRoute<Cat>, speed: number, ty: CatKey): Cat {
  const cat = new AnimatedSprite(texture);
  cat.animationSpeed = 0.1;
  cat.gotoAndPlay(Math.floor(Math.random() * texture.length));
  if (ty === "CeilingCat") {
    cat.gotoAndStop(0);
    cat.alpha = 0;
    cat.scale.x = 2;
    cat.scale.y = 2;
    cat.loop = false;
  }
  cat.x = -100;
  cat.y = -100;

  cat.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  cat.eventMode = "static";

  // Rotate around the center
  cat.anchor.x = 0.5;
  cat.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  stage.addChild(cat);

  let health = 2;
  if (ty == "Basic") health = 2;
  if (ty == "Buff") health = 4;
  if (ty == "CeilingCat") health = 10;
  if (ty == "Chungus") health = 20;
  if (ty == "Murder") health = 1;
  if (ty == "Zoomie") health = 2;

  return { health, sprite: cat, routeDelta: 0, speed, getPosition: route, ty };
}

export function updateCat(cat: Cat): boolean {
  cat.routeDelta += (delta / 100) * cat.speed;
  if (cat.routeDelta > 1) {
    stage.removeChild(cat.sprite);
    return true;
  }

  const pos = cat.getPosition(cat.routeDelta, cat);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
