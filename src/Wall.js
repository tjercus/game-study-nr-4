import React from "react";
import PropTypes from "prop-types";
import {WALL_SIZE} from "./constants";

const Wall = props => {
  if (typeof props.wall !== "undefined" && props.wall !== null) {
    return (
      <line
        x1={props.wall.x1}
        y1={props.wall.y1}
        x2={props.wall.x2}
        y2={props.wall.y2}
        stroke="blue"
        strokeWidth={WALL_SIZE}
      />
    );
  }
};

Wall.propTypes = {
  wall: PropTypes.shape({
    x1: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
  }).isRequired
};

export default Wall;
