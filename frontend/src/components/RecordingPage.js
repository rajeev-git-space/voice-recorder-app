import React, { useState, useRef, useEffect } from "react";
import Recorder from "recorder-js";
import { v4 as uuidv4 } from "uuid"; // To generate chunk UUIDs
import {
  sendChunks,
  mergeChunks,
  listFiles,
  removeFile,
} from "../utils/apiService"; // Import API methods
import "./RecordingPage.css";

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(10);
  const [chunkCount, setChunkCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [recordingName, setRecordingName] = useState("");
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const recorderRef = useRef(null);
  const intervalRef = useRef(null);
  const [chunkUuid, setChunkUuid] = useState(uuidv4());

  // Fetch recordings from the backend on mount
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await listFiles();
      setSavedRecordings(response.files || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    }
  };

  const initializeRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    recorderRef.current = new Recorder(audioContext, { onAnalysed: null });
    recorderRef.current.init(stream);
  };

  const startRecording = async () => {
    if (!recorderRef.current) await initializeRecorder();
    setIsRecording(true);
    setChunkCount(0);
    setTotalDuration(0);
    setChunkUuid(uuidv4()); // Generate a new UUID for this recording session

    recorderRef.current.start();

    intervalRef.current = setInterval(async () => {
      const { blob } = await recorderRef.current.stop();

      // Upload chunk to the backend
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(",")[1];
          await sendChunks(chunkUuid, base64Data);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error uploading chunk:", error);
      }

      recorderRef.current.start();
      setChunkCount((prev) => prev + 1);
      setTotalDuration((prev) => prev + chunkDuration);
    }, chunkDuration * 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(intervalRef.current);

    if (recorderRef.current) {
      const { blob } = await recorderRef.current.stop();

      // Upload the last chunk to the backend
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(",")[1];
          await sendChunks(chunkUuid, base64Data);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error uploading last chunk:", error);
      }

      setChunkCount((prev) => prev + 1);
    }
  };

  const mergeRecording = async () => {
    if (!recordingName.match(/^[a-zA-Z_-]+$/)) {
      alert("Recording name must only contain letters, underscores, or dashes.");
      return;
    }

    try {
      const response = await mergeChunks(chunkUuid, recordingName);
      alert(response.message);
      fetchRecordings(); // Refresh the recordings list
    } catch (error) {
      console.error("Error merging chunks:", error);
    }
  };

  const handleRemove = async (recordingName) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      try {
        const response = await removeFile(recordingName);
        alert(response.message);
        fetchRecordings(); // Refresh the recordings list
      } catch (error) {
        console.error("Error deleting recording:", error);
      }
    }
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = savedRecordings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="recording-page">
      <div className="recording-left">
        <h2>Saved Recordings</h2>
        <table className="recordings-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Name</th>
              <th>Size</th>
              <th>Recorded At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((recording, index) => (
                <tr key={recording.recording_name}>
                  <td>{startIndex + index + 1}</td>
                  <td>{recording.recording_name}</td>
                  <td>{(recording.size / 1024).toFixed(2)} KB</td>
                  <td>{new Date(recording.lastModified).toLocaleString()}</td>
                  <td>
                    <button onClick={() => window.open(recording.url, "_blank")}>
                      Play
                    </button>
                    <button onClick={() => window.open(recording.url, "_blank")}>
                      Download
                    </button>
                    <button onClick={() => handleRemove(recording.recording_name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No recordings found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage * itemsPerPage >= savedRecordings.length}
          >
            Next
          </button>
        </div>
      </div>

      <div className="recording-right">
        <div className="recording-status">
          <h3>{isRecording ? "Recording..." : "Recording Stopped"}</h3>
          <p>Total Duration: {totalDuration}s</p>
          <p>Chunks Recorded: {chunkCount}</p>
        </div>

        <div className="recording-controls">
          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={isRecording ? "stop-button" : "record-button"}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <input
            type="text"
            placeholder="Recording Name"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
          />
          <button onClick={mergeRecording} className="merge-button">
            Merge and Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
