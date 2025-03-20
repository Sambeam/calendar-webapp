import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Required for accessibility

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Confirm Action">
      <h3>{message}</h3>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose}>No</button>
    </Modal>
  );
};

export default ConfirmModal;
