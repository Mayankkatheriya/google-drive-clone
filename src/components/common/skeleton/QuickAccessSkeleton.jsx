"use client";

import styled from "styled-components";
import { Bone } from "./Skeleton";

const TILES = 6;

export default function QuickAccessSkeleton() {
  return (
    <Grid>
      {Array.from({ length: TILES }, (_, i) => (
        <Tile key={i}>
          <IconBone $shrink={false} />
          <TileBody>
            <Bone $w={`${75 + (i % 2) * 8}%`} $h="12px" $radius="4px" />
            <TileMeta>
              <TagBone $shrink={false} />
              <Bone $w="36px" $h="10px" $radius="4px" $shrink={false} />
            </TileMeta>
          </TileBody>
        </Tile>
      ))}
    </Grid>
  );
}

const Grid = styled.div`
  @media (max-width: 768px) {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 0 16px;
    scroll-padding: 0 16px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;

  @media (max-width: 768px) {
    flex: 0 0 148px;
    width: 148px;
    min-width: 148px;
    padding: 12px;
  }

  @media (min-width: 769px) {
    padding: 14px 12px 12px;
  }
`;

const IconBone = styled(Bone)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
`;

const TileBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const TagBone = styled(Bone)`
  width: 30px;
  height: 14px;
  border-radius: 4px;
`;
