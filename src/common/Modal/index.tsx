import React from "react";
import Button from "../buttons/filledButton";
import { classNames } from "~/utils/helpers";
import SecondaryButton from "../buttons/secondaryButton";

export interface ModalProps {
  title?: string | React.ReactElement;
  onCloseClick: Function;
  onSaveClick?: Function;
  children: React.ReactElement;
  showButtons?: boolean;
  border?: boolean;
  okButtonTitle?: string;
  buttonDisabled?: boolean;
  onCloseButton?: boolean;
}
const Modal = (props: ModalProps) => {
  const {
    title,
    onCloseClick,
    onSaveClick,
    children,
    showButtons,
    border,
    buttonDisabled,
    onCloseButton,
  } = props;
  return (
    <div
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
      className="fixed  left-0 right-0 z-50 flex h-screen w-auto items-center justify-center overflow-y-auto py-10 md:inset-0"
    >
      <div className="relative h-full w-full max-w-2xl">
        <div className="relative rounded-lg bg-white px-4 shadow">
          <div
            className={classNames(
              border == true ? "border-b" : "",
              "flex items-start justify-between rounded-t py-2 "
            )}
          >
            <h3 className="left-0 p-4 text-xl  font-semibold text-gray-900 lg:text-2xl">
              {title && title}
            </h3>
            <button
              onClick={() => onCloseClick()}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div className="h-auto p-2 align-bottom">{children}</div>
          {showButtons && (
            <div className="flex justify-end gap-x-4 p-3">
              <Button
                text={props.okButtonTitle ?? "Save"}
                disabled={buttonDisabled}
                onClick={() => (onSaveClick ? onSaveClick() : null)}
              />
              <SecondaryButton text={"Close"} onClick={() => onCloseClick()} />
            </div>
          )}
          {onCloseButton && (
            <div className="flex justify-end gap-x-4 p-3">
              <SecondaryButton text={"Close"} onClick={() => onCloseClick()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
