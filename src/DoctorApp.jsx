import { db } from "./fireBaseConfig";
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import './App.css';
import { ChevronUp, ChevronDown } from "lucide-react";

const urineGeneralFields = ["Color", "Reaction", "Sugar", "Acetone", "Bile Pig"];
const stoolGeneralFields = ["Colour", "Consistency", "Mucous", "Blood", "Worms"];
const depositsFeilds = ["d.Pus", "d.R.B.Cs", "E.P cels", "Casts", "Crystalis", "Undingeste Ova", "Trichomans V", "Yeast", "Others"];
const microscopicFeilds = ["Pus", "R.B.Cs", "Cysts/Ova", "Flagllates", "Trophozoite", "Undingeste Food", "Others"];

const orderedFields = [
  "patientNumber", "patientName", "date", "sign",
  "bfMalaria", "ictMalaria", "hb", "twbc", "esr", "rf",
  "aso", "rbs", "fbs", "hpp", "hcg", "bg", "abo", "rh",
  "widalBo", "widalO", "widalC", "widalH", "widalBruc",
  "hiv", "hbv", "hcv", "ictHpaab", "urea", "creatinine",
];

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteAllMode, setDeleteAllMode] = useState(false); // New state for Delete All mode
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch reports initially and set interval for auto-refresh every 5 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "labReports"));
        if (!isMounted) return;

        // Get wrapped state from localStorage
        const localWrapped = JSON.parse(localStorage.getItem("activeReports")) || [];

        const reportList = querySnapshot.docs.map((doc) => {
          const saved = localWrapped.find((r) => r.id === doc.id);
          return {
            id: doc.id,
            wrapped: saved?.wrapped || false,
            ...doc.data(),
          };
        });

        setReports(reportList);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
    const intervalId = setInterval(fetchReports, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Show confirmation popup when delete clicked
  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteAllMode(false);
    setShowConfirm(true);
  };

  // Show confirmation popup for delete all
  const handleDeleteAll = () => {
    setDeleteId(null);
    setDeleteAllMode(true);
    setShowConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      if (deleteAllMode) {
        // Delete all reports
        // Firestore doesn't support batch delete directly, so we delete one by one
        await Promise.all(
          reports.map((r) => deleteDoc(doc(db, "labReports", r.id)))
        );
        setReports([]);
      } else {
        // Delete single report
        await deleteDoc(doc(db, "labReports", deleteId));
        setReports((prev) => prev.filter((r) => r.id !== deleteId));
      }
    } catch (error) {
      console.error("Failed to delete report(s):", error);
      alert("Failed to delete report(s).");
    }
    setShowConfirm(false);
    setDeleteId(null);
    setDeleteAllMode(false);
  };

  // Cancel deletion confirmation popup
  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
    setDeleteAllMode(false);
  };

  // Format field labels from camelCase or concatenated strings
  const formatLabel = (field) =>
    field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  // Toggle wrapping/collapsing of report
  const toggleWrap = (id) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, wrapped: !r.wrapped } : r
    );
    setReports(updated);
    localStorage.setItem("activeReports", JSON.stringify(updated));
  };

  // Wrap all reports at once
  const wrapAll = () => {
    const updated = reports.map((r) => ({ ...r, wrapped: true }));
    setReports(updated);
    localStorage.setItem("activeReports", JSON.stringify(updated));
  };

  // Filter reports by patient name search term (case insensitive)
  const filteredReports = reports.filter((report) =>
    report.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="labReportsContainer" style={{ width: "300%", padding: "10px" }}>
      <input
        type="text"
        placeholder="Search by patient name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          top: "50px",
          marginBottom: "10px",
          position: "absolute",
          padding: "10px",
          width: "100%",
          maxWidth: "400px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
      <br />
      <br />
      <h1>Doctor’s Reports</h1>
      <br />

      {filteredReports.length > 0 && filteredReports.every((r) => !r.wrapped) && (
        <button
          onClick={wrapAll}
          style={{
            marginBottom: "20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Wrap All
        </button>
      )}

      {reports.length > 0 && (
        <button
          onClick={handleDeleteAll}
          style={{
            marginBottom: "20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Delete All
        </button>
      )}

      {filteredReports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        filteredReports.map((report) => (
          <div
            key={report.id}
            id={`report-${report.id}`}
            className={`report-box ${report.wrapped ? "collapsed" : "expanded"}`}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
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

            <button
              onClick={() => toggleWrap(report.id)}
              aria-label={report.wrapped ? "Expand report" : "Collapse report"}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "100px",
              }}
            >
              {report.wrapped ? <ChevronDown size={28} /> : <ChevronUp size={28} />}
            </button>

            <h3>Patient name: {report.patientName}</h3>
            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Patient number:</strong> {report.patientNumber}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {orderedFields.map((field) => {
                if (
                  ["patientName", "date", "sentAt"].includes(field) ||
                  urineGeneralFields.includes(field) ||
                  stoolGeneralFields.includes(field) ||
                  depositsFeilds.includes(field) ||
                  microscopicFeilds.includes(field)
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

            <div className="box stool-box">
              <h4>Deposits</h4>
              {depositsFeilds.map((field) => (
                <div key={field} className="section">
                  <strong>{formatLabel(field)}:</strong> {String(report[field]) || <em>empty</em>}
                </div>
              ))}
            </div>

            <div className="box stool-box">
              <h4>Microscopic</h4>
              {microscopicFeilds.map((field) => (
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

      {/* Confirmation Popup */}
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
            minWidth: 300,
            textAlign: "center",
          }}
        >
          <p>
            Are you sure you want to delete {deleteAllMode ? "all reports" : "this report"}?
          </p>
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
              minWidth: 80,
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
              minWidth: 80,
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
