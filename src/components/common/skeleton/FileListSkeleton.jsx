"use client";

import styled from "styled-components";
import { Bone } from "./Skeleton";

const ROWS = 7;

export default function FileListSkeleton() {
  return (
    <TableWrap>
      <TableHead>
        <NameCol>
          <Bone $w="36px" $h="10px" $radius="4px" />
        </NameCol>
        <SizeCol className="hide-sm">
          <Bone $w="28px" $h="10px" $radius="4px" />
        </SizeCol>
        <DateCol className="hide-md">
          <Bone $w="52px" $h="10px" $radius="4px" />
        </DateCol>
        <ActionsCol />
      </TableHead>

      {Array.from({ length: ROWS }, (_, i) => (
        <Row key={i}>
          <NameCol>
            <StarBone $shrink={false} />
            <FileInfo>
              <IconBone $shrink={false} />
              <NameBlock>
                <Bone $w={`${48 + (i % 3) * 12}%`} $h="14px" $radius="4px" />
                <MobileMetaBone $w="62%" $h="10px" $radius="4px" />
              </NameBlock>
            </FileInfo>
          </NameCol>
          <SizeCol className="hide-sm">
            <Bone $w="48px" $h="12px" $radius="4px" />
          </SizeCol>
          <DateCol className="hide-md">
            <Bone $w="96px" $h="12px" $radius="4px" />
          </DateCol>
          <ActionsCol>
            <DesktopActions className="hide-mobile-actions">
              {[0, 1, 2, 3, 4].map((j) => (
                <ActionBone key={j} $shrink={false} />
              ))}
            </DesktopActions>
            <MobileActionBone className="show-mobile-actions" $shrink={false} />
          </ActionsCol>
        </Row>
      ))}
    </TableWrap>
  );
}

const NameCol = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const SizeCol = styled.div`
  flex: 0 0 88px;
  display: flex;
  align-items: center;
`;

const DateCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const ActionsCol = styled.div`
  flex: 0 0 188px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  position: relative;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    align-self: center;
    margin-left: 4px;
  }
`;

const TableWrap = styled.div`
  width: 100%;
  padding-bottom: 24px;

  .hide-sm {
    @media (max-width: 640px) {
      display: none !important;
    }
  }

  .hide-md {
    @media (max-width: 900px) {
      display: none !important;
    }
  }

  .hide-mobile-actions {
    @media (max-width: 768px) {
      display: none !important;
    }
  }

  .show-mobile-actions {
    display: none !important;

    @media (max-width: 768px) {
      display: block !important;
    }
  }

  @media (max-width: 768px) {
    padding-bottom: var(--mobile-scroll-inset);
    scroll-padding-bottom: var(--mobile-scroll-inset);
  }
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 4px;
  height: 34px;
  border-bottom: 1px solid var(--border-light);
  margin: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 4px;
  height: 52px;
  border-radius: 10px;
  margin: 1px 0;

  @media (max-width: 768px) {
    align-items: flex-start;
    height: auto;
    min-height: 64px;
    padding: 12px 12px 12px 8px;
    margin: 0;
    border-radius: 0;
    border-bottom: 1px solid var(--border-light);
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const StarBone = styled(Bone)`
  width: 30px;
  height: 30px;
  border-radius: 50%;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    margin-top: 2px;
  }
`;

const IconBone = styled(Bone)`
  width: 34px;
  height: 34px;
  border-radius: 9px;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`;

const NameBlock = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MobileMetaBone = styled(Bone)`
  display: none;

  @media (max-width: 768px) {
    display: block;
    margin-top: 4px;
  }
`;

const DesktopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ActionBone = styled(Bone)`
  width: 34px;
  height: 34px;
  border-radius: 8px;
`;

const MobileActionBone = styled(Bone)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;
