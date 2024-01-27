import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";

export interface Cat {
  sprite: Sprite;
  routeDelta: number;
  getPosition(delta: number): Point;
}
export type CatRoute = (delta: number) => Point;

export function wobblyLine(from: Point, to: Point): CatRoute {
  return (delta) =>
    new Point(from.x + delta * (to.x - from.x), from.y + delta * (to.y - from.y) + Math.sin(delta * 10) * 10);
}

export function init(texture: Texture, route: CatRoute): Cat {
  const cat = new Sprite(texture);
  cat.x = app.renderer.width / 2;
  cat.y = app.renderer.height / 2;
  cat.scale.x = 2;
  cat.scale.y = 2;

  cat.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  cat.eventMode = "static";

  // Rotate around the center
  cat.anchor.x = 0.5;
  cat.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  app.stage.addChild(cat);

  return { sprite: cat, routeDelta: 0, getPosition: route };
}

export function updateCat(cat: Cat): boolean {
  cat.routeDelta += delta / 100;
  if (cat.routeDelta > 1) {
    app.stage.removeChild(cat.sprite);
    return true;
  }

  const pos = cat.getPosition(cat.routeDelta);

  cat.sprite.x = pos.x;
  cat.sprite.y = pos.y;

  return false;
}
