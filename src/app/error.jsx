"use client";

import styled from "styled-components";

export default function Error({ error }) {
  console.error(error);

  return (
    <ErrorContainer>
      <img src="/404Image.gif" alt="" />
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error?.message}</i>
      </p>
    </ErrorContainer>
  );
}

const ErrorContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  img {
    width: 100%;
    max-width: 600px;
  }

  h1 {
    gap: 0.5rem;
    font-size: 2rem;
  }
`;
