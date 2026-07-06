import { createContext, useContext, useState } from "react";

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [location, setLocation] = useState("");
  const [analysis, setAnalysis] = useState(null);
  // Store the original uploaded file + its object URL for the image editor
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);

  const value = {
    userName, setUserName,
    targetRole, setTargetRole,
    targetCompany, setTargetCompany,
    location, setLocation,
    analysis, setAnalysis,
    uploadedFile, setUploadedFile,
    uploadedFileURL, setUploadedFileURL,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
  return ctx;
}
