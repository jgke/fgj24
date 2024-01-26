/// <reference types="vite/client" />

import { Application } from "pixi.js";
import { InputState } from "./input.ts";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var app: Application;
  var inp: InputState;
  var delta: number;
}
