import React, { useState } from "react";
import axios from "axios";

axios.defaults.debug = true;

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parkingDetails, setParkingDetails] = useState(null);

  const backendUrl = "http://localhost:5000/upload";

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        console.error("No image selected.");
        return;
      }

      const formData = new FormData();
      formData.append("upload", selectedFile); // file , upload

      // Set your Plate Recognizer API token here
      const plateRecognizerToken = "5fa513a8bb3b09af21a94d7b1f21537b0079bf16";
      const plateRecognizerURL =
        "https://api.platerecognizer.com/v1/plate-reader/";

      const plateRecognizerHeaders = {
        Authorization: `Token ${plateRecognizerToken}`,
      };

      const plateRecognizerResponse = await fetch(plateRecognizerURL, {
        method: "POST",
        headers: plateRecognizerHeaders,
        body: formData,
      });

      const plateRecognizerJson = await plateRecognizerResponse.json();
      const plateNumber = plateRecognizerJson.results[0]?.plate;
      const vehicleType = plateRecognizerJson.results[0]?.vehicle?.type;
      const entryTime = new Date().toISOString();

      const dataToSend = {
        plate: plateNumber,
        type: vehicleType,
        entryTime: entryTime,
      };

      const backendResponse = await axios.post(backendUrl, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const parkingDetails = backendResponse.data;
      console.log(parkingDetails.parkingFee);
      console.log(parkingDetails.daysSpent);
      console.log(parkingDetails.entryDate);
      console.log(parkingDetails.exitDate);

      // Show parking fee invoice, assuming the API response includes parking details for recognized vehicles
      if (parkingDetails.parkingFee != null) {
        setParkingDetails(backendResponse.data);
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Upload an Image</h2>
      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <button className="btn btn-primary" onClick={handleUpload}>
        Upload
      </button>

      {parkingDetails && (
        <div className="mt-4">
          <h3>Parking Lot Details</h3>
          <p>Licence plate: {parkingDetails.plateNumber}</p>
          <p>Amount to be Charged: {parkingDetails.parkingFee} Eur</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
