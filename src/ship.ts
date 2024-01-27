import { Sprite, Texture } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { gameHeight, gameWidth } from "./const.ts";

interface Ship {
  sprite: Sprite;
  health: number;
}

export function initShip(texture: Texture): Ship {
  const ship = new Sprite(texture);
  ship.x = app.renderer.width / 2;
  ship.y = app.renderer.height + ship.height;

  ship.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  ship.eventMode = "static";

  // Rotate around the center
  ship.anchor.x = 0.5;
  ship.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  stage.addChild(ship);

  return { sprite: ship, health: 12 };
}

export function updateShip(ship: Ship) {
  const speed = 10;
  ship.sprite.x += speed * inp.moveX * delta;
  ship.sprite.y += speed * inp.moveY * delta;

  if (ship.sprite.x - ship.sprite.width / 2 < 0) ship.sprite.x = ship.sprite.width / 2;
  if (ship.sprite.x + ship.sprite.width / 2 > gameWidth) ship.sprite.x = gameWidth - ship.sprite.width / 2;
  if (ship.sprite.y - ship.sprite.height / 2 < 0) ship.sprite.y = ship.sprite.height / 2;
  if (ship.sprite.y - ship.sprite.height / 2 + ship.sprite.width > gameHeight)
    ship.sprite.y = gameHeight + ship.sprite.height / 2 - ship.sprite.width;
}
