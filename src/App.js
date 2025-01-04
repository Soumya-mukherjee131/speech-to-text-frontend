import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Processing...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://speech-to-text-backend.onrender.com/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setStatus("Processing complete!");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setStatus("An error occurred: " + (error.response ? error.response.data.error : error.message));
    }
  };

  return (
    <div className="App">
      <h1>Speech Enhancer App</h1>

      {/* File Upload Section */}
      <form onSubmit={handleSubmit} className="form-container">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button type="submit" className="submit-button">Upload and Process</button>
      </form>

      {status && <p className="status">{status}</p>}

      {result && (
        <div className="results-container">
          
          {/* Raw and Enhanced Transcription Section */}
          <div className="section">
            <h3 className="section-header">Transcription Results</h3>
            <p><strong>Raw Transcription:</strong> {result.raw_transcription}</p>
            <p><strong>Enhanced Transcription:</strong> {result.corrected_transcription}</p>
          </div>

          <div className="separator"></div>

          {/* First Table: Raw Text Phoneme Comparison */}
          {result.phoneme_comparison_data && (
            <div className="section">
              <h3 className="section-header">Phoneme Comparison (Raw vs Corrected)</h3>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Raw Word</th>
                    <th>Raw Phonemes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.phoneme_comparison_data.map((item, index) => (
                    <tr key={index}>
                      <td>{item["Raw Word"]}</td>
                      <td>{item["Raw Phonemes"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="separator"></div>

          {/* Second Table: Enhanced Text Phoneme Data */}
          {result.enhanced_phoneme_data && (
            <div className="section">
              <h3 className="section-header">Enhanced Text Phonemes</h3>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Enhanced Word</th>
                    <th>Enhanced Phonemes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.enhanced_phoneme_data.map((item, index) => (
                    <tr key={index}>
                      <td>{item["Enhanced Word"]}</td>
                      <td>{item["Enhanced Phonemes"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="separator"></div>

          {/* Download Links */}
          <div className="download-links">
            {result.phoneme_comparison_csv && (
              <a href={result.phoneme_comparison_csv} target="_blank" rel="noopener noreferrer" className="download-link">
                Download Phoneme Comparison CSV
              </a>
            )}
            {result.enhanced_phoneme_csv && (
              <a href={result.enhanced_phoneme_csv} target="_blank" rel="noopener noreferrer" className="download-link">
                Download Enhanced Phoneme CSV
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
