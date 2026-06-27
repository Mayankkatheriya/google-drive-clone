"use client";

import styled from "styled-components";
import { Bone } from "./Skeleton";

export default function LoginSkeleton() {
  return (
    <Page>
      <Nav>
        <Bone $tone="dark" $w="34px" $h="34px" $radius="10px" $shrink={false} />
        <Bone $tone="dark" $w="96px" $h="18px" $radius="6px" $shrink={false} />
        <Bone $tone="dark" $w="120px" $h="28px" $radius="999px" $shrink={false} />
      </Nav>

      <Content>
        <HeroBlock>
          <Bone $tone="dark" $w="140px" $h="24px" $radius="999px" />
          <Bone $tone="dark" $w="min(320px, 80%)" $h="36px" $radius="8px" />
          <Bone $tone="dark" $w="min(280px, 70%)" $h="36px" $radius="8px" />
          <Bone $tone="dark" $w="min(360px, 85%)" $h="16px" $radius="6px" />
        </HeroBlock>

        <AuthCard>
          <Bone $tone="dark" $w="72px" $h="24px" $radius="999px" />
          <Bone $tone="dark" $w="80%" $h="28px" $radius="8px" />
          <Bone $tone="dark" $w="100%" $h="14px" $radius="6px" />
          <Bone $tone="dark" $w="90%" $h="14px" $radius="6px" />
          <Bone $tone="dark" $h="48px" $radius="12px" />
          {[0, 1, 2].map((i) => (
            <PointRow key={i}>
              <Bone $tone="dark" $w="28px" $h="28px" $radius="8px" $shrink={false} />
              <Bone $tone="dark" $h="14px" $radius="6px" />
            </PointRow>
          ))}
        </AuthCard>
      </Content>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: #04070f;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  flex-shrink: 0;

  @media (min-width: 900px) {
    padding: 18px 40px;
    justify-content: space-between;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0 20px 24px;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
    max-width: 1160px;
    width: 100%;
    margin: 0 auto;
    padding: 0 40px 24px;
  }
`;

const HeroBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 480px;

  @media (min-width: 900px) {
    align-items: flex-start;
  }
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.035);
`;

const PointRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
`;
