import { ImAttachment } from "react-icons/im";
import { IEvent } from "~/interfaces/common/form";

interface IFileUploadProps {
  files: any;
  handleFileChange: (e: IEvent) => void;
}

const FileUpload = ({ files, handleFileChange }: IFileUploadProps) => {
  return (
    <div>
      <div className="my-4 flex justify-around border-2 border-dashed">
        <label
          htmlFor="file-upload"
          className="m-8 inline-block cursor-pointer rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
        >
          Choose files
        </label>
      </div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />

      {files.length > 0 && (
        <div className="mt-4">
          <p className="font-medium">Selected files:</p>
          <ul className="list-inside">
            {files.map((file: any) => (
              <li key={file.name} className="flex">
                <ImAttachment color="blue" className="mr-1 mt-1" />
                <span>{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
