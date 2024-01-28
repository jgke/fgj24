/// <reference types="vite/client" />

import { Application, Container } from "pixi.js";
import { InputState } from "./input.ts";
import { CatKey, CatRoute } from "./cat.ts";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var app: Application;
  var stage: Container;
  var inp: InputState;
  var delta: number;
  var tick: number;

  var catFactory: (ty: CatKey, route: CatRoute, speed = 1) => void;
  var bigCat: () => void;
}
