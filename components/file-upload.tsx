"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";

interface UploadedFile {
  url: string;
  type: string;
  name?: string;
}
interface FileUploadProps {
  onChange: (file?: UploadedFile) => void;
  value?: UploadedFile;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  const isPDF = value?.type === "application/pdf";
  const isImage = value?.type?.startsWith("image/");

  if (value && isImage) {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={value.url} alt="upload" className="rounded-full" />
        <button
          onClick={() => onChange(undefined)}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && isPDF) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value.name ?? "PDF file"}
        </a>
        <button
          onClick={() => onChange(undefined)}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (!res?.[0]) return;
        console.log("Upload response: ", res[0]);
        onChange({
          url: res[0].ufsUrl,
          type: res[0].type,
          name: res[0].name,
        });
      }}
      onUploadError={(error: Error) => {
        console.error("Upload aborted:", error);
      }}
    />
  );
};
