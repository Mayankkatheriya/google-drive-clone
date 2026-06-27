"use client";

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUserLoginDetails, selectUserName } from "../../store/UserSlice";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import AuthSplash from "../common/AuthSplash";
import DiskDriveLogo from "../common/DiskDriveLogo";

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const BENEFITS = [
  {
    icon: CloudUploadOutlinedIcon,
    accent: "#60a5fa",
    title: "Upload in seconds",
    desc: "Drag and drop anywhere, or tap New to add files.",
  },
  {
    icon: DevicesOutlinedIcon,
    accent: "#a78bfa",
    title: "Works on any device",
    desc: "Open your drive on desktop or mobile — same files, everywhere.",
  },
  {
    icon: LockOutlinedIcon,
    accent: "#34d399",
    title: "Private by default",
    desc: "Only you can access your files. Shared links expire automatically.",
  },
];

const SIGNIN_POINTS = [
  { icon: VisibilityOutlinedIcon, text: "Preview files in your browser" },
  { icon: VpnKeyOutlinedIcon, text: "No extra password to remember" },
  { icon: ShieldOutlinedIcon, text: "Your files stay private" },
];

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { authReady } = useAuth();
  const userName = useSelector(selectUserName);
  const [loading, setLoading] = useState(false);

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  useEffect(() => {
    if (authReady && userName) {
      router.replace("/home");
    }
  }, [authReady, userName, router]);

  const handleAuth = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authReady || userName) {
    return <AuthSplash variant="login" />;
  }

  return (
    <Page>
      <Orb1 />
      <Orb2 />
      <Grid />
      <Noise />

      <Nav>
        <LogoRow>
          <DiskDriveLogo size={34} />
          <LogoName>Disk Drive</LogoName>
        </LogoRow>
        <NavTag>Free personal cloud</NavTag>
      </Nav>

      <Content>
        <HeroColumn
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <HeroCopy>
            <Eyebrow>Store · Organize · Open</Eyebrow>
            <HeroTitle>
              All your files.
              <br />
              <GradientText>One drive.</GradientText>
            </HeroTitle>
            <HeroSub>
              Upload, organize, and open files from any device.
            </HeroSub>
          </HeroCopy>

          <BenefitList>
            {BENEFITS.map((benefit, i) => (
              <BenefitCard
                key={benefit.title}
                $accent={benefit.accent}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.08, duration: 0.4 }}
              >
                <BenefitIcon $accent={benefit.accent}>
                  <benefit.icon style={{ fontSize: 20 }} />
                </BenefitIcon>
                <BenefitText>
                  <BenefitTitle>{benefit.title}</BenefitTitle>
                  <BenefitDesc>{benefit.desc}</BenefitDesc>
                </BenefitText>
              </BenefitCard>
            ))}
          </BenefitList>
        </HeroColumn>

        <AuthColumn
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
        >
          <AuthPanel>
            <AuthBlock>
              <AuthEyebrow>Sign in</AuthEyebrow>
              <AuthTitle>
                Continue to <GradientText>Disk Drive</GradientText>
              </AuthTitle>
              <AuthSub>
                Use your Google account — one tap and your personal drive is ready.
              </AuthSub>

              <GoogleBtn onClick={handleAuth} disabled={loading} $loading={loading}>
                {loading ? <Spinner /> : <GoogleG />}
                {loading ? "Signing in…" : "Continue with Google"}
              </GoogleBtn>

              <SignInList>
                {SIGNIN_POINTS.map((point) => (
                  <SignInItem key={point.text}>
                    <SignInIcon>
                      <point.icon style={{ fontSize: 16 }} />
                    </SignInIcon>
                    <span>{point.text}</span>
                  </SignInItem>
                ))}
              </SignInList>
            </AuthBlock>

            <AuthFooter>
              Made with{" "}
              <FavoriteIcon style={{ fontSize: 13, color: "#fb7185" }} /> by{" "}
              <a
                href="https://www.linkedin.com/in/mayank-gupta-752328173/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mayank Gupta
              </a>
            </AuthFooter>
          </AuthPanel>
        </AuthColumn>
      </Content>
    </Page>
  );
};

const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(36px, -48px) scale(1.06); }
`;
const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 32px) scale(0.96); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Page = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #04070f;
`;

const Orb1 = styled.div`
  position: absolute;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.32) 0%, transparent 68%);
  top: -200px;
  left: -160px;
  animation: ${float1} 16s ease-in-out infinite;
  pointer-events: none;
`;

const Orb2 = styled.div`
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.26) 0%, transparent 68%);
  bottom: -180px;
  right: -100px;
  animation: ${float2} 18s ease-in-out infinite;
  pointer-events: none;
`;

const Grid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse 85% 75% at 50% 40%, black 15%, transparent 100%);
  pointer-events: none;
`;

const Noise = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
`;

const Nav = styled.nav`
  position: relative;
  z-index: 20;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 900px) {
    padding: 18px 40px;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoName = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.4px;
`;

const NavTag = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);

  @media (max-width: 480px) {
    display: none;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 0 20px 20px;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
    padding: 0 40px 24px;
  }
`;

const HeroColumn = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;

  @media (max-width: 899px) {
    flex: 0;
    gap: 0.5rem;
  }
`;

const HeroCopy = styled.div`
  text-align: center;

  @media (min-width: 900px) {
    text-align: left;
  }
`;

const Eyebrow = styled.span`
  display: none;
  align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.2);
  margin-bottom: 1rem;

  @media (min-width: 900px) {
    display: inline-flex;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.65rem, 5vw, 2.65rem);
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -1px;
  line-height: 1.12;
  margin-bottom: 0.6rem;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 55%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSub = styled.p`
  font-size: 0.92rem;
  color: #94a3b8;
  line-height: 1.55;
  max-width: 420px;
  margin: 0 auto;

  @media (min-width: 900px) {
    font-size: 1rem;
    margin: 0;
  }
`;

const BenefitList = styled.div`
  display: none;
  flex-direction: column;
  gap: 10px;
  max-width: 480px;

  @media (min-width: 900px) {
    display: flex;
  }
`;

const BenefitCard = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 3px solid ${(p) => p.$accent};
  backdrop-filter: blur(10px);
  text-align: left;
`;

const BenefitIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: ${(p) => `${p.$accent}18`};
  color: ${(p) => p.$accent};
`;

const BenefitText = styled.div`
  min-width: 0;
  padding-top: 2px;
`;

const BenefitTitle = styled.p`
  font-size: 0.88rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
`;

const BenefitDesc = styled.p`
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
`;

const AuthColumn = styled(motion.div)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;

  @media (min-width: 900px) {
    flex: 0 0 400px;
    justify-content: flex-end;
    align-self: center;
  }
`;

const AuthPanel = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AuthBlock = styled.div`
  padding: 28px 24px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid #60a5fa;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);

  @media (max-width: 899px) {
    text-align: center;
  }

  @media (min-width: 900px) {
    padding: 32px 28px 28px;
  }
`;

const AuthEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.2);
  margin-bottom: 1rem;

  @media (max-width: 899px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const AuthTitle = styled.h2`
  font-size: clamp(1.45rem, 3vw, 1.75rem);
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.6px;
  line-height: 1.2;
  margin-bottom: 10px;
`;

const AuthSub = styled.p`
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 22px;
  max-width: 320px;

  @media (max-width: 899px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const GoogleBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  cursor: ${(p) => (p.$loading ? "wait" : "pointer")};
  opacity: ${(p) => (p.$loading ? 0.85 : 1)};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
    box-shadow: 0 8px 28px rgba(96, 165, 250, 0.28);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: wait;
  }
`;

const Spinner = styled.span`
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const SignInList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  @media (max-width: 899px) {
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    align-items: flex-start;
  }
`;

const SignInItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  text-align: left;
`;

const SignInIcon = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
`;

const AuthFooter = styled.p`
  font-size: 0.76rem;
  color: #64748b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;

  a {
    color: #60a5fa;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Login;
