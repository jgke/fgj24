/// <reference types="vite/client" />

import { Application, Container } from "pixi.js";
import { InputState } from "./input.ts";
import { CatKey, CatRoute } from "./cat.ts";
import { Ship } from "./ship.ts";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var app: Application;
  var stage: Container;
  var inp: InputState;
  var delta: number;
  var tick: number;
  var ship: Ship;

  var catFactory: (ty: CatKey, route: CatRoute, speed = 1) => void;
  var bigCat: (hard: boolean) => void;
}
