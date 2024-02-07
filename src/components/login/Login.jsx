import React from "react";
import styled from "styled-components";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserLoginDetails } from "../../store/UserSlice";

const Login = () => {
  const dispatch = useDispatch();

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error.message);
    }
  };

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  return (
    <Container>
      <Box>
        <img src="drive.svg" alt="" />
        <h3>Google Drive</h3>
        <button onClick={handleAuth}>Get Started</button>
        <div className="text">
          <p>
            A cloud-based storage service that enables users to store and access
            files online
          </p>
          <p>
            Developed with <FavoriteIcon /> by{" "}
            <a
              href="https://www.linkedin.com/in/mayank-gupta-752328173/"
              target="_blank"
            >
              Mayank Gupta
            </a>{" "}
          </p>
        </div>
      </Box>
      <ImageContainer>
        <img src="/login.gif" alt="" />
      </ImageContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
`;

const Box = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* box-shadow: 3px 3px 3px #979797, 5px 5px 5px 5px #bdbdbd; */
  padding: 1rem 2rem;
  border-radius: 10px;

  img {
    width: 80px;
    margin-bottom: 0.5rem;
    margin-top: 2rem;
  }
  h3 {
    margin-bottom: 1rem;
    color: #646464;
  }

  button {
    appearance: button;
    width: 100%;
    max-width: 280px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    margin-bottom: 2rem;
    height: 55px;
    text-align: center;
    border: none;
    background-size: 300% 100%;
    border-radius: 50px;
    moz-transition: all 0.4s ease-in-out;
    -o-transition: all 0.4s ease-in-out;
    -webkit-transition: all 0.4s ease-in-out;
    transition: all 0.4s ease-in-out;
    background-image: linear-gradient(
      to right,
      #25aae1,
      #4481eb,
      #04befe,
      #3f86ed
    );
    box-shadow: 0 4px 15px 0 rgba(65, 132, 234, 0.75);

    &:hover {
      background-position: 100% 0;
      moz-transition: all 0.4s ease-in-out;
      -o-transition: all 0.4s ease-in-out;
      -webkit-transition: all 0.4s ease-in-out;
      transition: all 0.4s ease-in-out;
    }
    &:focus {
      outline: none;
    }
    &:active {
      border-width: 4px 0 0;
    }
  }

  .text {
    margin-top: auto;
    p {
      text-align: center;
      font-weight: 600;
      font-size: 12px;
      color: #646464;
      letter-spacing: 1px;
      margin-bottom: 1rem;

      svg {
        font-size: 14px;
      }
    }
  }

  @media screen and (max-width: 850px) {
    max-width: 100%;
    height: calc(100vh - 100px);
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 800px;
  height: 400px;
  img {
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 850px) {
    display: none;
  }
`;

export default Login;
