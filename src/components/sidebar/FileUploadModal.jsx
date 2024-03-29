// FileUploadModal.js
import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";

/**
 * FileUploadModal component for handling file upload.
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Flag to control the modal's open state.
 * @param {Function} props.setOpen - Function to set the modal's open state.
 * @param {Function} props.handleUpload - Function to handle file upload.
 * @param {boolean} props.uploading - Flag indicating whether a file is currently being uploaded.
 * @param {Function} props.handleFile - Function to handle file selection.
 * @returns {JSX.Element} - FileUploadModal component.
 */
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
        <span onClick={() => setOpen(false)}>
          <Lottie
            loop
            animationData={closeJson}
            play
            style={{ width: 40, height: 40 }}
          />
        </span>
        <form onSubmit={handleUpload}>
          <ModalHeading>
            <h3>
              {uploading ? "Uploading..." : "Select file you want to upload"}
            </h3>
          </ModalHeading>
          <ModalBody>
            {uploading ? (
              <UploadingPara>
                <Lottie
                  loop
                  animationData={uploadJson}
                  play
                  style={{ width: 120, height: 120 }}
                />
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
  position: relative;

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
