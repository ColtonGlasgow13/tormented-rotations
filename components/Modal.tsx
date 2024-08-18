"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  onCancel: () => void;
  children: React.ReactNode;
  z?: number;
}

const Modal = ({ onCancel, children, z }: ModalProps) => {
  const [container] = useState(() => {
    const div = document.createElement("div");
    div.classList.add("modal-container");
    return div;
  });

  useEffect(() => {
    document.body.appendChild(container);

    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        z ? `z-[${z}]` : "z-50"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onCancel}
        data-testid="modal-background"
      ></div>
      {children}
    </div>,
    container
  );
};

Modal.displayName = "Modal";

export default Modal;
