import React, { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Please choose a file");
    if (!user) return setError("User not found");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", String(user.id));

    try {
      setLoading(true);
      const resp = await api.post("/uploads/estimate", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(resp.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upload driving / energy report</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Estimate"}
        </button>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {result && (
        <div className="mt-6 p-4 border rounded space-y-2">
          <div><strong>Estimated CO2 (kg):</strong> {result.estimatedCo2Kg}</div>
          <div><strong>Credits Issued (tons):</strong> {result.creditsIssued}</div>
          <div><strong>Message:</strong> {result.message}</div>

          {result.extractedText && (
            <div>
              <strong>Extracted Text Preview</strong>
              <pre className="mt-2 max-h-64 overflow-auto p-2 bg-gray-50 text-sm whitespace-pre-wrap">{result.extractedText}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
