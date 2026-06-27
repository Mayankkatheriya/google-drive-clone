"use client";

import styled from "styled-components";
import { Bone } from "./Skeleton";

const CARDS = 6;

export default function FileGridSkeleton({ compact = false }) {
  return (
    <Grid $compact={compact}>
      {Array.from({ length: CARDS }, (_, i) => (
        <Card key={i}>
          <IconBone $shrink={false} />
          <CardBody>
            <Bone $w={`${70 + (i % 2) * 10}%`} $h="14px" $radius="4px" />
            <CardMeta>
              <TagBone $shrink={false} />
              <Bone $w="42px" $h="10px" $radius="4px" $shrink={false} />
            </CardMeta>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: ${(props) =>
    props.$compact ? "0 0 var(--mobile-scroll-inset)" : "8px 16px var(--mobile-scroll-inset)"};
  scroll-padding-bottom: var(--mobile-scroll-inset);

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 16px;
    padding: ${(props) => (props.$compact ? "0 0 8px" : "20px 24px 28px")};
  }
`;

const Card = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: var(--shadow-sm);

  @media (min-width: 769px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 14px 14px;
  }
`;

const IconBone = styled(Bone)`
  width: 44px;
  height: 44px;
  border-radius: 10px;

  @media (min-width: 769px) {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }
`;

const CardBody = styled.div`
  min-width: 0;
  flex: 1;
  width: 100%;
  overflow: hidden;

  @media (min-width: 769px) {
    padding-right: 28px;
  }
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  min-width: 0;
`;

const TagBone = styled(Bone)`
  width: 34px;
  height: 16px;
  border-radius: 4px;
`;
