import './App.css'
import DoctorReports from './DoctorApp'
import ChemecReports from './SavedChemecReports'
import { HashRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

function App() {
  return (
    <>
     <Router>
       <nav id='nav'>
          <Link to="/doctor" style={{color:"white",fontSize:"18px", marginRight: "3rem" }}>Received Lab Reports</Link>
          <Link to="/chemec" style={{color:"white",fontSize:"18px"}}>Reveived Chemec Reports</Link>
       </nav>
      
       <Routes>
         <Route path="/doctor" element={<DoctorReports />} />
         <Route path="/chemec" element={<ChemecReports />} />
         <Route path="*" element={<Navigate to="/doctor" />} />
       </Routes>
     </Router>
    </>
  )
}

export default App
