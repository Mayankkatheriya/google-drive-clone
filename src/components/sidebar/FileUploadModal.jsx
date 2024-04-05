// FileUploadModal.js
import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";
import { UploadFileIcon } from "../common/SvgIcons";

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
  selectedFile
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
                <div className="modal__file">
                  <p>{selectedFile ? selectedFile : "No file chosen"}</p>
                  <label htmlFor="file">
                    <UploadFileIcon /> Choose a file
                  </label>
                  <input id="file" type="file" onChange={handleFile} />
                </div>
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
  display: flex;
  flex-direction: column;

  input.modal__submit {
    width: 100%;
    background: #0066da;
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
    transition: background 0.3s ease-in-out;

    &:hover {
      background: #034fa7;
    }
  }

  .file-input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  .modal__file {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 20px;
    color: #000;
    border: 2px dashed #0066da;
    border-radius: 5px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.3s ease-in-out;

    p {
      text-align: center;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      width: 100%;
    }

    label {
      cursor: pointer;
      border-radius: 8px;
      border: 1px dashed #302f2f;
      padding: 8px 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      color: #1a1a1a;

      svg{
        color: #1a1a1a;
      }
    }

    input {
      display: none;
    }
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
