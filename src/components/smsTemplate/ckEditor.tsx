import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React, { useRef } from "react";

const CkEditor = ({ value, onChange }: any) => {
  const ref = useRef<any>();
  return (
    // <></>
    <CKEditor
      editor={ClassicEditor as any}
      data={value}
      ref={ref}
      onChange={(event: any, editor: any) => {
        const data = editor.getData();
        onChange(data);
      }}
      config={{
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "blockQuote",
          "|",
          "undo",
          "redo",
        ],
      }}
    />
  );
};

export default CkEditor;
