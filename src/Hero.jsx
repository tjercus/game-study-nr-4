import React from "react";
import PropTypes from "prop-types";
import { HERO_SIZE } from "./constants";
import { hasValue } from "./utils";

const Hero = props => {
  if (hasValue(props.hero)) {
    return (
      <rect
        x={props.hero.x - HERO_SIZE / 2}
        y={props.hero.y - HERO_SIZE / 2}
        width={HERO_SIZE}
        height={HERO_SIZE}
        stroke="blue"
        fill="blue"
        strokeWidth={HERO_SIZE}
      />
    );
  }
  return null;
};

Hero.propTypes = {
  hero: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired
};

export default Hero;
