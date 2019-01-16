export const Directions = {
  NORTH: "north",
  NORTH_EAST: "north_east",
  EAST: "east",
  SOUTH_EAST: "south_east",
  SOUTH: "south",
  SOUTH_WEST: "south_west",
  WEST: "west",
  NORTH_WEST: "north_west"
};

export const MoveKeys = {
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left"
};

export const DirectionsArray = [
  Directions.NORTH,
  Directions.NORTH_EAST,
  Directions.EAST,
  Directions.SOUTH_EAST,
  Directions.SOUTH,
  Directions.SOUTH_WEST,
  Directions.WEST,
  Directions.NORTH_WEST
];

/**
 * Map browser keydown keyCode nr's to movement stuff
 */
export const keyMap = {
  39: "right",
  37: "left",
  38: "up",
  40: "down",
  65: "shootLeft",
  67: "shootDownRight",
  68: "shootRight",
  69: "shootUpRight",
  81: "shootUpLeft",
  87: "shootUp",
  83: "shootDown",
  90: "shootDownLeft"
};

export const CANVAS_WIDTH = 800;

export const CANVAS_HEIGHT = 800;

export const DIRECTION_LIMIT = 20;

export const INTERVAL_BETWEEN_MOVES_MS = 100;

export const PX_PER_MOVE = 10;

export const SNIPE_SIZE = 5;
export const HERO_SIZE = 10;
export const BULLET_SIZE = 3;
export const WALL_SIZE = 3;
export const SNIPE_SHOOT_INTERVAL = 8;

export const MOVE_SNIPES_CMD = "MOVE_SNIPES_CMD";
export const MOVE_HERO_CMD = "MOVE_HERO_CMD";
export const HERO_SHOOT_CMD = "HERO_SHOOT_CMD";
export const MOVE_BULLETS_CMD = "MOVE_BULLETS_CMD";
export const CHANGE_SETTING_CMD = "CHANGE_SETTING_CMD";
export const CREATE_WALLS_CMD = "CREATE_WALLS_CMD";
