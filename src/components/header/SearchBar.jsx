import React from "react";
import styled from "styled-components";
import { SearchIcons } from "../common/SvgIcons";

const SearchBar = () => {
  return (
    <InputContainer>
      <SearchContainer>
        <input type="text" placeholder="Search in Drive" />
        <SearchIcons />
      </SearchContainer>
    </InputContainer>
  );
};

const InputContainer = styled.div`
  flex: 1;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  width: 64%;
  height: 50px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.09);
  border-radius: 30px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 /0.05);

  svg:first-child {
    cursor: pointer;
    margin-left: 10px;
    color: #5f6368;
  }

  input {
    font-size: 16px;
    padding: 0 10px;
    outline: none;
    width: 90%;
    height: 80%;
    font-family: Sans, Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    margin: 0 auto;
    background-color: transparent;
    :focus {
      outline: none;
    }

    border: none;
  }

  svg:last-child {
    cursor: pointer;
    margin-right: 10px;
    color: #5f6368;
  }
`;

export default SearchBar;
