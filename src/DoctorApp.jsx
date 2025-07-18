import { db } from "./fireBaseConfig";
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import './App.css';
import { ChevronUp ,ChevronDown} from "lucide-react";


const urineGeneralFields = ["Color", "Reaction", "Sugar", ,"Acetone","Bile Pig"];
const stoolGeneralFields = ["Colour", "Consistency", "Mucous", "Blood", "Worms"];
const depositsFeilds = ["d.Pus", "d.R.B.Cs", "E.P cels", "Casts", "Crystalis","Undingeste Ova","Trichomans V","Yeast","Others"];
const microscopicFeilds = ["Pus", "R.B.Cs", "Cysts/Ova", "Flagllates", "Trophozoite","Undingeste Food","Others"];

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
 const [searchTerm, setSearchTerm] = useState("");



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

      // Get the saved wrapped values from localStorage
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

// Toggle the wrapped state of a report
const toggleWrap = (id) => {
  const updated = reports.map((r) =>
    r.id === id ? { ...r, wrapped: !r.wrapped } : r
  );
  setReports(updated);
  localStorage.setItem("activeReports", JSON.stringify(updated));
};

//wrap all reports
const wrapAll = () => {
  const updated = reports.map((r) => ({ ...r, wrapped: true }));
  setReports(updated);
  localStorage.setItem("activeReports", JSON.stringify(updated));
};


// Filter reports based on the search term
const filteredReports = reports.filter((report) =>
  report.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
      <div id="labReportsContainer" style={{  width: "300%", padding: "10px" }}>
        <input
  type="text"
  placeholder="Search by patient name"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    top:"50px",
    marginBottom: "10px",
    position: "absolute",
    padding: "10px",
    width: "100%",
    maxWidth: "400px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px"
  }}
/>

      <h1>Doctor’s Reports</h1>
      {filteredReports.length > 0 &&
  filteredReports.every((r) => !r.wrapped) && (
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
      }}
    >
      Wrap All
    </button>
  )}


      { filteredReports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
          
            filteredReports.map((report) => (
              
                <div
                key={report.id}
        id={`report-${report.id}`}
className={`report-box ${report.wrapped ? "collapsed" : "expanded"}`}

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
{/* <button
  onClick={() => toggleWrap(report.id)}
  aria-label={report.wrapped ? "Expand report" : "Collapse report"}
  style={{
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4
  }}
>

</button> */}

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
            <p><strong>Pateint number:</strong> {report.patientNumber}</p>

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
