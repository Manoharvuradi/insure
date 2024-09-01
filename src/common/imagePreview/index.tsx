import { useEffect, useState } from "react";
import { maxFileSize } from "~/utils/constants";
import { classNames } from "~/utils/helpers";

interface IFileProps {
  message: string;
  onClick?: () => void;
  size: any;
  handleClose: () => void;
  // show: boolean;
  // setShow: (value: boolean) => void;
  setFileDisable: (open: boolean) => void;
}

function ImagePreview(props: IFileProps) {
  const { size } = props;

  const fileSize = size / (1024 * 1024);

  useEffect(() => {
    if (fileSize > maxFileSize) {
      props.setFileDisable(true);
    } else {
      props.setFileDisable(false);
    }
  }, [size]);

  return (
    <>
      <div
        className={classNames(
          fileSize <= maxFileSize
            ? "border-blue-500 bg-blue-100 text-blue-700"
            : "bg-red-100",
          "border-l-4 p-4"
        )}
        role="alert"
      >
        <div className="flex">
          <div>
            <p className="font-bold" onClick={props.onClick}>
              {props.message}
            </p>
          </div>

          <div className="ml-auto pl-4">
            <button className="focus:outline-none" onClick={props.handleClose}>
              <div className="py-1">
                <svg
                  className="mr-4 h-6 w-6 fill-current text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 5.293a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 1 0 1.414-1.414L11.414 10z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="my-2">
        {fileSize > maxFileSize && (
          <p className="text-xs text-red-600 ">
            *File size Exceeded {maxFileSize}Mb,try uploading smaller one...
          </p>
        )}
      </div>
    </>
  );
}

export default ImagePreview;
