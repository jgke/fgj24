/// <reference types="vite/client" />

import { Application } from "pixi.js";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var app: Application;
}
