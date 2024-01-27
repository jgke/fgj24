import { Point } from "pixi.js";
import { bezier, CatAssets, wobblyLine } from "./cat.ts";
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

export function waveOf5(offset: number, ty: keyof CatAssets, from: Point, to: Point): LevelEvent[] {
  return times5(offset, () => catFactory(ty, wobblyLine(from, to)));
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
  ...waveOf5(1000, "Basic", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(3000, "Basic", new Point(gameWidth, 200), new Point(0, 200)),
  ...waveOf5(6000, "Basic", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(6000, "Basic", new Point(gameWidth, 200), new Point(0, 200)),

  ...times5(9000, () =>
    catFactory(
      "Buff",
      bezier(new Point(0, 200), new Point(350, 0), new Point(gameWidth, 300), new Point(0, gameHeight)),
    ),
  ),
  ...times5(10250, () =>
    catFactory(
      "Buff",
      bezier(
        new Point(gameWidth, 200),
        new Point(gameWidth - 350, 0),
        new Point(0, 300),
        new Point(gameWidth, gameHeight),
      ),
    ),
  ),

  ...waveOf5(13000, "Zoomie", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(13600, "Zoomie", new Point(0, 200), new Point(gameWidth, 200)),
  ...waveOf5(14200, "Zoomie", new Point(0, 300), new Point(gameWidth, 300)),
  ...waveOf5(14800, "Zoomie", new Point(0, 400), new Point(gameWidth, 400)),

  ...waveOf5(17000, "Zoomie", new Point(gameWidth, 100), new Point(0, 100)),
  ...waveOf5(17600, "Zoomie", new Point(gameWidth, 200), new Point(0, 200)),
  ...waveOf5(18200, "Zoomie", new Point(gameWidth, 300), new Point(0, 300)),
  ...waveOf5(18800, "Zoomie", new Point(gameWidth, 400), new Point(0, 400)),

  ...waveOf5(22000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(27000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(32000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(37000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(42000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(47000, "Chungus", new Point(0, 100), new Point(gameWidth, 100)),

  //[50000, () => bigCat()]
  [1000, () => bigCat()],
];
level1Events.sort((a, b) => a[0] - b[0]);

export const level1: Level = { title: "Level 1", story: level1Story, events: level1Events };
