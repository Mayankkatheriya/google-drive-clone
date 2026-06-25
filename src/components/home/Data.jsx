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
import { Page } from "../common/PageShell";
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
    </Page>
  );
};

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
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 4px;

  @media (max-width: 768px) {
    padding: 8px 16px 12px;
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const SectionLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-3);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

export default Data;
