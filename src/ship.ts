import { Assets, Sprite } from "pixi.js";
import { playEvent } from "./fmod.ts";
import { gameHeight, gameWidth } from "./const.ts";

export let ship: Sprite;

export async function init() {
  const texture = await Assets.load("assets/cat.png");
  ship = new Sprite(texture);
  ship.x = app.renderer.width / 2;
  ship.y = app.renderer.height / 2;

  ship.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  ship.eventMode = "static";

  // Rotate around the center
  ship.anchor.x = 0.5;
  ship.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  app.stage.addChild(ship);
}

export function updateShip() {
  const speed = 10;
  ship.x += speed * inp.moveX * delta;
  ship.y += speed * inp.moveY * delta;

  if (ship.x - ship.width / 2 < 0) ship.x = ship.width / 2;
  if (ship.x + ship.width / 2 > gameWidth) ship.x = gameWidth - ship.width / 2;
  if (ship.y - ship.height / 2 < 0) ship.y = ship.height / 2;
  if (ship.y + ship.height / 2 > gameHeight) ship.y = gameHeight - ship.height / 2;
}
