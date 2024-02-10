// SearchBar.js

import React, { useState } from "react";
import styled from "styled-components";
import { SearchIcons } from "../common/SvgIcons";
import { useNavigate } from "react-router-dom";

/**
 * SearchBar component provides a search input to search files in Drive.
 * @returns {JSX.Element} - SearchBar component.
 */
const SearchBar = () => {
  const [searchQuery, setQuery] = useState("");
  const navigate = useNavigate();

  /**
   * Handles key press event in the search input.
   * If Enter key is pressed and the search query is not empty, it navigates to the search results page.
   * @param {Object} e - Event object.
   */
  const handleSearchByInput = (e) => {
    if (e.key === "Enter" && searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setQuery("");
    }
  };

  /**
   * Handles the search button click.
   * If the search query is not empty, it navigates to the search results page.
   */
  const handleSearch = () => {
    if (searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setQuery("");
    }
  };

  return (
    <InputContainer>
      <SearchContainer>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleSearchByInput}
          placeholder="Search in Drive"
        />
        <span onClick={handleSearch}>
          <SearchIcons />
        </span>
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
  span {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  svg:last-child {
    cursor: pointer;
    margin-right: 10px;
    color: #5f6368;
  }
`;

export default SearchBar;
