import React from "react";
import PropTypes from "prop-types";

import Snipe from "./Snipe";
import Hero from "./Hero";
import Bullet from "./Bullet";

import { CANVAS_HEIGHT } from "./constants";
import Wall from "./Wall";

const Canvas = props => {
  const viewBox = [0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT];

  return (
    <svg id="game-canvas" viewBox={viewBox}>
      <Hero hero={props.hero} />

      {props.walls.map(wall =>
        typeof wall !== "undefined" && wall !== null ? (
          <Wall wall={wall} key={wall.x1 + "-" + wall.y1 + "-" + wall.x2 + "-" + wall.y2} />
        ) : null
      )}

      {props.bullets.map(bullet =>
        typeof bullet !== "undefined" && bullet !== null ? (
          <Bullet bullet={bullet} key={bullet.id} />
        ) : null
      )}

      {props.snipes.map(snipe =>
        typeof snipe !== "undefined" && snipe !== null ? (
          <Snipe snipe={snipe} key={snipe.id} />
        ) : null
      )}
    </svg>
  );
};

Canvas.propTypes = {
  bullets: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      dir: PropTypes.string.isRequired.isRequired,
      id: PropTypes.string.isRequired.isRequired,
    })
  ).isRequired,
  hero: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  snipes: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      dir: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired.isRequired,
    })
  ).isRequired,
  walls: PropTypes.arrayOf(
    PropTypes.shape({
      x1: PropTypes.number.isRequired,
      y1: PropTypes.number.isRequired,
      x2: PropTypes.number.isRequired,
      y2: PropTypes.number.isRequired
    })
  )
};

export default Canvas;
