import React, { useEffect, useState } from "react";
import { db } from "./fireBaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const SavedChemecReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmBox, setShowConfirmBox] = useState(false);

  const fetchReports = async () => {
    try {
      const reportsCol = collection(db, "chemecReports");
      const snapshot = await getDocs(reportsCol);
      const reportsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsList);
    } catch (error) {
      console.error("Failed to fetch saved Chemec reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteAllReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "chemecReports"));
      const deletePromises = snapshot.docs.map((docItem) =>
        deleteDoc(doc(db, "chemecReports", docItem.id))
      );
      await Promise.all(deletePromises);
      setReports([]);
      setShowConfirmBox(false);
    } catch (error) {
      console.error("Error deleting reports:", error);
    }
  };

  if (loading) return <div>Loading saved Chemec Reports...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Saved Chemec Reports</h2>

      {reports.length > 0 && (
        <button
          onClick={() => setShowConfirmBox(true)}
          style={{
            marginBottom: 20,
            background: "red",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Delete All Reports
        </button>
      )}

      {reports.length === 0 ? (
        <p>No saved reports found.</p>
      ) : (
        reports.map(report => (
          <div key={report.id} style={{ border: "1px solid #ccc", marginBottom: 15, padding: 15, borderRadius: 6 }}>
            <p><strong>Patient Name:</strong> {report.patientName || "N/A"}</p>
            <p><strong>Date:</strong> {report.date || "N/A"}</p>
            <p><strong>Age:</strong> {report.age || "N/A"}</p>
            <p><strong>Test Result:</strong> {report.testResult || "N/A"}</p>
          </div>
        ))
      )}

      {/* Confirmation Popup */}
      {showConfirmBox && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "white",
            padding: 30,
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <p style={{ marginBottom: 20 }}>Are you sure you want to delete all reports?</p>
            <button
              onClick={deleteAllReports}
              style={{ background: "red", color: "white", padding: "8px 16px", marginRight: 10, border: "none", borderRadius: 4 }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowConfirmBox(false)}
              style={{ background: "gray", color: "white", padding: "8px 16px", border: "none", borderRadius: 4 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedChemecReports;
