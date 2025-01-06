import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Processing...");
    setLoading(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(30);
      const response = await axios.post('https://speech-to-text-backend-2.onrender.com/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setStatus("Processing complete!");
      setLoading(100);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setStatus("An error occurred: " + (error.response ? error.response.data.error : error.message));
      setLoading(0);
    }
  };

  const handlePlayAudio = () => {
    if (result && result.corrected_transcription) {
      const speech = new SpeechSynthesisUtterance(result.corrected_transcription);
      speech.lang = 'en-US';
      speech.onstart = () => setIsPlaying(true);
      speech.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(speech);
    }
  };

  const handleDownloadAudio = () => {
    if (result && result.corrected_transcription) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(result.corrected_transcription);
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);

      synth.speak(utterance);
      const source = audioContext.createMediaStreamSource(destination.stream);
      source.connect(audioContext.destination);

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'enhanced_transcription.wav';
        link.click();
      };

      mediaRecorder.start();
      utterance.onend = () => {
        mediaRecorder.stop();
      };
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

      {/* Progress Bar */}
      {loading > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${loading}%` }}></div>
        </div>
      )}

      {result && (
        <div className="results-container">
          {/* Raw and Enhanced Transcription Section */}
          <div className="section">
            <h3 className="section-header">Transcription Results</h3>
            <p><strong>Raw Transcription:</strong> {result.raw_transcription}</p>
            <p><strong>Enhanced Transcription:</strong> {result.corrected_transcription}</p>
          </div>

          <div className="audio-controls">
            <button onClick={handlePlayAudio} className="audio-button" disabled={isPlaying}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </button>
            <button onClick={handleDownloadAudio} className="audio-button">
              Download Audio
            </button>
          </div>

          <div className="separator"></div>

          {/* Phoneme Comparison Table */}
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

          {/* Enhanced Text Phonemes */}
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
