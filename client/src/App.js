import "./App.css";
import ImageUpload from "./ImageUpload";
import ParkingFees from "./ParkingFees";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              Smart Parking App
            </Link>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/upload">
                    Upload Image
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/fees">
                    Parking Fees Rates
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/upload" element={<ImageUpload />} />
          <Route path="/fees" element={<ParkingFees />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
