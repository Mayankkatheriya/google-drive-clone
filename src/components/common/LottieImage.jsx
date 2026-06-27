"use client";

import React, { memo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const LottieImage = ({ imagePath, text1, text2 }) => {
  return (
    <Wrap
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {imagePath && (
        <IllustrationWrap>
          <img src={imagePath} alt="" loading="lazy" decoding="async" />
        </IllustrationWrap>
      )}
      {text1 && <Heading>{text1}</Heading>}
      {text2 && <Sub>{text2}</Sub>}
    </Wrap>
  );
};

const Wrap = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const IllustrationWrap = styled.div`
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;

  img {
    width: 100%;
    height: auto;
    opacity: 0.85;
  }
`;

const Heading = styled.p`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
  margin-bottom: 8px;
`;

const Sub = styled.p`
  font-size: 0.9rem;
  color: var(--text-3);
  line-height: 1.6;
`;

export default memo(LottieImage);
