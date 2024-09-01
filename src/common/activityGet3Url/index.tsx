import React, { useState, useEffect } from "react";
import { api } from "~/utils/api";

const GetUrl = (props: any) => {
  const [previewUrl, setPreviewUrl] = useState<any>();
  const [request, setRequest] = useState({});
  const [enableLink, setEnableLink] = useState(false);
  const [viewFuneralDoc, setViewFuneralDoc] = useState<any>();
  const { data: fileUrl } = api.uploadLibrary?.gets3url.useQuery(props?.data, {
    enabled: true,
  });

  const { data: getPackageKey } = api.uploadLibrary?.gets3url.useQuery(
    request,
    {
      enabled: enableLink,
    }
  );

  useEffect(() => {
    if (fileUrl) {
      setPreviewUrl(fileUrl);
    }
  }, [fileUrl]);

  useEffect(() => {
    if (getPackageKey) {
      setViewFuneralDoc(getPackageKey);
    }
  }, [getPackageKey]);

  const createLink = async (key: any) => {
    setRequest(key);
    setEnableLink(true);
  };

  return (
    <div>
      <a
        className="text-sm text-primary-500 hover:underline"
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Policy Attachment
      </a>
      {props?.packageKeys?.includes("failed to get package documents") && (
        <p className="text-sm">Failed to get package documents</p>
      )}
      {props?.packageKeys?.map((item: any, index: number) => {
        return (
          <a
            key={index}
            className="ml-2 text-sm text-primary-500 hover:underline"
            href={viewFuneralDoc}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => createLink({ key: item.s3response?.key })}
          >
            {item.name}
          </a>
        );
      })}
    </div>
  );
};

export default GetUrl;
