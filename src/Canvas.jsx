import React from "react";
import PropTypes from "prop-types";

import Snipe from "./Snipe";
import Hero from "./Hero";
import Bullet from "./Bullet";

import { CANVAS_HEIGHT } from "./constants";

const Canvas = props => {
  const viewBox = [0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT];

  return (
    <svg id="game-canvas" viewBox={viewBox}>
      <Hero hero={props.hero} />

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
      dir: PropTypes.string.isRequired
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
      dir: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Canvas;
