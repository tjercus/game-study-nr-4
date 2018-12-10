import React from "react";
import PropTypes from "prop-types";
import { BULLET_SIZE } from "./constants";

const Bullet = props => {
  if (typeof props.bullet !== "undefined" && props.bullet !== null) {
    return (
      <rect
        x={props.bullet.x - (BULLET_SIZE / 2)}
        y={props.bullet.y - (BULLET_SIZE / 2)}
        width={BULLET_SIZE}
        height={BULLET_SIZE}
        stroke="orange"
        fill="red"
        strokeWidth={1}
      />
    );
  }
};

Bullet.propTypes = {
  bullet: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    dir: PropTypes.string.isRequired
  }).isRequired
};

export default Bullet;
