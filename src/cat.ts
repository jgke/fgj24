import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";

export interface CatAssets {
  Basic: Texture;
  Buff: Texture;
  Zoomie: Texture;
  Chungus: Texture;
}

export interface Cat {
  health: number;
  sprite: Sprite;
  routeDelta: number;
  speed: number;
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
  console.log("Showing", danger);
  document.getElementById("onscreen-" + danger)!.style.opacity = "0.75";
}
export function hideDangerElem(danger: string) {
  console.log("Hiding", danger);
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

export function init(texture: Texture, route: CatRoute<Cat>, speed: number = 1): Cat {
  const cat = new Sprite(texture);
  cat.x = app.renderer.width / 2;
  cat.y = app.renderer.height / 2;

  cat.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  cat.eventMode = "static";

  // Rotate around the center
  cat.anchor.x = 0.5;
  cat.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  stage.addChild(cat);

  return { health: 2, sprite: cat, routeDelta: 0, speed, getPosition: route };
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
