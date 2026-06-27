"use client";

import styled from "styled-components";
import { Bone, Circle } from "./Skeleton";
import FileListSkeleton from "./FileListSkeleton";
import QuickAccessSkeleton from "./QuickAccessSkeleton";

export default function AppShellSkeleton() {
  return (
    <Shell>
      <Header>
        <HeaderLeft>
          <Circle $size="36px" />
          <Bone $w="34px" $h="34px" $radius="10px" $shrink={false} />
          <Bone $w="92px" $h="18px" $radius="6px" $shrink={false} />
        </HeaderLeft>
        <SearchBone $h="44px" $radius="12px" />
        <HeaderRight>
          <Circle $size="36px" />
          <Circle $size="36px" />
          <Circle $size="36px" />
        </HeaderRight>
      </Header>

      <Body>
        <Sidebar>
          <Bone $h="44px" $radius="999px" />
          <NavList>
            {[0, 1, 2, 3].map((i) => (
              <NavRow key={i}>
                <Bone $w="20px" $h="20px" $radius="6px" $shrink={false} />
                <Bone $h="14px" $radius="6px" />
              </NavRow>
            ))}
          </NavList>
          <SidebarFoot>
            <Bone $h="36px" $radius="10px" />
            <StorageBlock>
              <Bone $h="10px" $w="70%" $radius="4px" />
              <Bone $h="6px" $radius="999px" />
            </StorageBlock>
          </SidebarFoot>
        </Sidebar>

        <Main>
          <PageTop>
            <TitleBlock>
              <Bone $w="120px" $h="22px" $radius="6px" />
              <Bone $w="min(420px, 70%)" $h="14px" $radius="6px" />
            </TitleBlock>
            <Bone $w="76px" $h="36px" $radius="10px" $shrink={false} />
          </PageTop>

          <QuickSection>
            <SectionLabel>
              <Bone $w="88px" $h="10px" $radius="4px" />
            </SectionLabel>
            <QuickAccessSkeleton />
          </QuickSection>

          <Section>
            <SectionLabel>
              <Bone $w="64px" $h="10px" $radius="4px" />
            </SectionLabel>
            <FileListSkeleton />
          </Section>
        </Main>
      </Body>
    </Shell>
  );
}

const Shell = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-3);
`;

const Header = styled.header`
  flex-shrink: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const SearchBone = styled(Bone)`
  flex: 1;
  max-width: 560px;
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 256px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 14px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 8px rgba(15, 23, 42, 0.04);

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
`;

const NavRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
`;

const SidebarFoot = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StorageBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--surface);

  @media (max-width: 768px) {
    scroll-padding-bottom: var(--mobile-scroll-inset);
  }
`;

const PageTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 12px;

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const Section = styled.div`
  padding: 0 24px;

  &:last-child {
    padding-bottom: 24px;
  }

  @media (max-width: 768px) {
    padding: 0;

    &:last-child {
      padding-bottom: 0;
    }
  }
`;

const QuickSection = styled(Section)`
  padding-top: 4px;
  padding-bottom: 20px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    padding: 8px 0 16px;
    margin-bottom: 4px;
  }
`;

const SectionLabel = styled.div`
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
    padding-left: 16px;
  }
`;
