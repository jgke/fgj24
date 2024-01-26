import { Point, Sprite } from "pixi.js";

export function offscreen(sprite: Sprite): boolean {
  return (
    sprite.x + sprite.width < 0 ||
    sprite.x - sprite.width > app.view.width ||
    sprite.y + sprite.height < 0 ||
    sprite.y - sprite.height > app.view.height
  );
}

export function center(sprite: Sprite): Point {
  return new Point(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
}
