import uuidv4 from "uuid/v4";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  Directions,
  DirectionsArray,
  HERO_SIZE,
  MoveKeys
} from "./constants";

/**
 * If a point is beyond a border, set it to having coordinates on the border
 * @param {Point} point
 * @returns {{x: number, y: number}} Point
 */
const normalizePoint = point => {
  const normalizedX =
    point.x < 0 ? 0 : point.x > CANVAS_WIDTH ? CANVAS_WIDTH : point.x;
  const normalizedY =
    point.y < 0 ? 0 : point.y > CANVAS_HEIGHT ? CANVAS_HEIGHT : point.y;
  return { x: normalizedX, y: normalizedY };
};

/**
 * Is a Point at or beyond a north-south wall? If not then it is not a wall-point or an east-west wall
 * @param point
 * @returns {boolean}
 */
const isNorthSouthWall = (point = { x: 0, y: 0 }) => {
  const normalizedPoint = normalizePoint(point);
  return normalizedPoint.x === 0 || normalizedPoint.x === CANVAS_WIDTH;
};
/**
 *
 * @returns {string} random dir, one of four
 */
export const createRandomDir = () => {
  const randomNr = Math.floor(Math.random() * DirectionsArray.length);
  return DirectionsArray[randomNr];
};

/**
 * What is the opposite dir of a dir considering type of wall?
 * @param {string} dir
 * @param {Point} point - where the unit is
 * @returns {string} opposite dir
 */
export const createOppositeDir = (dir, point) => {
  if (dir === Directions.NORTH) {
    return Directions.SOUTH;
  }
  if (dir === Directions.NORTH_EAST) {
    return isNorthSouthWall(point)
      ? Directions.NORTH_WEST
      : Directions.SOUTH_EAST;
  }
  if (dir === Directions.EAST) {
    return Directions.WEST;
  }
  if (dir === Directions.SOUTH_EAST) {
    return isNorthSouthWall(point)
      ? Directions.SOUTH_WEST
      : Directions.NORTH_EAST;
  }
  if (dir === Directions.SOUTH) {
    return Directions.NORTH;
  }
  if (dir === Directions.SOUTH_WEST) {
    return isNorthSouthWall(point)
      ? Directions.SOUTH_EAST
      : Directions.NORTH_WEST;
  }
  if (dir === Directions.EAST) {
    return Directions.WEST;
  }
  if (dir === Directions.NORTH_WEST) {
    return isNorthSouthWall(point)
      ? Directions.NORTH_EAST
      : Directions.SOUTH_WEST;
  }
};

/**
 * Corrects a units position and direction given the collidables
 *  the rule is that there is no pacman/snipes like 'round-going', so a unit
 *  cannot cross the borders. Instead it will 'bounce' or reverse it's direction
 * @param {Unit} unit - the moving subject, can be Snipe or Hero or Bullet
 * @param {number} unitSize - int
 * @param {Array<Unit>} collidables - walls, snipes, heros (anything you cannot cross)
 * @param {function} modifierFn - alters the unit on collission
 * @returns {Unit} modified subject
 */
export const correctUnitPosition = (
  unit,
  unitSize,
  collidables,
  modifierFn = unit => unit // TODO rename collisionHandler ?
) => {
  if (isCollisions(collidables, { x: unit.x, y: unit.y }, unitSize * 1.5)) {
    return modifierFn(unit);
  }
  return unit;
};

// export const correctUnitForWallImpact = (
//   unit,
//   unitSize,
//   fieldWidth,
//   fieldHeight
// ) => {
//   const normalizedPoint = normalizePoint({ ...unit });
//   return normalizedPoint.x === 0 ||
//     normalizedPoint.x === fieldWidth ||
//     normalizedPoint.y === 0 ||
//     normalizedPoint.y === fieldHeight
//     ? { ...unit, x: 0, y: 0 }
//     : unit;
// };

/**
 * Starting with prevPoint, create a new point nrOfPixels in dir
 * @param {string} dir
 * @param {Point} prevPoint
 * @param {number} nrOfPixels
 * @returns {Point} a new Point
 */
export const createNextPoint = (dir, prevPoint, nrOfPixels) => {
  if (prevPoint === null) {
    return null;
  }
  const nextPoint = /** @type Point */ { ...prevPoint };
  switch (dir) {
    case Directions.NORTH:
    case MoveKeys.UP:
      nextPoint.y = prevPoint.y - nrOfPixels;
      break;
    case Directions.NORTH_EAST:
      nextPoint.x = prevPoint.x + nrOfPixels;
      nextPoint.y = prevPoint.y - nrOfPixels;
      break;
    case Directions.EAST:
    case MoveKeys.RIGHT:
      nextPoint.x = prevPoint.x + nrOfPixels;
      break;
    case Directions.SOUTH_EAST:
      nextPoint.x = prevPoint.x + nrOfPixels;
      nextPoint.y = prevPoint.y + nrOfPixels;
      break;
    case Directions.SOUTH:
    case MoveKeys.DOWN:
      nextPoint.y = prevPoint.y + nrOfPixels;
      break;
    case Directions.SOUTH_WEST:
      nextPoint.x = prevPoint.x - nrOfPixels;
      nextPoint.y = prevPoint.y + nrOfPixels;
      break;
    case Directions.WEST:
    case MoveKeys.LEFT:
      nextPoint.x = prevPoint.x - nrOfPixels;
      break;
    case Directions.NORTH_WEST:
      nextPoint.x = prevPoint.x - nrOfPixels;
      nextPoint.y = prevPoint.y - nrOfPixels;
      break;
    default:
      break;
  }
  return nextPoint;
};

/**
 *
 * @param {Hero} hero
 * @param {Array<Unit>} collidables
 * @param {Point} nextPoint
 * @returns {Hero} updated hero
 */
export const moveHero = (hero, collidables, nextPoint) => {
  if (hero === null || nextPoint === null) {
    return null;
  }
  const originalHero = { ...hero };
  const movedHero = /** @type Hero */ {
    ...hero,
    x: nextPoint.x,
    y: nextPoint.y
  };
  return /** @type Hero */ correctUnitPosition(
    movedHero,
    HERO_SIZE,
    collidables,
    () => {
      // console.log("moveHero, there was collision", originalHero.x, originalHero.y, movedHero.x, movedHero.y);
      return originalHero;
    }
  );
};

/**
 * Do two Points share one or more coordinates?
 * @param {Unit} rect1
 * @param {Unit} rect2
 * @param {number} rectSize - the width or height of a rect/Unit
 * @returns {boolean} share?
 */
export const isCollision = (rect1, rect2, rectSize) => {
  if (
    rect1 === null ||
    rect2 === null ||
    typeof rect1 === "undefined" ||
    typeof rect2 === "undefined"
  ) {
    return false;
  }
  const predY1 = rect1.y + rectSize <= rect2.y;
  const predY2 = rect1.y >= rect2.y + rectSize;
  const predX1 = rect1.x + rectSize <= rect2.x;
  const predX2 = rect1.x >= rect2.x + rectSize;
  return !(predY1 || predY2 || predX1 || predX2);
};

/**
 * Do multiple Unit's collide with another Unit?
 * @param {Array<Unit>} subjects
 * @param {Unit} subj
 * @param {number} subjectsSize
 * @returns {boolean}
 */
export const isCollisions = (subjects, subj, subjectsSize) =>
  subjects
    .map(subject => isCollision(subject, subj, subjectsSize))
    .includes(true);

/**
 * Make a bullet seen from a Unit and moving in a certain direction
 * @param {Unit|Hero|snipe} unit of any subtype like snipe
 * @param {number} unitSize
 * @param {string} shootDir
 * @returns {Unit} bullet
 */
export const makeBullet = (unit, unitSize, shootDir) => {
  if (unit === null) return null;
  if (["shootUp", "north"].includes(shootDir)) {
    return {
      x: unit.x,
      y: unit.y - unitSize * 2,
      dir: Directions.NORTH,
      id: uuidv4()
    };
  }
  if (["shootUpRight", "north_east"].includes(shootDir)) {
    return {
      x: unit.x - unitSize * 2,
      y: unit.y,
      dir: Directions.NORTH_EAST,
      id: uuidv4()
    };
  }
  if (["shootRight", "east"].includes(shootDir)) {
    return {
      x: unit.x + unitSize * 2,
      y: unit.y,
      dir: Directions.EAST,
      id: uuidv4()
    };
  }
  if (["shootDownRight", "south_east"].includes(shootDir)) {
    return {
      x: unit.x - unitSize * 2,
      y: unit.y,
      dir: Directions.SOUTH_EAST,
      id: uuidv4()
    };
  }
  if (["shootDown", "south"].includes(shootDir)) {
    return {
      x: unit.x,
      y: unit.y + unitSize * 2,
      dir: Directions.SOUTH,
      id: uuidv4()
    };
  }
  if (["shootDownLeft", "south_west"].includes(shootDir)) {
    return {
      x: unit.x - unitSize * 2,
      y: unit.y,
      dir: Directions.SOUTH_WEST,
      id: uuidv4()
    };
  }
  if (["shootLeft", "west"].includes(shootDir)) {
    return {
      x: unit.x - unitSize * 2,
      y: unit.y,
      dir: Directions.WEST,
      id: uuidv4()
    };
  }
  if (["shootUpLeft", "north_west"].includes(shootDir)) {
    return {
      x: unit.x - unitSize * 2,
      y: unit.y,
      dir: Directions.NORTH_WEST,
      id: uuidv4()
    };
  }
};

/**
 * Calculate distance between two points
 * @param {Point} rect1
 * @param {Point} rect2
 * @returns {number} distance between
 */
export const distance = (rect1, rect2) => {
  const xDiff = rect1.x - rect2.x;
  const yDiff = rect1.y - rect2.y;
  return Math.round(Math.sqrt(xDiff * xDiff + yDiff * yDiff));
};

/**
 * calculate dir where hero is as seen from unit
 * @param {Unit} unit
 * @param {Hero} hero
 * @returns {string|boolean} direction or false if not seen
 */
export const getDirBetween = (unit, hero) => {
  if (unit && hero && distance(unit, hero) < 200) {
    if (unit.y > hero.y && unit.x === hero.x) {
      return Directions.NORTH;
    }
    if (unit.y > hero.y && unit.x < hero.x) {
      return Directions.NORTH_EAST;
    }
    if (unit.y < hero.y && unit.x === hero.x) {
      return Directions.SOUTH;
    }
    if (unit.y < hero.y && unit.x < hero.x) {
      return Directions.SOUTH_EAST;
    }
    if (unit.x > hero.x && unit.y === hero.y) {
      return Directions.WEST;
    }
    if (unit.y < hero.y && unit.x > hero.x) {
      return Directions.SOUTH_WEST;
    }
    if (unit.x < hero.x && unit.x === hero.x) {
      return Directions.EAST;
    }
    if (unit.y > hero.y && unit.x > hero.x) {
      return Directions.NORTH_WEST;
    }
  }
  return false;
};

export const isShootKey = keyCode => keyCode > 40;

/**
 * Calculate the points which amount to a horizontal wall/line
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @returns {Array<Point>} points in the line
 */
const makeHorizontalLinePoints = (startPoint, endPoint) => {
  const points = [];
  for (let i = startPoint.x; i < endPoint.x + 1; i++) {
    points.push({ x: i, y: startPoint.y });
  }
  return points;
};

/**
 * Calculate the points which amount to a vertical wall/line
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @returns {Array<Point>} points in the line
 */
const makeVerticalLinePoints = (startPoint, endPoint) => {
  const points = [];
  for (let i = startPoint.y; i < endPoint.y + 1; i++) {
    points.push({ x: startPoint.x, y: i });
  }
  console.log("makeVerticalLinePoints from", startPoint, points.length);
  return points;
};

/**
 * Calculate the points which amount to a horizontal or vertical wall/line
 * @param {Wall} wall
 * @returns {Array<Point>} points
 */
export const makeLinePoints = wall => {
  const { x1, y1, x2, y2 } = wall;
  const points = [];
  if (y1 === y2) {
    points.push(
      ...makeHorizontalLinePoints({ x: x1, y: y1 }, { x: x2, y: y2 })
    );
  }
  if (x1 === x2) {
    points.push(...makeVerticalLinePoints({ x: x1, y: y1 }, { x: x2, y: y2 }));
  }
  console.log("makeLinePoints", wall, points);
  return points;
};

/**
 * Create a U Shape width open end up for now
 * @param {Point} point, starting from
 * @param {number} size, square width same as height
 * @returns {Array<Point>} the collection of points that together form the wall
 */
export const makeUShape = (point, size) => {
  const points = [];
  // draw line down from startpoint // TODO use map
  points.push(
    ...makeVerticalLinePoints(point, { x: point.x, y: point.y + size })
  );
  // draw line left to right from lower left point
  // draw line right from lower right point
  console.log("makeUShape", points);
  return points;
};

/**
 * is a value not empty?
 * @param value
 * @return {boolean|boolean}
 */
export const hasValue = value => typeof value !== "undefined" && value !== null;
