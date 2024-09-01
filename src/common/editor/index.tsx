import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

export interface IEditor {
  content?: string;
  handleEditorChange: (e: string) => void;
}

const TextEditor = ({ content, handleEditorChange = () => {} }: IEditor) => {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      onInit={(evt: any, editor: any) => (editorRef.current = editor)}
      value={content}
      onEditorChange={handleEditorChange}
      init={{
        height: 500,
        menubar: false,
        branding: false,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | " +
          "bold italic backcolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat",
        content_style:
          "body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }",
      }}
    />
  );
};

export default TextEditor;
