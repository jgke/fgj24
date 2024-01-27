/// <reference types="vite/client" />

import { Application } from "pixi.js";
import { InputState } from "./input.ts";
import { CatRoute } from "./cat.ts";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var app: Application;
  var inp: InputState;
  var delta: number;
  var tick: number;

  var catFactory: (route: CatRoute, speed = 1) => void;
}
