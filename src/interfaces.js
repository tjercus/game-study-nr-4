/**
 * @interface Point
 * @property {number} x - cartesian coord, left-right axis
 * @property {number} y - cartesian coord, up-down axis
 */
/**
 * TODO perhaps name 'Movable'
 * @interface Unit
 * @augments Point
 * @property {string} dir - direction
 */

/**
 * @interface Snipe
 * @augments Unit
 */

/**
 * @interface Hero
 * @augments Unit
 */

/**
 * @interface Bullet
 * @augments Unit
 */

/**
 * @interface Action
 * @property {string} type
 * @property {Object} payload
 */

/**
 * @interface Wall
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 * @property {Array<Point>} points
 */
