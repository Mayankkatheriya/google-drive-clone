// Lottie.js

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

/**
 * Lottie component to display an image with accompanying text
 * @param {string} imagePath - Path to the image
 * @param {string} text1 - First line of text
 * @param {string} text2 - Second line of text
 * @returns {JSX.Element} - Rendered Lottie component
 */
const LottieImage = ({ imagePath, text1, text2 }) => {
  return (
    <LottieContainer
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="lottie-image">
        <img src={imagePath} alt="lottie" />
      </div>
      <p className="firstText">{text1}</p>
      <p className="secondText">{text2}</p>
    </LottieContainer>
  );
};

const LottieContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
  text-align: center;

  .lottie-image {
    width: 100%;
    max-width: 400px;

    img {
      width: 100%;
      height: 250px;
    }
  }

  p {
    width: 100%;
    max-width: 600px;
  }

  .firstText {
    font-size: 1.5rem;
    line-height: 2rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #3c4043;
  }

  .secondText {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.00625em;
    margin-bottom: 1rem;
    color: #444746;
  }
`;

export default LottieImage;
