import "./style.css";
import { Application, Sprite, Assets } from "pixi.js";

import { initFmod, updateFmod, playEvent } from "./fmod";
import { updateInputState } from "./input";

const fmodPromise = initFmod().then(() => console.log("FMOD initialized"));

async function init() {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application({ width: 400, height: 400 });
  await fmodPromise;

  // The application will create a canvas element for you that you
  // can then insert into the DOM
  document.getElementById("app")!.appendChild(app.view as any);

  // load the texture we need
  const texture = await Assets.load("assets/cat.png");

  // This creates a texture from a 'bunny.png' image
  const bunny = new Sprite(texture);

  // Setup the position of the bunny
  bunny.x = app.renderer.width / 2;
  bunny.y = app.renderer.height / 2;

  bunny.on("pointerdown", () => {
    playEvent("event:/meow");
  });
  bunny.eventMode = "static";

  // Rotate around the center
  bunny.anchor.x = 0.5;
  bunny.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  app.stage.addChild(bunny);

  // Listen for frame updates
  app.ticker.add((delta) => {
    updateFmod();
    const inp = updateInputState();
    // each frame we spin the bunny around a bit
    bunny.rotation += 0.01 * delta;
    bunny.x += inp.moveX * delta;
    bunny.y += inp.moveY * delta;
  });
}
document.getElementById("start-playing")!.addEventListener("click", () => {
  document.getElementById("loader")!.remove();
  init().then(console.log);
});
