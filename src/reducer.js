import {
  correctUnitPosition,
  createRandomDir,
  moveHero,
  createNextPoint,
  makeBullet,
  isCollisions,
  getDirBetween,
  makeLinePoints,
  createOppositeDir,
  makeUShape,
  hasValue
} from "./utils";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIRECTION_LIMIT,
  PX_PER_MOVE,
  SNIPE_SIZE,
  MOVE_SNIPES_CMD,
  MOVE_HERO_CMD,
  HERO_SHOOT_CMD,
  MOVE_BULLETS_CMD,
  BULLET_SIZE,
  HERO_SIZE,
  CHANGE_SETTING_CMD,
  CREATE_WALLS_CMD,
  SNIPE_SHOOT_INTERVAL
} from "./constants";

/**
 * makeNextState is what is commonly known a 'reducer', but I don't like the word.
 * It is NOT in utils.js, since it manipulates state
 * @param {Object<State>} state
 * @param {Object<Action>} action - contains instructions on how to make next state
 * @returns {Object<State>} next state
 */
export const makeNextState = (state, action) => {
  if (MOVE_BULLETS_CMD === action.type) {
    const updatedBullets = state.bullets.map(bullet => {
      if (hasValue(bullet)) {
        let nextPoint = createNextPoint(
          bullet.dir,
          /** @type Point */ { x: bullet.x, y: bullet.y },
          PX_PER_MOVE
        );
        return correctUnitPosition(
          { ...bullet, ...nextPoint },
          BULLET_SIZE,
          [state.hero, ...state.snipes, ...state.wallPoints],
          () => {
            return null; // nullify bullet on impact
          }
        );
      }
      return [];
    });
    const updatedHero =
      state.hero === null ||
      isCollisions(state.bullets, state.hero, HERO_SIZE * 2)
        ? null
        : state.hero;
    const updatedSnipes = state.snipes.map(snipe => {
      if (hasValue(snipe)) {
        if (!isCollisions(state.bullets, snipe, SNIPE_SIZE * 2.5)) {
          return snipe;
        }
      }
      return [];
    });
    return {
      ...state,
      bullets: updatedBullets,
      snipes: updatedSnipes,
      hero: updatedHero
    };
  }
  if (MOVE_SNIPES_CMD === action.type) {
    const updatedSnipes = state.snipes.map(
      /** @type Snipe */ snipe => {
        if (hasValue(snipe)) {
          if (state.nrOfMoves % DIRECTION_LIMIT === 0) {
            snipe.dir = createRandomDir();
          }
          let prevPoint = /** @type Point */ { x: snipe.x, y: snipe.y };
          let nextPoint = createNextPoint(snipe.dir, prevPoint, PX_PER_MOVE);

          return /** @type Snipe */ {
            ...snipe,
            ...nextPoint,
            ...correctUnitPosition(
              /** @type Snipe */ { ...snipe, ...nextPoint },
              SNIPE_SIZE,
              [
                ...state.wallPoints,
                ...state.bullets,
                ...state.snipes,
                state.hero
              ],
              snipe => {
                // console.log("collisionHandler snipe collided with something");
                const updatedSnipe = {};
                updatedSnipe.x = prevPoint.x;
                updatedSnipe.y = prevPoint.y;
                updatedSnipe.dir = createOppositeDir(snipe.dir, nextPoint);
                return updatedSnipe;
              }
            )
          };
        }
        return [];
      }
    );
    const updatedBullets = /** @type Array<Unit> */ [...state.bullets];
    // scan circle of terror and when a hero is in it: 1. decide which dir hero is, 2. stop moving 3. shoot in dir
    if (state.settings.snipesMayShoot) {
      state.snipes.map(_snipe => {
        if (state.nrOfMoves % SNIPE_SHOOT_INTERVAL === 0) {
          let dir = getDirBetween(_snipe, state.hero);
          if (dir) {
            updatedBullets.push(makeBullet(_snipe, HERO_SIZE, dir));
          }
        }
        return [];
      });
    }
    state.nrOfMoves++;
    return { ...state, snipes: updatedSnipes, bullets: updatedBullets };
  }
  if (MOVE_HERO_CMD === action.type) {
    const prevPoint = hasValue(state.hero)
      ? { x: state.hero.x, y: state.hero.y }
      : null;
    const nextPoint = createNextPoint(action.dir, prevPoint, PX_PER_MOVE);
    // console.log("moveHero", prevPoint, nextPoint);
    const updatedHero = moveHero(
      state.hero,
      [...state.wallPoints, ...state.snipes],
      nextPoint
    );
    return { ...state, hero: updatedHero };
  }
  if (HERO_SHOOT_CMD === action.type) {
    state.bullets.push(makeBullet(state.hero, HERO_SIZE, action.shootDir));
    return { ...state };
  }
  if (CHANGE_SETTING_CMD === action.type) {
    const updatedSettings = state.settings;
    updatedSettings[action.settingKey] = action.settingValue;
    return { ...state, settings: updatedSettings };
  }
  if (CREATE_WALLS_CMD === action.type) {
    const wall0 = { x1: 0, y1: 0, x2: CANVAS_WIDTH, y2: 0 };
    const wall1 = { x1: 0, y1: 0, x2: 0, y2: CANVAS_HEIGHT };
    const wall2 = {
      x1: 0,
      y1: CANVAS_HEIGHT,
      x2: CANVAS_WIDTH,
      y2: CANVAS_HEIGHT
    };
    const wall3 = {
      x1: CANVAS_WIDTH,
      y1: 0,
      x2: CANVAS_WIDTH,
      y2: CANVAS_HEIGHT
    };

    const wall4 = { x1: 0, y1: 100, x2: 500, y2: 100 };
    const wall5 = { x1: 200, y1: 100, x2: 200, y2: 500 };
    const wall6 = { x1: 500, y1: 700, x2: 700, y2: 700 };
    const wall7 = { x1: 100, y1: 700, x2: 400, y2: 700 };

    const updatedWalls = [
      wall0,
      wall1,
      wall2,
      wall3,
      wall4,
      wall5,
      wall6,
      wall7
    ];

    const freshWallPoints = [];
    updatedWalls.forEach(wall => freshWallPoints.push(...makeLinePoints(wall)));
    console.log("freshWallPoints #1 ", freshWallPoints.length);
    freshWallPoints.push(...makeUShape({ x: 500, y: 500 }, 50));
    console.log("freshWallPoints #2 ", freshWallPoints.length);

    return { ...state, walls: updatedWalls, wallPoints: freshWallPoints };
  }
  return state;
};
