import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import ComponentLoader from "../componentLoader";

export interface PolicyScheduleUrlProps {
  pdfkey: any;
}

function PolicyScheduleUrl(props: PolicyScheduleUrlProps) {
  const [pdfUrl, setPdfUrl] = useState("");
  const {
    isLoading: getUrlLoading,
    data: fileUrl,
    error: getUrlError,
  } = api.uploadLibrary?.gets3url?.useQuery(
    { key: props.pdfkey },
    {
      enabled: true,
    }
  );

  useEffect(() => {
    if (fileUrl) {
      setPdfUrl(fileUrl);
    }
  }, [fileUrl]);

  return getUrlLoading ? (
    <ComponentLoader />
  ) : (
    <div className="w-full">
      <iframe
        src={pdfUrl}
        title="PDF"
        height="600px"
        width="100%"
        className="overflow-hidden"
      ></iframe>
    </div>
  );
}

export default PolicyScheduleUrl;
