import React from "react";
import PropTypes from "prop-types";
import { SNIPE_SIZE } from "./constants";
import { hasValue } from "./utils";

// TODO example triangle shape
// <polygon points="200,10 250,190 160,210" cssStyle="fill:lime;stroke:purple;stroke-width:1" />

const Snipe = props => {
  if (hasValue(props.snipe)) {
    return (
      <rect
        x={props.snipe.x - SNIPE_SIZE / 2}
        y={props.snipe.y - SNIPE_SIZE / 2}
        width={SNIPE_SIZE}
        height={SNIPE_SIZE}
        stroke="green"
        fill="green"
        strokeWidth={SNIPE_SIZE}
      />
    );
  }
  return null;
};

Snipe.propTypes = {
  snipe: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    dir: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired.isRequired
  }).isRequired
};

export default Snipe;
