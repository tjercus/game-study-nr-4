import React, { Component, Fragment } from "react";
import Canvas from "./Canvas";
import "./App.css";
import { makeNextState } from "./reducer";
import { hasValue, isShootKey } from "./utils";
import {
  CANVAS_WIDTH,
  Directions,
  INTERVAL_BETWEEN_MOVES_MS,
  keyMap,
  MOVE_SNIPES_CMD,
  MOVE_HERO_CMD,
  HERO_SHOOT_CMD,
  MOVE_BULLETS_CMD,
  CREATE_WALLS_CMD,
  CHANGE_SETTING_CMD
} from "./constants";
import uuidv4 from "uuid/v4";

/**
 *
 * @type State
 */
const defaultState = {
  bullets: [],
  hero: {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_WIDTH / 2,
    id: uuidv4()
  },
  nrOfMoves: 0,
  settings: { ricochet: false, snipesMayShoot: false },
  snipes: [
    { x: 110, y: 110, dir: Directions.SOUTH, id: uuidv4() },
    { x: 220, y: 220, dir: Directions.NORTH, id: uuidv4() },
    {
      x: CANVAS_WIDTH - 120,
      y: CANVAS_WIDTH - 120,
      dir: Directions.EAST,
      id: uuidv4()
    },
    {
      x: CANVAS_WIDTH - 220,
      y: CANVAS_WIDTH - 220,
      dir: Directions.WEST,
      id: uuidv4()
    }
  ],
  walls: [], // for svg painting
  wallPoints: [] // for collision detection
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  }

  componentDidMount() {
    this.setState(makeNextState(this.state, { type: CREATE_WALLS_CMD }));
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
    if (isShootKey(evt.keyCode)) {
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

  printHeroInfo = hero =>
    hasValue(hero) ? (
      <div>
        Hero: {hero.x}, {hero.y}, {hero.dir}
      </div>
    ) : (
      <div>Hero: dead</div>
    );

  render() {
    return (
      <Fragment>
        <Canvas
          walls={this.state.walls}
          hero={this.state.hero}
          snipes={this.state.snipes}
          bullets={this.state.bullets}
        />
        <article id={"control-panel"}>
          <button
            onClick={() => {
              this.setState(
                makeNextState(this.state, {
                  type: CHANGE_SETTING_CMD,
                  settingKey: "ricochet",
                  settingValue: !this.state.settings.ricochet
                })
              );
            }}
          >
            toggle ricochet
          </button>
          <button
            onClick={() => {
              this.setState(
                makeNextState(this.state, {
                  type: CHANGE_SETTING_CMD,
                  settingKey: "snipesMayShoot",
                  settingValue: !this.state.settings.snipesMayShoot
                })
              );
            }}
          >
            toggle snipes may shoot
          </button>

          {this.printHeroInfo(this.state.hero)}

          {this.state.snipes.map((snipe, i) => {
            return hasValue(snipe) ? (
              <div key={i}>
                snipe {i}: {snipe.x}, {snipe.y}, {snipe.dir}
              </div>
            ) : null;
          })}

          {this.state.bullets.map((bullet, i) => {
            return hasValue(bullet) ? (
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
