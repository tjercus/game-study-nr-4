import React, { Component, Fragment } from "react";
import Canvas from "./Canvas";
import "./App.css";
import {
  correctUnitBeyondBorderPosition,
  createRandomDir,
  moveHero,
  createNextPoint,
  isCollision,
  makeBullet,
  isCollisions,
  getDirBetween,
  correctUnitForBorderImpact
} from "./utils";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  Directions,
  DIRECTION_LIMIT,
  INTERVAL_BETWEEN_MOVES_MS,
  PX_PER_MOVE,
  keyMap,
  SNIPE_SIZE,
  MOVE_SNIPES_CMD,
  MOVE_HERO_CMD,
  HERO_SHOOT_CMD,
  MOVE_BULLETS_CMD,
  BULLET_SIZE,
  HERO_SIZE,
  TOGGLE_RICOCHET_CMD
} from "./constants";
import uuidv4 from "uuid/v4";

const defaultState = {
  nrOfMoves: 0,
  hero: {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_WIDTH / 2,
    id: uuidv4()
  },
  snipes: [
    { x: 100, y: 100, dir: Directions.SOUTH, id: uuidv4() },
    { x: 200, y: 200, dir: Directions.NORTH, id: uuidv4() },
    {
      x: CANVAS_WIDTH - 100,
      y: CANVAS_WIDTH - 100,
      dir: Directions.EAST,
      id: uuidv4()
    },
    {
      x: CANVAS_WIDTH - 200,
      y: CANVAS_WIDTH - 200,
      dir: Directions.WEST,
      id: uuidv4()
    }
  ],
  bullets: [],
  settings: { ricochet: false }
};

/**
 * Is what is commonly known a 'reducer', but I don't like the word
 * Is NOT in utils.js, since it manipulates state
 * @param {Object<State>} state
 * @param {Object<Action>} action - contains instructions on how to make next state
 * @returns {Object<Hero, number, Array<Snipe>, Array<Unit>, Array<Bullet>>} next state
 */
const makeNextState = (state = defaultState, action) => {
  if (MOVE_BULLETS_CMD === action.type) {
    const updatedBullets = state.bullets.map(bullet => {
      if (typeof bullet !== "undefined" && bullet !== null) {
        let nextPoint = createNextPoint(
          bullet.dir,
          /** @type Point */ { x: bullet.x, y: bullet.y },
          PX_PER_MOVE
        );
        if (
          !isCollision(state.hero, bullet, HERO_SIZE) &&
          !isCollisions(state.snipes, bullet, SNIPE_SIZE)
        ) {
          let correctedUnit = state.settings.ricochet
            ? correctUnitBeyondBorderPosition(
                { ...bullet, ...nextPoint },
                BULLET_SIZE,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
              )
            : correctUnitForBorderImpact(
                { ...bullet, ...nextPoint },
                BULLET_SIZE,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
              );
          let finalBullet = {
            ...bullet,
            ...nextPoint,
            ...correctedUnit
          };
          if (finalBullet.x > 0 && finalBullet.y > 0) {
            return finalBullet;
          }
        }
      }
    });
    // TODO figure out what to do if hero is killed
    const updatedHero = isCollisions(state.bullets, state.hero, HERO_SIZE)
      ? { ...state.hero, x: -1000, y: -1000 }
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
          let nextPoint = createNextPoint(
            snipe.dir,
            /** @type Point */ { x: snipe.x, y: snipe.y },
            PX_PER_MOVE
          );
          if (
            isCollision(state.hero, nextPoint, HERO_SIZE * 2) ||
            isCollisions(state.snipes, nextPoint, SNIPE_SIZE * 2)
          ) {
            nextPoint = { x: snipe.x, y: snipe.y }; // TODO makePoint(snipe);
          }

          return /** @type Snipe */ {
            ...snipe,
            ...nextPoint,
            ...correctUnitBeyondBorderPosition(
              /** @type Snipe */ { ...snipe, ...nextPoint },
              SNIPE_SIZE,
              CANVAS_WIDTH,
              CANVAS_HEIGHT
            )
          };
        }
      }
    );
    const updatedBullets = /** @type Array<Unit> */ [...state.bullets];
    // scan circle of terror and when a hero is in it: 1. decide which dir hero is, 2. shoot in dir
    state.snipes.map(_snipe => {
      if (state.nrOfMoves % 8 === 0) {
        let dir = getDirBetween(_snipe, state.hero);
        if (dir) {
          console.log("SNIPE saw hero");
          updatedBullets.push(makeBullet(_snipe, 20, dir));
        }
      }
    });
    state.nrOfMoves++;
    return { ...state, snipes: updatedSnipes, bullets: updatedBullets };
  }
  if (MOVE_HERO_CMD === action.type) {
    const prevPoint = /** @type Point */ { x: state.hero.x, y: state.hero.y };
    const nextPoint = createNextPoint(action.dir, prevPoint, PX_PER_MOVE);
    const updatedHero = moveHero(
      state.hero,
      state.snipes,
      prevPoint,
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
  return state;
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  }

  componentDidMount() {
    window.addEventListener("keydown", this.keyDownHandler, false);
    setInterval(() => {
      this.setState(
        makeNextState(makeNextState(this.state, { type: MOVE_BULLETS_CMD }), {
          type: MOVE_SNIPES_CMD
        })
      );
    }, INTERVAL_BETWEEN_MOVES_MS);
  }

  keyDownHandler = evt => {
    // TODO isShootKey(keyCode)
    if (evt.keyCode > 40) {
      this.setState(
        makeNextState(this.state, {
          type: HERO_SHOOT_CMD,
          shootDir: keyMap[evt.keyCode]
        })
      );
    } else {
      this.setState(
        makeNextState(this.state, {
          type: MOVE_HERO_CMD,
          dir: keyMap[evt.keyCode]
        })
      );
    }
  };

  // .filter(bullet => typeof bullet !== "undefined" && bullet.dir)
  render() {
    return (
      <Fragment>
        <Canvas
          hero={this.state.hero}
          snipes={this.state.snipes}
          bullets={this.state.bullets}
        />
        <article id={"control-panel"}>
          <button
            onClick={() => {
              this.setState(
                makeNextState(this.state, {
                  type: TOGGLE_RICOCHET_CMD
                })
              );
            }}
          >
            toggle ricochet
          </button>
          <div>
            Hero: {this.state.hero.x}, {this.state.hero.y},{" "}
            {this.state.hero.dir}
          </div>
          {this.state.snipes.map((snipe, i) => {
            return typeof snipe !== "undefined" && snipe !== null ? (
              <div key={i}>
                snipe {i}: {snipe.x}, {snipe.y}, {snipe.dir}
              </div>
            ) : null;
          })}

          {this.state.bullets.map((bullet, i) => {
            return typeof bullet !== "undefined" && bullet !== null ? (
              <div key={i}>
                bullet {i}: {bullet.x}, {bullet.y}, {bullet.dir}
              </div>
            ) : null;
          })}
        </article>
      </Fragment>
    );
  }
}

export default App;
