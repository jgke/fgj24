import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";

export interface Cat {
  health: number;
  sprite: Sprite;
  routeDelta: number;
  speed: number;
  getPosition(delta: number): Point;
}
export type CatRoute = (delta: number) => Point;

export function combine(...routes: [number, CatRoute][]): CatRoute {
  const total = routes.map(([n, _]) => n).reduce((a, b) => a + b);
  return (delta) => {
    const cur = total * delta;
    let start = 0;
    for (let i = 0; i < routes.length; i++) {
      const end = start + routes[i][0];
      if (start <= cur && cur <= end) {
        const innerDelta = (cur - start) / (end - start);
        return routes[i][1](innerDelta);
      }
      start = end;
    }
    return routes[routes.length - 1][1](1);
  };
}

export function interpolate(from: Point, to: Point): CatRoute {
  return (delta) => new Point(from.x + delta * (to.x - from.x), from.y + delta * (to.y - from.y));
}

export function wobblyLine(from: Point, to: Point): CatRoute {
  return (delta) => {
    const p = interpolate(from, to)(delta);
    p.y += Math.sin(delta * 10) * 10;
    return p;
  };
}

export function bezier(...points: Point[]): CatRoute {
  return (delta) => {
    if (points.length <= 1) return points[0];
    if (points.length == 2) return interpolate(points[0], points[1])(delta);
    const pn = [];
    for (let i = 0; i < points.length - 1; i++) {
      pn.push(interpolate(points[i], points[i + 1])(delta));
    }
    return bezier(...pn)(delta);
  };
}

export function init(texture: Texture, route: CatRoute, speed: number = 1): Cat {
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

  const pos = cat.getPosition(cat.routeDelta);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
