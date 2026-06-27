"use client";

import styled from "styled-components";
import { Modal } from "@mui/material";
import { motion } from "framer-motion";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

const TONE_STYLES = {
  warning: {
    icon: DeleteOutlineOutlinedIcon,
    bg: "var(--primary-light)",
    color: "var(--primary)",
    confirmBg: "var(--primary)",
    confirmHover: "var(--primary-hover)",
  },
  danger: {
    icon: DeleteForeverOutlinedIcon,
    bg: "rgba(239, 68, 68, 0.12)",
    color: "#ef4444",
    confirmBg: "#dc2626",
    confirmHover: "#b91c1c",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  onConfirm,
  onCancel,
}) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.warning;
  const Icon = style.icon;

  return (
    <Modal open={open} onClose={onCancel}>
      <Center>
        <Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        >
        <IconWrap $bg={style.bg} $color={style.color}>
          <Icon style={{ fontSize: 26 }} />
        </IconWrap>

        <Title>{title}</Title>
        <Message>{message}</Message>

        <Actions>
          <CancelBtn type="button" onClick={onCancel}>
            {cancelLabel}
          </CancelBtn>
          <ConfirmBtn
            type="button"
            $bg={style.confirmBg}
            $hover={style.confirmHover}
            onClick={onConfirm}
          >
            {confirmLabel}
          </ConfirmBtn>
        </Actions>
        </Panel>
      </Center>
    </Modal>
  );
}

const Center = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(92vw, 400px);
`;

const Panel = styled.div`
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 28px 24px 22px;
  box-shadow: var(--shadow-lg);
  outline: none;
  text-align: center;
`;

const IconWrap = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
  margin-bottom: 8px;
`;

const Message = styled.p`
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--text-2);
  margin-bottom: 22px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelBtn = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--surface-3);
    border-color: var(--border-light);
  }
`;

const ConfirmBtn = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: ${(p) => p.$bg};
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: ${(p) => p.$hover};
  }

  &:active {
    transform: scale(0.98);
  }
`;
