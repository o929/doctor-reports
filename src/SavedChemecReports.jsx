import React, { useEffect, useState } from "react";
import { db } from "./fireBaseConfig";
import { collection, getDocs } from "firebase/firestore";

const SavedChemecReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchReports();
  }, []);

  if (loading) return <div>Loading saved Chemec Reports...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Saved Chemec Reports</h2>
      {reports.length === 0 && <p>No saved reports found.</p>}
      {reports.map(report => (
        <div key={report.id} style={{ border: "1px solid #ccc", marginBottom: 15, padding: 15, borderRadius: 6 }}>
          <p><strong>Patient Name:</strong> {report.patientName || "N/A"}</p>
          <p><strong>Date:</strong> {report.date || "N/A"}</p>
          {/* Display other fields as you want */}
        </div>
      ))}
    </div>
  );
};

export default SavedChemecReports;
