import { AnimatedSprite, Sprite, Texture } from "pixi.js";
import { gameWidth } from "./const.ts";

let healthIcons: Sprite[] = [];

export function initHealthCount(textures: Texture[]) {
  healthIcons = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 3; y++) {
      let i = x * 10 + y;
      const heart = new AnimatedSprite(textures);
      heart.animationSpeed = 0.1;
      heart.gotoAndPlay(i % textures.length);
      heart.x = gameWidth - (((heart.width + 10) / 2) * (x + 1) + y) * 4 + 10;
      heart.y = (heart.height / 2 + y * 10) * 2 + 10;
      heart.scale.x = 4;
      heart.scale.y = 4;
      heart.anchor.x = 0.5;
      heart.anchor.y = 0.5;
      stage.addChild(heart);
      healthIcons.push(heart);
    }
  }
}

export function updateHealthIcons(count: number) {
  for (let i = 0; i < healthIcons.length; i++) {
    healthIcons[i].visible = i < count;
  }
}
