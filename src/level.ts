import { Point } from "pixi.js";
import { bezier, combine, interpolate, wobblyLine } from "./cat.ts";
import { range } from "./util.ts";
import { gameHeight, gameWidth } from "./const.ts";

type LevelEvent = [number, () => void];

export function times5(offset: number, fn: () => void): LevelEvent[] {
  return [...range(5)].map((n) => [offset + 500 * n, fn]);
}

export function waveOf5(offset: number, from: Point, to: Point): LevelEvent[] {
  return times5(offset, () => catFactory(wobblyLine(from, to)));
}

export const level1: LevelEvent[] = [
  ...waveOf5(1000, new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(3000, new Point(gameWidth, 200), new Point(0, 200)),
  ...waveOf5(6000, new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(6000, new Point(gameWidth, 200), new Point(0, 200)),

  ...times5(8000, () =>
    catFactory(bezier(new Point(0, 200), new Point(150, 0), new Point(gameWidth, 300), new Point(0, gameHeight))),
  ),
  ...times5(8000, () =>
    catFactory(
      bezier(new Point(gameWidth, 200), new Point(gameWidth - 150, 0), new Point(0, 300), new Point(gameWidth, gameHeight)),
    ),
  ),
];
level1.sort((a, b) => a[0] - b[0]);
