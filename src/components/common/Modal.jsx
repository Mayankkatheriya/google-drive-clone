"use client";

import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import linkedInJson from "../lottie/linkedInLottie.json";
import githubJson from "../lottie/githubLottie.json";
import instaJson from "../lottie/instaLottie.json";
import facebookJson from "../lottie/facebookLottie.json";
import closeJson from "../lottie/closeLottie.json";

const HelpModal = ({ openHelp, closeHelpModal }) => {
  return (
    <Modal open={openHelp} onClose={closeHelpModal}>
      <ModalBox>
        <CloseBtn onClick={closeHelpModal}>
          <Lottie loop animationData={closeJson} play style={{ width: 40, height: 40 }} />
        </CloseBtn>

        <ModalTitle>About</ModalTitle>

        <Body>
          <AvatarWrap>
            <img src="/Mayank.png" alt="Mayank Gupta" />
          </AvatarWrap>
          <Name>Mayank Gupta</Name>
          <Role>Full Stack Web Developer</Role>
          <ContactLabel>Connect with me</ContactLabel>
          <Links>
            <SocialLink
              href="https://github.com/Mayankkatheriya"
              target="_blank"
              rel="noopener noreferrer"
              $color="#0f172a"
            >
              <Lottie loop animationData={githubJson} play style={{ width: 44, height: 44 }} />
              <span>Github</span>
            </SocialLink>
            <SocialLink
              href="https://www.linkedin.com/in/mayank-gupta-752328173/"
              target="_blank"
              rel="noopener noreferrer"
              $color="#0077b5"
            >
              <Lottie loop animationData={linkedInJson} play style={{ width: 44, height: 44 }} />
              <span>LinkedIn</span>
            </SocialLink>
            <SocialLink
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              $color="#cc2e96"
            >
              <Lottie loop animationData={instaJson} play style={{ width: 44, height: 44 }} />
              <span>Instagram</span>
            </SocialLink>
            <SocialLink
              href="https://www.facebook.com/mayakkatheriya/"
              target="_blank"
              rel="noopener noreferrer"
              $color="#1197f5"
            >
              <Lottie loop animationData={facebookJson} play style={{ width: 44, height: 44 }} />
              <span>Facebook</span>
            </SocialLink>
          </Links>
        </Body>
      </ModalBox>
    </Modal>
  );
};

const ModalBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  width: 90%;
  max-width: 440px;
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow-lg);
  outline: none;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 20px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AvatarWrap = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
  border: 3px solid var(--border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Name = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
`;

const Role = styled.p`
  font-size: 0.875rem;
  color: var(--text-2);
  margin-bottom: 20px;
`;

const ContactLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
`;

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

const SocialLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: ${(props) => props.$color || "var(--text-1)"};
  font-size: 0.78rem;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  transition: all 0.15s ease;
  min-width: 80px;

  &:hover {
    background: var(--surface-2);
    border-color: var(--border);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
`;

export default HelpModal;
