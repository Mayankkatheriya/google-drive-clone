"use client";

import styled from "styled-components";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { postTrashCollection } from "../common/firebaseApi";
import { useMyFiles } from "@/context/FilesContext";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";
import { toast } from "react-toastify";

const Data = () => {
  const files = useMyFiles();
  const [optionsVisible, setOptionsVisible] = useState(null);

  const handleDelete = async (id, data) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to move this file to trash?"
      );
      if (confirmed) {
        const docRef = doc(db, "myfiles", id);
        await postTrashCollection(data);
        await deleteDoc(docRef);
        toast.warn("File moved to trash");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setOptionsVisible(null);
    }
  };

  const handleOptionsClick = (id) => {
    setOptionsVisible((prev) => (prev === id ? null : id));
  };

  return (
    <Page>
      <ContentCard>
        <PageHeader pageTitle="My Drive" />

        {files.length > 0 && (
          <QuickSection>
            <SectionLabel>Quick Access</SectionLabel>
            <RecentDataGrid files={files} />
          </QuickSection>
        )}

        <Section>
          {files.length > 0 && <SectionLabel>All Files</SectionLabel>}
          <MainData
            files={files}
            handleOptionsClick={handleOptionsClick}
            optionsVisible={optionsVisible}
            handleDelete={handleDelete}
          />
        </Section>
      </ContentCard>
    </Page>
  );
};

const Page = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 16px 16px 16px 0;

  @media (max-width: 768px) {
    padding: 8px 8px 12px 0;
  }
`;

const ContentCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  min-height: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
`;

const Section = styled.div`
  padding: 16px 20px 0;

  &:last-child {
    padding-bottom: 20px;
  }
`;

/* Quick Access section hides entirely on mobile (the grid cards are also hidden) */
const QuickSection = styled(Section)`
  @media (max-width: 640px) {
    display: none;
  }
`;

const SectionLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-3);
  margin-bottom: 12px;
`;

export default Data;
