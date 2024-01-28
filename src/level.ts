import { Point } from "pixi.js";
import { bezier, CatAssets, combine, hideDangerElem, interpolate, showDangerElem } from "./cat.ts";
import { range } from "./util.ts";
import { gameHeight, gameWidth } from "./const.ts";

export type LevelEvent = [number, () => void];

export interface Level {
  title: string;
  story: string;
  bg: string;
  bigcat: string;
  events: LevelEvent[];
}

export function times(count: number, offset: number, fn: (n: number) => void): LevelEvent[] {
  return [...range(count)].map((n) => [offset + 500 * n, () => fn(n)]);
}

export function times5(offset: number, fn: (n: number) => void): LevelEvent[] {
  return times(5, offset, fn);
}

export function waveOf5(offset: number, ty: keyof CatAssets, from: Point, to: Point): LevelEvent[] {
  return times5(offset, () => catFactory(ty, interpolate(from, to)));
}

function boss(offset: number): LevelEvent[] {
  return [
    [offset, () => showDangerElem("large-enemy")],
    [offset + 3500, () => hideDangerElem("large-enemy")],

    [offset + 3000, () => showDangerElem("tl")],
    [offset + 3000, () => showDangerElem("t")],
    [offset + 3000, () => showDangerElem("tr")],

    [
      offset + 4000,
      () => {
        document.getElementById("boss-hp")!.style.opacity = "0.75";
        bigCat();
      },
    ],

    [offset + 5000, () => hideDangerElem("tl")],
    [offset + 5000, () => hideDangerElem("t")],
    [offset + 5000, () => hideDangerElem("tr")],
  ];
}

const level1Story = `
  <h2 class="font-bold text-4xl">Hungry Cattos!</h2>

  <p>The cats are hungry! move your hand with the arrow keys. Throw treats with the space bar.<br>
  Don't let the cats hit you! They're not very nice when they're this hungry.</p>

  <p class="mt-2">Cats leave you alone and disappear when they're satiated.<br>
  You can only throw treats if you have treats in your hand!<br>
  You can see how many treats are in your hand in the top left corner.<br>
  You constantly pick new treats from your pocket with your other hand.</p>

  <p class="mt-2">You can see how many band-aids you have left in the top right corner.<br>
  If you run out of band-aids, you have to stop feeding the cats!<br>
  Can't get blood everywhere. This level is suitable for the whole family after all! </p>
`;

const level2Story = `
  <h2 class="font-bold text-4xl">Hunky Bulky Big Toms, Lumbering Chonkers and Zoomie Goblins</h2>

  <p>Different kinds of cats take different amounts of treats to be satiated.<br>
  The grey Hunky Bulky Big Toms are a bit slower, but take more treats to be satiated.<br>
  Don't feed the white Lumbering Chonkers! They're very slow, and they don't need to get slower.<br>
  If you feed a Chonker, you lose a band-aid. It makes sense, I swear.<br>
  The solid orange Zoomie Goblins move faster but take less treats to be satiated.</p>
`;

const level3Story = `
  <h2 class="font-bold text-4xl">Masters of the Universe!</h2>

  <p>We all know cats are the real bosses on earth.<br>
  Not much of a stretch to find yout they rule the galaxy and the entire universe, too, right?</p>

  <p class="mt-2">New cats!<br>
  The Spotted Hissy Fits run even faster! Luckily they only take one treat to be satiated.<br>
  Ceilingcats peek from the fabric of reality itself for only a few seconds!<br>
  Feed them before they disappear again!</p>
`;

export const endingStory = `
  <h2 class="font-bold text-4xl">Galactic Medal of Honor!</h2>

  <p>Gud hooman! U'z got a medul for ur meritus servis! thx!<br>
  O, wayt, lemme toornz dis inteepretur off...</p>

  <p class="mt-2"> The Galactic Feline Federation sincerely commends you for your exemplary service!<br>
  We could not have defeated the filthy Pan-Felid Alliance mongrels without your help!<br>
  What? Feeding? Satiated? -- Voidsperson, you are no fresh private!<br>
  Did you really believe those augmentations?</p>

  <p class="mt-2"> Cats disappearing into thin air, endless treats materializing in its pocketses...<br>
  Band-aids! Your ship takes damage from hospital craft just the same as enemy fighters, obviously<br>
  And whose arm has three elbows, huh?</p>

  <p class="mt-2"> Humans. So gullible. I bet you still think we haven't caught the laser pointer.<br>
  Here's your medal. Enjoy it. And I assure you, this is no translation error;<br>
  Kthxbai.</p>
`;

const level1Events: LevelEvent[] = [
  ...waveOf5(1000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(3000, "Basic", new Point(gameWidth - 100, 0), new Point(gameWidth - 100, gameHeight)),
  ...waveOf5(6000, "Basic", new Point(100, 0), new Point(gameWidth - 100, gameHeight)),
  ...waveOf5(6100, "Basic", new Point(gameWidth - 100, 0), new Point(100, gameHeight)),

  ...times5(9000, () =>
    catFactory(
      "Basic",
      bezier(new Point(0, 100), new Point(350, 0), new Point(gameWidth, 300), new Point(300, gameHeight)),
    ),
  ),
  ...times5(10250, () =>
    catFactory(
      "Basic",
      bezier(
        new Point(gameWidth, 100),
        new Point(gameWidth - 350, 0),
        new Point(0, 300),
        new Point(gameWidth - 300, gameHeight),
      ),
    ),
  ),

  ...times(6, 12000, (n) => {
    const x = 100 * n + 50;
    catFactory("Basic", interpolate(new Point(x, 0), new Point(x, gameHeight)));
    catFactory("Basic", interpolate(new Point(gameWidth - x, 0), new Point(gameWidth - x, gameHeight)));
  }),

  ...times(10, 15000, () =>
    catFactory(
      "Basic",
      combine(
        [1, interpolate(new Point(100, 0), new Point(100, gameHeight - 200))],
        [
          2,
          bezier(
            new Point(100, gameHeight - 200),
            new Point(gameWidth - 100, gameHeight - 200),
            new Point(gameWidth - 100, 0),
          ),
        ],
      ),
    ),
  ),

  ...times(10, 20000, () =>
    catFactory(
      "Basic",
      combine(
        [1, interpolate(new Point(gameWidth - 100, 0), new Point(gameWidth - 100, gameHeight - 200))],
        [2, bezier(new Point(gameWidth - 100, gameHeight - 200), new Point(100, gameHeight - 200), new Point(100, 0))],
      ),
    ),
  ),

  [24500, () => showDangerElem("bl")],
  ...waveOf5(25500, "Basic", new Point(100, gameHeight), new Point(100, 0)),
  [27000, () => hideDangerElem("bl")],

  [27000, () => showDangerElem("br")],
  ...waveOf5(28000, "Basic", new Point(gameWidth - 100, gameHeight), new Point(gameWidth - 100, 0)),
  [30500, () => hideDangerElem("br")],

  ...waveOf5(33000, "Basic", new Point(0, 100), new Point(gameWidth, 100)),
  ...waveOf5(33600, "Basic", new Point(0, 200), new Point(gameWidth, 200)),
  ...waveOf5(34200, "Basic", new Point(0, 300), new Point(gameWidth, 300)),
  ...waveOf5(34800, "Basic", new Point(0, 400), new Point(gameWidth, 400)),

  ...waveOf5(37000, "Basic", new Point(gameWidth, 100), new Point(0, 100)),
  ...waveOf5(37600, "Basic", new Point(gameWidth, 200), new Point(0, 200)),
  ...waveOf5(38200, "Basic", new Point(gameWidth, 300), new Point(0, 300)),
  ...waveOf5(38800, "Basic", new Point(gameWidth, 400), new Point(0, 400)),

  ...boss(46000),
];
level1Events.sort((a, b) => a[0] - b[0]);

// todo
const level2Events = [
  ...waveOf5(1000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(3000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(5000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(7000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(9000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(11000, "Basic", new Point(100, 0), new Point(100, gameHeight)),

  ...boss(46000),
];
level2Events.sort((a, b) => a[0] - b[0]);

const level3Events = [
  ...waveOf5(1000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(3000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(5000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(7000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(9000, "Basic", new Point(100, 0), new Point(100, gameHeight)),
  ...waveOf5(11000, "Basic", new Point(100, 0), new Point(100, gameHeight)),

  ...boss(46000),
];
level3Events.sort((a, b) => a[0] - b[0]);

export const level1: Level = {
  title: "Level 1",
  bg: "Lvl1.png",
  bigcat: "BigCatto.png",
  story: level1Story,
  events: level1Events,
};
export const level2: Level = {
  title: "Level 2",
  bg: "Lvl1.png",
  bigcat: "BigCatto.png",
  story: level2Story,
  events: level2Events,
};
export const level3: Level = {
  title: "Level 3",
  bg: "Lvl3.png",
  bigcat: "GlowCatto.png",
  story: level3Story,
  events: level3Events,
};
