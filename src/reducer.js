import {
  correctUnitPosition,
  createRandomDir,
  moveHero,
  createNextPoint,
  makeBullet,
  isCollisions,
  getDirBetween,
  calculatePointsForLine,
  createOppositeDir
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
  TOGGLE_RICOCHET_CMD,
  CREATE_WALLS_CMD,
  SNIPE_SHOOT_INTERVAL_
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
      if (typeof bullet !== "undefined" && bullet !== null) {
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
    });
    const updatedHero =
      state.hero === null ||
      isCollisions(state.bullets, state.hero, HERO_SIZE * 2)
        ? null
        : state.hero;
    const updatedSnipes = state.snipes.map(snipe => {
      if (typeof snipe !== "undefined" && snipe !== null) {
        if (!isCollisions(state.bullets, snipe, SNIPE_SIZE * 2)) {
          return snipe;
        }
      }
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
        if (typeof snipe !== "undefined" && snipe !== null) {
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
      }
    );
    const updatedBullets = /** @type Array<Unit> */ [...state.bullets];
    // scan circle of terror and when a hero is in it: 1. decide which dir hero is, 2. stop moving 3. shoot in dir
    state.snipes.map(_snipe => {
      if (state.nrOfMoves % SNIPE_SHOOT_INTERVAL_ === 0) {
        let dir = getDirBetween(_snipe, state.hero);
        if (dir) {
          updatedBullets.push(makeBullet(_snipe, HERO_SIZE, dir));
        }
      }
    });
    state.nrOfMoves++;
    return { ...state, snipes: updatedSnipes, bullets: updatedBullets };
  }
  if (MOVE_HERO_CMD === action.type) {
    const prevPoint =
      state.hero !== null ? { x: state.hero.x, y: state.hero.y } : null;
    const nextPoint = createNextPoint(action.dir, prevPoint, PX_PER_MOVE);
    console.log("moveHero", prevPoint, nextPoint);
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
  if (TOGGLE_RICOCHET_CMD === action.type) {
    const updatedSettings = state.settings;
    updatedSettings.ricochet = !state.settings.ricochet;
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
    const updatedWalls = [wall0, wall1, wall2, wall3, wall4, wall5];

    const freshWallPoints = [];
    freshWallPoints.push(...calculatePointsForLine(wall0));
    freshWallPoints.push(...calculatePointsForLine(wall1));
    freshWallPoints.push(...calculatePointsForLine(wall2));
    freshWallPoints.push(...calculatePointsForLine(wall3));
    freshWallPoints.push(...calculatePointsForLine(wall4));
    freshWallPoints.push(...calculatePointsForLine(wall5));

    return { ...state, walls: updatedWalls, wallPoints: freshWallPoints };
  }
  return state;
};
