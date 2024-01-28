import { Point, Sprite } from "pixi.js";

export function offscreen(sprite: Sprite): boolean {
  return (
    sprite.x + sprite.width < 0 ||
    sprite.x - sprite.width > app.view.width / stage.scale.x ||
    sprite.y + sprite.height < 0 ||
    sprite.y - sprite.height > app.view.height / stage.scale.y
  );
}

export function center(sprite: Sprite): Point {
  return new Point(
    sprite.x + sprite.width / 2 - sprite.width * sprite.anchor.x,
    sprite.y + sprite.height / 2 - sprite.height * sprite.anchor.y,
  );
}

export function firepoint(sprite: Sprite): Point {
  const point = center(sprite);
  point.y = point.y - sprite.height / 2 + sprite.width / 3;
  return point;
}

export function range(n: number): number[] {
  return [...Array(n)].map((_, i) => i);
}

export function pixelPerfectScale(
  containerWidth: number,
  containerHeight: number,
  windowWidth: number,
  windowHeight: number,
): number {
  let scale = 1;

  while (containerWidth * (scale + 1) <= windowWidth && containerHeight * (scale + 1) <= windowHeight) scale += 1;
  console.log("Midscale", scale);
  while (containerWidth * scale > windowWidth || containerHeight * scale > windowHeight) scale /= 2;

  console.log("Scaled to", scale);

  return scale;
}
