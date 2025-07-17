import { db } from "./fireBaseConfig";
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import './App.css';

const urineGeneralFields = ["urineColour", "urineReaction", "urineSugar", "urineAlbumin"];
const stoolGeneralFields = ["stoolColour", "stoolConsistency", "stoolMucous", "stoolBlood", "stoolWorms"];

const orderedFields = [
  "patientName", "date", "sign", "bfMalaria", "ictMalaria", "hb", "twbc", "esr", "rf",
  "aso", "rbs", "fbs", "hpp", "hcg", "abo", "rh", "hiv", "hbv", "hcv", "urea",
  "creatinine", "urineColour", "urineReaction", "urineSugar", "urineAlbumin",
  "urinePusCells", "urineRBCs", "urineEPCs", "urineCasts", "urineCrystals",
  "urineOva", "urineTrichomonas", "urineYeast", "urineOthers", "stoolColour",
  "stoolConsistency", "stoolMucous", "stoolBlood", "stoolWorms",
  "stoolPusCells", "stoolRBCs", "stoolCystOva", "stoolFlagellates",
  "stoolTrophozoite", "stoolUndigestedFood", "stoolOthers", "sentAt"
];

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
 


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "labReports"));
        const reportList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportList);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
    
  }, []);
useEffect(() => {
  let isMounted = true;

  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "labReports"));
      if (!isMounted) return;

      const reportList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportList);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Initial fetch
  fetchReports();

  // Poll every 5 seconds
  const intervalId = setInterval(() => {
    fetchReports();
  }, 3000);

  // Cleanup on unmount
  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);

  

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "labReports", deleteId));
      setReports((prev) => prev.filter((r) => r.id !== deleteId));
    } catch (error) {
      console.error("Failed to delete report:", error);
      alert("Failed to delete report.");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  const formatLabel = (field) =>
    field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());


  return (
      <div id="labReportsContainer" style={{  width: "300%", padding: "10px" }}>
      <h1>Doctor’s Reports</h1>

      {reports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
            reports.map((report) => (
                <div
                key={report.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            >
            <button
              onClick={() => handleDelete(report.id)}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
            }}
            >
              Delete Report
            </button>
        <h3>Patient name: {report.patientName}</h3>

            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Pateint number:</strong> {report.patientNumber}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {orderedFields.map((field) => {
                  if (
                      ["patientName", "date", "sentAt"].includes(field) ||
                  urineGeneralFields.includes(field) ||
                  stoolGeneralFields.includes(field)
                )
                  return null;
                  
                if (!(field in report)) return null;
                
                return (
                  <div key={field} className="section">
                    <strong>{formatLabel(field)}:</strong> {String(report[field])}
                  </div>
                );
              })}
            </div>

            <div className="box urine-box">
              <h4>Urine General</h4>
              {urineGeneralFields.map((field) => (
                  <div key={field} className="section">
                  <strong>{formatLabel(field)}:</strong> {String(report[field]) || <em>empty</em>}
                </div>
              ))}
            </div>

            <div className="box stool-box">
              <h4>Stool General</h4>
              {stoolGeneralFields.map((field) => (
                  <div key={field} className="section">
                  <strong>{formatLabel(field)}:</strong> {String(report[field]) || <em>empty</em>}
                </div>
              ))}
            </div>

            {report.sentAt && (
                <p>
                <strong>Sent At:</strong>{" "}
                {report.sentAt.toDate
                  ? report.sentAt.toDate().toLocaleString()
                  : String(report.sentAt)}
              </p>
            )}
          </div>
        ))
    )}

{showConfirm && <p>Confirm box should show here</p>}
      {showConfirm && (
        <div
          id="confirmBox"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 30,
            borderRadius: 10,
            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            zIndex: 100000,
          }}
        >
          <p>Are you sure you want to delete this report?</p>
          <button
            id="confirmYesBtn"
            onClick={confirmDelete}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: 10,
              marginRight: 10,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            id="confirmNoBtn"
            onClick={cancelDelete}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: 10,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorReports;
