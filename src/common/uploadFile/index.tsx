import React, { useEffect, useRef } from "react";

function UploadFile(props: any) {
  const { title, fileUpload, setFileUpload, uploadMultiple } = props;
  const fileInputRef = useRef<any>(null);

  const OnChangeHandler = (e: any) => {
    e.preventDefault();
    const selectedFiles = e.target.files;
    setFileUpload((prevFiles: any) => [...prevFiles, ...selectedFiles]);
  };

  const onDropEventHandler = (e: any) => {
    e.preventDefault();
    const selectedFiles = e.dataTransfer.items;
    const files = [...e.dataTransfer.items].map((item: any) => {
      if (item.kind === "file") {
        return item.getAsFile();
      }
    });
    setFileUpload((prevFiles: any) => [...prevFiles, ...files]);
  };

  const onClickHandler = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="p-5">
      <div className="animation static inset-0 z-50 flex  items-center  justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
        <div className="relative w-full">
          <div className="relative flex flex-col rounded-lg shadow-lg outline-none focus:outline-none">
            <div
              className="mt-1 flex justify-center bg-white"
              onDragOver={(e: any) => {
                e.preventDefault();
              }}
              onDrop={(e) => onDropEventHandler(e)}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                accept="application/pdf,image/jpeg,image/png,image/jpg"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={(e) => OnChangeHandler(e)}
                multiple={uploadMultiple}
              />
              <div className="justify-center space-y-1 ">
                <div>
                  <img
                    className="ml-10 h-[200px] w-[200] rounded-full"
                    src="/images/upload.svg"
                    alt="upload image"
                  />
                </div>
                <div className="text justify-cente m-2 flex">
                  <p className="">
                    drag and drop
                    <label htmlFor="file-upload" onClick={onClickHandler}>
                      <span className="relative mx-2 cursor-pointer font-medium text-blue-600 underline focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                        Upload document
                      </span>
                    </label>
                    here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadFile;
