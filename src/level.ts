import { Point } from "pixi.js";
import { bezier, combine, interpolate, wobblyLine } from "./cat.ts";

type LevelEvent = [number, () => void];

export function waveOf5(offset: number, from: Point, to: Point): LevelEvent[] {
  return [
    [offset, () => catFactory(wobblyLine(from, to))],
    [offset + 500, () => catFactory(wobblyLine(from, to))],
    [offset + 1000, () => catFactory(wobblyLine(from, to))],
    [offset + 1500, () => catFactory(wobblyLine(from, to))],
    [offset + 2000, () => catFactory(wobblyLine(from, to))],
  ];
}

export const level1: LevelEvent[] = [
  ...waveOf5(1000, new Point(0, 100), new Point(400, 100)),
  ...waveOf5(3000, new Point(400, 200), new Point(0, 200)),
  ...waveOf5(6000, new Point(0, 100), new Point(400, 100)),
  ...waveOf5(6000, new Point(400, 200), new Point(0, 200)),

  [8000, () => catFactory(bezier(new Point(0, 200), new Point(100, 0), new Point(400, 300), new Point(0, 800)))],
  [
    10000,
    () =>
      catFactory(
        combine(
          [1, interpolate(new Point(0, 200), new Point(200, 200))],
          [2, wobblyLine(new Point(200, 200), new Point(300, 0))],
          [1, interpolate(new Point(100, 100), new Point(0, 200))],
        ),
        0.5,
      ),
  ],
];
level1.sort((a, b) => a[0] - b[0]);
