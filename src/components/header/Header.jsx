import React, { useEffect } from "react";
import styled from "styled-components";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import FormatAlignCenterOutlinedIcon from "@mui/icons-material/FormatAlignCenterOutlined";
import { auth, provider } from "../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        navigate("/home");
      }
    });
  }, [userName]);

  // Handle user authentication
  const handleAuth = async () => {
    if (!userName) {
      try {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
      } catch (error) {
        console.error(error.message);
      }
    } else if (userName) {
      try {
        await signOut(auth);
        dispatch(setSignOutState());
        navigate("/");
      } catch (error) {
        console.log("Error signing out: ", error.message);
      }
    }
  };

  // Set user details in Redux state
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
      <Wrapper>
        <Logo>
          <img src="./google-logo.png" alt="" />
          <span>Drive</span>
        </Logo>
        {!userName ? (
          <Login onClick={handleAuth}>Login</Login>
        ) : (
          <>
            <InputContainer>
              <SearchContainer>
                <SearchIcon />
                <input type="text" placeholder="Search in Drive" />
                <FormatAlignCenterOutlinedIcon />
              </SearchContainer>
            </InputContainer>

            <RightContainer>
              <LeftSection>
                <HelpOutlineIcon />
                <SettingsOutlinedIcon />
              </LeftSection>
              <RightSection>
                <AppsOutlinedIcon className="app" />
                <SignOut>
                  <UserImg src={userPhoto} alt={userName} />
                  <DropDown>
                    <span onClick={handleAuth}>Sign out</span>
                  </DropDown>
                </SignOut>
              </RightSection>
            </RightContainer>
          </>
        )}
      </Wrapper>
    </Container>
  );
};
export default Header;

const Container = styled.div`
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #ffffff;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
  }

  span {
    font-family: "Product Sans", Arial, sans-serif;
    color: #5f6368;
    font-size: 22px;
    padding-left: 8px;
  }
`;

const Login = styled.a`
  background-color: #fff;
  padding: 8px 16px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 1px solid #353535;
  border-radius: 4px;
  transition: all 0.2s ease 0s;

  &:hover {
    background-color: #353535;
    color: #fff;
    border-color: transparent;
  }
`;

const InputContainer = styled.div`
  flex: 1;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
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

const RightSection = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 35px;
    color: #5f6368;
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: all 200ms ease-out;
    :hover {
      background-color: rgba(0, 0, 0, 0.09);
    }
  }

  .app {
    margin-right: 15px;
  }
`;

const LeftSection = styled(RightSection)`
  margin-right: 40px;

  svg {
    margin: 0 10px;
  }
`;
const UserImg = styled.img`
  height: 100%;

  @media (max-width: 830px) {
    height: 40px;
  }
`;

const DropDown = styled.div`
  position: absolute;
  top: 50px;
  right: -18px;
  background: #fff;
  border: 1px solid rgba(151, 151, 151, 0.34);
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 50%) 0px 0px 18px 0px;
  padding: 10px;
  font-size: 14px;
  letter-spacing: 3px;
  width: 100px;
  opacity: 0;
`;
const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  ${UserImg} {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  &:hover {
    ${DropDown} {
      opacity: 1;
      transition-duration: 1s;
    }
  }
`;
