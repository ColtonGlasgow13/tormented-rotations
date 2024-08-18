"use client";

import { ReactNode, useState } from "react";

type CloseModal<ResultType> = (result: ResultType) => void;
type ModalFactory<ResultType> = (close: CloseModal<ResultType>) => ReactNode;

export type OpenModal = <ModalResult>(
  modalFactory: ModalFactory<ModalResult>
) => Promise<ModalResult>;

export function useModal() {
  const [modalNode, setModalNode] = useState<ReactNode>(null);

  const openModal: OpenModal = <ModalResult>(
    modalFactory: ModalFactory<ModalResult>
  ) => {
    return new Promise<ModalResult>((resolve) => {
      function close(value: ModalResult) {
        resolve(value);
        setModalNode(null);
      }

      setModalNode(modalFactory(close));
    });
  };

  return { modalNode, openModal };
}
