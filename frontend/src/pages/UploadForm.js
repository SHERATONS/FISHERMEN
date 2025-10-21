import React, { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setMessage("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("weight", weight);
    formData.append("price", price);
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:8080/api/fish/upload", formData);
      setMessage("Upload successful: " + res.data.name);
      setName(""); setWeight(""); setPrice(""); setImage(null);
    } catch (err) {
      setMessage("Upload failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="upload-card">
      <h2>Upload Daily Catch</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Fish Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default UploadForm;
