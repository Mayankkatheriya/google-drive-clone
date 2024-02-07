import React from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import Loader from "../../loaders/Loader";

const FileUploadModal = ({
  open,
  setOpen,
  handleUpload,
  uploading,
  handleFile,
}) => {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalPopup>
        <form onSubmit={handleUpload}>
          <ModalHeading>
            <h3>
              {uploading ? "Uploading..." : "Select file you want to upload"}
            </h3>
          </ModalHeading>
          <ModalBody>
            {uploading ? (
              <UploadingPara>
                <Loader />
              </UploadingPara>
            ) : (
              <>
                <input
                  type="file"
                  className="modal__file"
                  onChange={handleFile}
                />
                <input type="submit" className="modal__submit" />
              </>
            )}
          </ModalBody>
        </form>
      </ModalPopup>
    </Modal>
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
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  height: 40px;
`;

const ModalBody = styled.div`
  input.modal__submit {
    width: 100%;
    background: darkmagenta;
    padding: 10px 20px;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 5px;
    font-size: 16px;
    border: 0;
    outline: 0;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
  }
  input.modal__file {
    width: 100%;
    background: whitesmoke;
    padding: 20px;
    color: #000;
    display: block;
    margin-top: 20px;
  }
`;

const UploadingPara = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

export default FileUploadModal;
