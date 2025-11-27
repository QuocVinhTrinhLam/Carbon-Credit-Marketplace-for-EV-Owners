import React, { useState } from "react";
import { api } from "../services/api";
import { uploadService } from "../services/uploadService";
import { useAuth } from "../hooks/useAuth";

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // form-only fields
  const [vehicleId, setVehicleId] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [energyKwh, setEnergyKwh] = useState<string>("");
  const [liters, setLiters] = useState<string>("");
  const [estimateLoading, setEstimateLoading] = useState(false);

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
      // auto-issue credits if upload successful and creditsIssued > 0
      if (resp.data?.creditsIssued && Number(resp.data.creditsIssued) > 0 && user) {
        try {
          await uploadService.issueCredits(user.id, resp.data.creditsIssued);
          setError(null);
        } catch (issueErr: any) {
          console.warn("Failed to auto-issue credits", issueErr);
          setError("Upload done but credits could not be issued");
        }
      }
    } catch (err: any) {
      console.error(err);
        const respData = err?.response?.data;
        if (respData) {
          // show server response (may include extractedText and message)
          setResult(respData);
          setError(respData.message || null);
        } else {
          setError(err.message || "Upload failed");
        }
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

      <hr className="my-6" />

      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Form-only estimate</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Vehicle ID</label>
            <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Trip Date</label>
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <label className="block text-sm">Distance (km)</label>
            <input type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Energy (kWh)</label>
            <input type="number" step="0.1" value={energyKwh} onChange={(e) => setEnergyKwh(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Fuel (liters)</label>
            <input type="number" step="0.1" value={liters} onChange={(e) => setLiters(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={estimateLoading}
            onClick={async () => {
              setEstimateLoading(true);
              setError(null);
              try {
                const body: Record<string, any> = {
                  userId: (user && (user.id)) || undefined,
                  vehicleId: vehicleId || undefined,
                  tripDate: tripDate || undefined,
                  distanceKm: distanceKm ? Number(distanceKm) : undefined,
                  energyKwh: energyKwh ? Number(energyKwh) : undefined,
                  liters: liters ? Number(liters) : undefined
                };
                const resp = await uploadService.estimateFromForm(body);
                setResult(resp);
                // auto-issue credits if estimate successful and creditsIssued > 0
                if (resp?.creditsIssued && Number(resp.creditsIssued) > 0 && user) {
                  try {
                    await uploadService.issueCredits(user.id, resp.creditsIssued);
                    setError(null);
                  } catch (issueErr: any) {
                    console.warn("Failed to auto-issue credits", issueErr);
                    setError("Estimate done but credits could not be issued");
                  }
                }
              } catch (err: any) {
                console.error(err);
                const respData = err?.response?.data;
                if (respData) {
                  setResult(respData);
                  setError(respData.message || null);
                } else {
                  setError(err.message || "Estimate failed");
                }
              } finally {
                setEstimateLoading(false);
              }
            }}
          >
            {estimateLoading ? "Estimating..." : "Estimate (form only)"}
          </button>
        </div>
      </div>

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
