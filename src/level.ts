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
  <h2 class="font-bold text-4xl">Hungry Cattos!</h2>

  <p>The cats are hungry! move your hand with the arrow keys. Throw treats with the space bar. 
  Don't let the cats hit you! They're not very nice when they're this hungry.</p>

  <p class="mt-2">Cats leave you alone and disappear when they're satiated.
  You can only throw treats if you have treats in your hand!
  You can see how many treats are in your hand in the top left corner.
  You constantly pick new treats from your pocket with your other hand.</p>

  <p class="mt-2">You can see how many band-aids you have left in the top right corner.
  If you run out of band-aids, you have to stop feeding the cats!
  Can't get blood everywhere. This level is suitable for the whole family after all! </p>
`;

const level2Story = `
  <h2 class="font-bold text-4xl">Hunky Bulky Big Toms, Lumbering Chonkers and Zoomie Goblins</h2>

  <p>Different kinds of cats take different amounts of treats to be satiated. 
  The grey Hunky Bulky Big Toms are a bit slower, but take more treats to be satiated.
  Don't feed the white Lumbering Chonkers! They're very slow, and they don't need to get slower.
  If you feed a Chonker, you lose a band-aid. It makes sense, I swear.
  The solid orange Zoomie Goblins move faster but take less treats to be satiated.</p>
`;

const level3Story = `
  <h2 class="font-bold text-4xl">Masters of the Universe!</h2>

  <p>We all know cats are the real bosses on earth. 
  Not much of a stretch to find yout they rule the galaxy and the entire universe, too, right?</p>

  <p class="mt-2">New cats!
  The Spotted Hissy Fits run straight towards you! Luckily they only take one treat to be satiated.
  Ceilingcats peek from the fabric of reality itself for only a few seconds!
  Feed them before they disappear again!</p>
`;

export const endingStory = `
  <h2 class="font-bold text-4xl">Galactic Medal of Honor!</h2>

  <p>Gud hooman! U'z got a medul for ur meritus servis! thx!
  O, wayt, lemme toornz dis inteepretur off...</p>

  <p class="mt-2"> The Galactic Feline Federation sincerely commends you for your exemplary service!
  We could not have defeated the filthy Pan-Felid Alliance mongrels without your help!
  What? Feeding? Satiated? -- Voidsperson, you are no fresh private!
  Did you really believe those augmentations?</p>

  <p class="mt-2"> Cats disappearing into thin air, endless treats materializing in its pocketses...
  Band-aids! Your ship takes damage from hospital craft just the same as enemy fighters, obviously
  And whose arm has three elbows, huh?</p>

  <p class="mt-2"> Humans. So gullible. I bet you still think we haven't caught the laser pointer.
  Here's your medal. Enjoy it. And I assure you, this is no translation error;
  Kthxbai.</p>
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
  //[1000, () => bigCat()],
];
level1Events.sort((a, b) => a[0] - b[0]);

// todo
const level2Events = level1Events;
const level3Events = level1Events;

export const level1: Level = { title: "Level 1", story: level1Story, events: level1Events };
export const level2: Level = { title: "Level 2", story: level2Story, events: level2Events };
export const level3: Level = { title: "Level 3", story: level3Story, events: level3Events };
