import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://speech-to-text-backend-2.onrender.com/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setResult(response.data);
      setStatus("Processing complete!");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setStatus("An error occurred: " + (error.response ? error.response.data.error : error.message));
    }
  };

  const startRecording = async () => {
    setStatus("");
    setResult(null);
    setProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
        setFile(audioBlob);
        audioChunks.current = [];
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setStatus("Error accessing microphone: " + error.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="App">
      <h1>Speech Enhancer App</h1>

      {/* File Upload Section */}
      <form onSubmit={handleSubmit} className="form-container">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button type="submit" className="submit-button">Upload and Process</button>
      </form>

      {/* Audio Recorder Section */}
      <div className="audio-recorder">
        {!recording ? (
          <button onClick={startRecording} className="record-button">Start Recording</button>
        ) : (
          <button onClick={stopRecording} className="stop-button">Stop Recording</button>
        )}
        {audioURL && (
          <audio controls src={audioURL} className="audio-player" />
        )}
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Status and Results */}
      {status && <p className="status">{status}</p>}

      {result && (
        <div className="results-container">
          <div className="section">
            <h3 className="section-header">Transcription Results</h3>
            <p><strong>Raw Transcription:</strong> {result.raw_transcription}</p>
            <p><strong>Enhanced Transcription:</strong> {result.corrected_transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
