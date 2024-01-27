import { Sprite, Texture } from "pixi.js";

let treatIcons: Sprite[] = [];

export function initTreatCount(texture: Texture) {
  for (let i = 0; i < 10; i++) {
    const treat = new Sprite(texture);
    treat.x = ((treat.width + 10) / 2) * (i + 1);
    treat.y = treat.height / 2;
    treat.anchor.x = 0.5;
    treat.anchor.y = 0.5;
    stage.addChild(treat);
    treatIcons.push(treat);
  }
}

export function updateTreatCount(count: number) {
  for (let i = 0; i < treatIcons.length; i++) {
    treatIcons[i].visible = i < count;
  }
}
