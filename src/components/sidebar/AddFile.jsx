// AddFile.js

import React from "react";
import styled from "styled-components";

/**
 * AddFile component for creating a new file.
 * @param {Object} props - Component properties.
 * @param {Function} props.onClick - Click event handler for the button.
 * @returns {JSX.Element} - AddFile component.
 */
const AddFile = ({ onClick }) => {
  return (
    <SidebarBtn>
      <button title="New File" onClick={onClick}>
        <img
          src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22 viewBox=%220 0 36 36%22%3E%3Cpath fill=%22%2334A853%22 d=%22M16 16v14h4V20z%22/%3E%3Cpath fill=%22%234285F4%22 d=%22M30 16H20l-4 4h14z%22/%3E%3Cpath fill=%22%23FBBC05%22 d=%22M6 16v4h10l4-4z%22/%3E%3Cpath fill=%22%23EA4335%22 d=%22M20 16V6h-4v14z%22/%3E%3Cpath fill=%22none%22 d=%22M0 0h36v36H0z%22/%3E%3C/svg%3E"
          alt="Add"
        />
        <span>New</span>
      </button>
    </SidebarBtn>
  );
};

const SidebarBtn = styled.div`
  button {
    background: transparent;
    border: 1px solid lightgray;
    display: flex;
    align-items: center;
    border-radius: 40px;
    padding: 5px 10px;
    box-shadow: 2px 2px 2px #ccc;
    margin-left: 20px;
    span {
      font-size: 16px;
      margin-right: 20px;
      margin-left: 10px;
    }

    @media screen and (max-width: 768px) {
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
      margin-left: 0;

      span {
        display: none;
      }
    }
  }
`;

export default AddFile;
