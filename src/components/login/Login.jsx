"use client";
import React from "react";
import styled, { keyframes } from "styled-components";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserLoginDetails } from "../../store/UserSlice";
import { motion } from "framer-motion";

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const dispatch = useDispatch();

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error.message);
    }
  };

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  return (
    <Page>
      {/* Animated gradient orbs */}
      <Orb1 />
      <Orb2 />
      <Orb3 />
      <Grid />

      <Card
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <LogoRow>
          <LogoImg src="/google-logo.png" alt="Drive" />
          <LogoName>Disk Drive</LogoName>
        </LogoRow>

        <Headline>Your personal cloud.</Headline>
        <Sub>Secure, private file storage powered by AWS S3 &amp; CloudFront.</Sub>

        <GoogleBtn onClick={handleAuth}>
          <GoogleG />
          Continue with Google
        </GoogleBtn>

        <FeatureRow>
          <Feature>
            <StorageOutlinedIcon style={{ fontSize: 16 }} />
            AWS S3
          </Feature>
          <Feature>
            <BoltOutlinedIcon style={{ fontSize: 16 }} />
            CloudFront CDN
          </Feature>
          <Feature>
            <LockOutlinedIcon style={{ fontSize: 16 }} />
            Private URLs
          </Feature>
        </FeatureRow>

        <Divider />

        <Footer>
          Made with <FavoriteIcon style={{ fontSize: 13, color: "#e11d48", verticalAlign: "middle" }} /> by{" "}
          <a
            href="https://www.linkedin.com/in/mayank-gupta-752328173/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mayank Gupta
          </a>
        </Footer>
      </Card>
    </Page>
  );
};

/* ─────── animations ─────── */
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -60px) scale(1.1); }
`;
const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-50px, 40px) scale(0.95); }
`;
const float3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, 50px) scale(1.08); }
`;

/* ─────── styled components ─────── */
const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #060b18;
  padding: 2rem 1.25rem;
`;

const Orb1 = styled.div`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.5) 0%, transparent 70%);
  top: -200px;
  left: -150px;
  animation: ${float1} 12s ease-in-out infinite;
  pointer-events: none;
`;

const Orb2 = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, transparent 70%);
  bottom: -180px;
  right: -100px;
  animation: ${float2} 15s ease-in-out infinite;
  pointer-events: none;
`;

const Orb3 = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
  top: 50%;
  left: 60%;
  animation: ${float3} 10s ease-in-out infinite;
  pointer-events: none;
`;

const Grid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
`;

const Card = styled(motion.div)`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 44px 36px 32px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 32px 80px rgba(0, 0, 0, 0.5),
    0 8px 32px rgba(37, 99, 235, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 480px) {
    padding: 36px 24px 28px;
    border-radius: 20px;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
`;

const LogoImg = styled.img`
  width: 40px;
  height: 40px;
`;

const LogoName = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
`;

const Headline = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
  text-align: center;
  margin-bottom: 10px;
  line-height: 1.15;
`;

const Sub = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 320px;
`;

const GoogleBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 15px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  margin-bottom: 20px;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.18);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  }
`;

const FeatureRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 24px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8faff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;

  svg { color: #2563eb; }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #f1f5f9;
  margin-bottom: 18px;
`;

const Footer = styled.p`
  font-size: 0.78rem;
  color: #94a3b8;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;

  a {
    color: #2563eb;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

export default Login;
