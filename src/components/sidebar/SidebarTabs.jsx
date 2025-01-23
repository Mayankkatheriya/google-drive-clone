import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
  CloudQueueIcons,
  HelpIcon,
} from "../common/SvgIcons";
import { Modal } from "@mui/material";
import { NavLink } from "react-router-dom";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { changeBytes } from "../common/common";
import HelpModal from "../common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import Lottie from "react-lottie-player";
import closeJson from "../lottie/closeLottie.json";

const SidebarTabs = () => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [storage, setStorage] = useState("");
  const [size, setSize] = useState("");
  const [openStorageModal, setOpenStorageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, (newFiles) => {
          setFiles(newFiles);
        });

        return () => {
          unsubscribeFiles();
        };
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sizes = files?.reduce((sum, file) => sum + file.data.size, 0);
    setSize(sizes);
    const storageSize = changeBytes(sizes);
    setStorage(storageSize);
  }, [files]);

  return (
    <>
      <SidebarOptions>
        <NavLink to={"/home"}>
          {({ isActive }) => (
            <SidebarOption
              title="My Drive"
              className={isActive ? "tab-active" : ""}
            >
              <MobileScreenShareIcon />
              <span>My Drive</span>
            </SidebarOption>
          )}
        </NavLink>

        {/* Recent */}
        <NavLink to={"/recent"}>
          {({ isActive }) => (
            <SidebarOption
              to={"/recent"}
              className={isActive ? "tab-active" : ""}
              title="Recent"
            >
              <QueryBuilderIcon />
              <span>Recent</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/starred"}>
          {({ isActive }) => (
            <SidebarOption
              title="Starred"
              className={isActive ? "tab-active" : ""}
            >
              <StarBorderIcon />
              <span>Starred</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/trash"}>
          {({ isActive }) => (
            <SidebarOption
              title="Trash"
              className={isActive ? "tab-active" : ""}
            >
              <DeleteOutlineIcon />
              <span>Trash</span>
            </SidebarOption>
          )}
        </NavLink>

        <hr />

        <SidebarOption
          title="Help"
          onClick={() => dispatch(setHelpModal(true))}
        >
          <HelpIcon />
          <span>Help</span>
        </SidebarOption>

        <SidebarOption
          title={`${storage} of 5 GB used`}
          onClick={() => setOpenStorageModal(true)}
        >
          <CloudQueueIcons />
          <span>Storage</span>
        </SidebarOption>
      </SidebarOptions>

      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />

      <Modal open={openStorageModal} onClose={() => setOpenStorageModal(false)}>
        <ModalPopup>
          <span onClick={() => setOpenStorageModal(false)}>
            <Lottie
              loop
              animationData={closeJson}
              play
              style={{ width: 40, height: 40 }}
            />
          </span>
          <ModalHeading>
            <h3>Storage</h3>
          </ModalHeading>
          <ModalBody>
            <div className="progress_bar">
              <progress size="tiny" value={size} max={15000000000} />
              <p>{storage} of 15 GB used</p>
            </div>
          </ModalBody>
        </ModalPopup>
      </Modal>
    </>
  );
};

const ModalPopup = styled.div`
  top: 50%;
  background-color: #fff;
  width: 100%;
  max-width: 500px;
  margin: 0px auto;
  position: relative;
  transform: translateY(-50%);
  padding: 10px;
  border-radius: 10px;

  span {
    position: absolute;
    right: 10px;
    top: 8px;
    cursor: pointer;
    color: #5f6368;
  }
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  height: 40px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .progress_bar {
    width: 100%;
    padding: 1rem 20px;

    progress {
      width: 100%;
      padding: 1rem 0;
    }

    p {
      display: block;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }
  }
`;

const SidebarOptions = styled.div`
  margin-top: 10px;

  a {
    text-decoration: none;
  }

  .tab-active {
    background: #cacaca;
  }
`;

const SidebarOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 0px 20px 20px 0px;
  &:hover {
    background: #eeeeee;
    cursor: pointer;
  }
  svg.MuiSvgIcon-root {
    color: rgb(78, 78, 78);
  }
  span {
    margin-left: 15px;
    font-size: 13px;
    font-weight: 500;
    color: rgb(78, 78, 78);

    @media screen and (max-width: 768px) {
      display: none;
    }
  }
`;

export default SidebarTabs;
