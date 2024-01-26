import { Point, Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";

export interface Cat {
  sprite: Sprite;
  routeDelta: number;
  route: [Point, Point];
}

export function init(texture: Texture): Cat {
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
  app.stage.addChild(cat);

  return { sprite: cat, routeDelta: 0, route: [new Point(0, 100), new Point(400, 100)] };
}

export function updateCat(cat: Cat): boolean {
  cat.routeDelta += delta / 100;
  if (cat.routeDelta > 1) {
    app.stage.removeChild(cat.sprite);
    return true;
  }

  cat.sprite.x = cat.route[0].x + cat.routeDelta * (cat.route[1].x - cat.route[0].x);
  cat.sprite.y = cat.route[0].y + cat.routeDelta * (cat.route[1].y - cat.route[0].y);

  return false;
}
