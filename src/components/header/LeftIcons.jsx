import React from "react";
import styled from "styled-components";
import { SettingsIcon, HelpIcon } from "../common/SvgIcons";

const LeftIcons = () => {
  return (
    <LeftSection>
      <HelpIcon />
      <SettingsIcon />
    </LeftSection>
  );
};

const LeftSection = styled.div`
  margin-right: 40px;
  display: flex;
  align-items: center;

  svg {
    font-size: 35px;
    color: #5f6368;
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: all 200ms ease-out;
    margin: 0 10px;
    :hover {
      background-color: rgba(0, 0, 0, 0.09);
    }
  }

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export default LeftIcons;
