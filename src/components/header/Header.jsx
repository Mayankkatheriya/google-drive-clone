import React, { useEffect } from "react";
import styled from "styled-components";
import { auth, provider } from "../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import { useNavigate } from "react-router-dom";
import LogoWrapperComponent from "./LogoWrapper";
import SearchBar from "./SearchBar";
import LeftIcons from "./LeftIcons";
import ProfileSection from "./ProfileSection";

const Header = () => {
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const sidebarBool = useSelector(selectSidebarBool);
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
        photo: user.photoURL,
      })
    );
  };

  return (
    <Container>
      <Wrapper>
        <LogoWrapperComponent
          onClick={() => dispatch(setSidebarBool(!sidebarBool))}
          userName={userName}
        />
        {!userName ? (
          <Login onClick={handleAuth}>Login</Login>
        ) : (
          <>
            <SearchBar />
            
            <RightContainer>
              <LeftIcons />
              <ProfileSection
                userPhoto={userPhoto}
                userName={userName}
                handleAuth={handleAuth}
              />
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
  width: 100%;
  top: 0;
  z-index: 999;
  background-color: #ffffff;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 2px 2px 2px #cecece;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 20px;
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

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`;
