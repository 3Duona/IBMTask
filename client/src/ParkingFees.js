import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ParkingFees = () => {
  const [fees, setFees] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [updatedFees, setUpdatedFees] = useState([]);

  useEffect(() => {
    fetchParkingFees();
  }, []);

  const fetchParkingFees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/fees");
      setFees(response.data);
      setUpdatedFees(response.data);
    } catch (error) {
      console.error("Error fetching parking fees:", error.message);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    try {
      await axios.put("http://localhost:5000/fees", updatedFees);
      setFees(updatedFees);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating parking fees:", error.message);
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setUpdatedFees([...fees]);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    const parts = name.split("_");
    const index = parts[0];
    const field = parts.slice(1).join("_");

    const newUpdatedFees = [...updatedFees];
    newUpdatedFees[index] = {
      ...newUpdatedFees[index],
      [field]: parseFloat(value),
    };
    setUpdatedFees(newUpdatedFees);
  };

  return (
    <div className="container mt-4">
      <h2>Parking Fees</h2>
      {editMode ? (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle Type</th>
                <th>Weekday Rate</th>
                <th>Friday Rate</th>
                <th>Saturday Rate</th>
                <th>Sunday Rate</th>
              </tr>
            </thead>
            <tbody>
              {updatedFees.map((fee, index) => (
                <tr key={index}>
                  <td>{fee.type}</td>
                  <td>
                    <input
                      type="number"
                      name={`${index}_weekday_rate`}
                      value={fee.weekday_rate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${index}_friday_rate`}
                      value={fee.friday_rate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${index}_saturday_rate`}
                      value={fee.saturday_rate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${index}_sunday_rate`}
                      value={fee.sunday_rate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="my-4">
            <button className="btn btn-primary" onClick={handleSaveClick}>
              Save
            </button>{" "}
            <button className="btn btn-secondary" onClick={handleCancelClick}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle Type</th>
                <th>Weekday Rate</th>
                <th>Friday Rate</th>
                <th>Saturday Rate</th>
                <th>Sunday Rate</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.type}>
                  <td>{fee.type}</td>
                  <td>{fee.weekday_rate}</td>
                  <td>{fee.friday_rate}</td>
                  <td>{fee.saturday_rate}</td>
                  <td>{fee.sunday_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary" onClick={handleEditClick}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ParkingFees;
