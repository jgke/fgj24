import { Point, Sprite, Texture } from "pixi.js";
import { offscreen } from "./util.ts";

export interface Treat {
  sprite: Sprite;
  velocity: Point;
}

export function init(texture: Texture, location: Point): Treat {
  const treat = new Sprite(texture);
  treat.x = location.x;
  treat.y = location.y;
  treat.anchor.x = 0.5;
  treat.anchor.y = 0.5;
  app.stage.addChild(treat);
  return { sprite: treat, velocity: new Point((Math.random() - 0.5) * 3, -10) };
}

export function updateTreat(treat: Treat): boolean {
  treat.sprite.x += treat.velocity.x * delta;
  treat.sprite.y += treat.velocity.y * delta;
  if (offscreen(treat.sprite)) {
    app.stage.removeChild(treat.sprite);
    return true;
  }

  return false;
}
