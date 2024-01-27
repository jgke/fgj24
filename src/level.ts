import { Point } from "pixi.js";
import { bezier, wobblyLine } from "./cat.ts";
import { range } from "./util.ts";
import { gameHeight, gameWidth } from "./const.ts";

export type LevelEvent = [number, () => void];

export interface Level {
  title: string;
  story: string;
  events: LevelEvent[];
}

export function times5(offset: number, fn: () => void): LevelEvent[] {
  return [...range(5)].map((n) => [offset + 500 * n, fn]);
}

export function waveOf5(offset: number, from: Point, to: Point): LevelEvent[] {
  return times5(offset, () => catFactory(wobblyLine(from, to)));
}

const level1Story = `
  <h2 class="font-bold text-4xl">Jani please add story</h2>

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat.</p>

  <p class="mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
  laborum.</p>
`;

const level1Events: LevelEvent[] = [
  ...waveOf5(1000, new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(3000, new Point(gameWidth, 200), new Point(0, 200)),
  ...waveOf5(6000, new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(6000, new Point(gameWidth, 200), new Point(0, 200)),

  ...times5(8000, () =>
    catFactory(bezier(new Point(0, 200), new Point(150, 0), new Point(gameWidth, 300), new Point(0, gameHeight))),
  ),
  ...times5(8000, () =>
    catFactory(
      bezier(
        new Point(gameWidth, 200),
        new Point(gameWidth - 150, 0),
        new Point(0, 300),
        new Point(gameWidth, gameHeight),
      ),
    ),
  ),
];
level1Events.sort((a, b) => a[0] - b[0]);

export const level1: Level = { title: "Level 1", story: level1Story, events: level1Events };
