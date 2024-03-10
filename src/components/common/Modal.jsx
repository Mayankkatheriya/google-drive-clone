import React from "react";
import styled from "styled-components";
import {
  GitIcon,
  FacebookIcon,
  InstaIcon,
  LinkedIcon,
  CloseButton,
} from "./SvgIcons";
import { Modal } from "@mui/material";

const HelpModal = ({ openHelp, closeHelpModal }) => {
  return (
    <Modal open={openHelp} onClose={closeHelpModal}>
      <ModalPopup>
        <span onClick={closeHelpModal}>
          <CloseButton />
        </span>
        <ModalHeading>
          <h3>Need Help?</h3>
        </ModalHeading>
        <ModalBody>
          <div className="image">
            <img src="/myimg.png" alt="" />
          </div>
          <h2>Mayank Gupta</h2>
          <h4>Full Stack Web Developer</h4>
          <p>Contact Me:</p>
          <div className="links">
            <a
              href="https://github.com/Mayankkatheriya"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitIcon />
              Github
            </a>
            <a
              href="https://www.linkedin.com/in/mayank-gupta-752328173/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedIcon />
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstaIcon />
              Instagram
            </a>
            <a
              href="https://www.facebook.com/mayakkatheriya/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
              Facebook
            </a>
          </div>
        </ModalBody>
      </ModalPopup>
    </Modal>
  );
};

const ModalPopup = styled.div`
  top: 50%;
  background-color: #fff;
  width: 100%;
  max-width: 500px;
  margin: 0px auto;
  position: relative;
  transform: translateY(-50%);
  padding: 10px;
  border-radius: 10px;

  span {
    position: absolute;
    right: 10px;
    top: 8px;
    cursor: pointer;
    color: #5f6368;
  }
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  height: 40px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .image {
    width: 100%;
    max-width: 150px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      height: 100%;
      width: 100%;
    }
  }
  h4 {
    margin-bottom: 1rem;
    color: #6b6b6b;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }

  p {
    margin-bottom: 0.5rem;
    text-decoration: underline;
  }

  .links {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    a {
      display: flex;
      align-items: center;
      gap: 5px;

      &:nth-child(1) {
        color: #000;
      }

      &:nth-child(2) {
        color: #0077b5;
      }

      &:nth-child(3) {
        color: #cc2e96;
      }

      &:nth-child(4) {
        color: #1197f5;
      }
    }
  }
`;

export default HelpModal;
