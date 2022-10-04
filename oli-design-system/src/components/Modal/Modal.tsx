import { ReactNode } from "react";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const Modal = ({ open, onClose, children }: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent>
          <DialogContainer>{children}</DialogContainer>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: black;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
`;

const DialogContent = styled(Dialog.Content)`
  padding: 0 25%;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const DialogContainer = styled.div`
  background-color: white;
  width: 100%;
`;
