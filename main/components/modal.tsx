import React, { ReactNode, useState } from "react";
import { Button, Modal } from "antd";
import { ButtonType } from "antd/es/button";

type ModalRPSProps = {
  type?: ButtonType;
  title: string;
  label?: string;
  showButton?: boolean;
  showFooter?: boolean;
  open?: boolean;
  children: ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
};
const ModalRPS: React.FC<ModalRPSProps> = (props: ModalRPSProps) => {
  const {
    type = "primary",
    label,
    title,
    children,
    showButton = false,
    showFooter = false,
    open = false,
    onOk,
    onCancel,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(open);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    onOk && onOk();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel && onCancel();
  };

  return (
    <>
      {(showButton || label) && (
        <Button type={type} onClick={showModal} className="btn-dashed">
          {label || "Open Modal"}
        </Button>
      )}
      <Modal
        closable={false}
        title={title}
        open={isModalOpen}
        onOk={showFooter ? handleOk : undefined}
        onCancel={handleCancel}
        okText={label}
        wrapClassName="rps-modal"
        footer={showFooter ? undefined : null}
      >
        {children}
      </Modal>
    </>
  );
};

export default ModalRPS;
