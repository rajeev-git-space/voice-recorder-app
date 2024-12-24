import React, { useState, useRef } from 'react';
import Recorder from 'recorder-js';
import './RecordingPage.css';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(10);
  const [chunkCount, setChunkCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const recorderRef = useRef(null);
  const intervalRef = useRef(null);

  // Simulate API call for fetching recordings
  const fetchRecordings = () => {
    setSavedRecordings([
      {
        id: 1,
        name: 'Recording 1',
        chunkCount: 5,
        totalDuration: '50 sec',
        recordedAt: '2024-12-24 10:00 AM',
      },
      {
        id: 2,
        name: 'Recording 2',
        chunkCount: 3,
        totalDuration: '30 sec',
        recordedAt: '2024-12-24 11:00 AM',
      },
      // Add more recordings to simulate pagination
      ...Array.from({ length: 12 }, (_, i) => ({
        id: i + 3,
        name: `Recording ${i + 3}`,
        chunkCount: Math.floor(Math.random() * 5) + 1,
        totalDuration: `${Math.floor(Math.random() * 60) + 10} sec`,
        recordedAt: `2024-12-24 ${10 + (i % 12)}:00 AM`,
      })),
    ]);
  };

  // Initialize recorder
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
    setRecordedChunks([]);

    recorderRef.current.start();

    intervalRef.current = setInterval(async () => {
      const { blob } = await recorderRef.current.stop();

      setRecordedChunks((prev) => [...prev, blob]);
      setChunkCount((prev) => prev + 1);
      setTotalDuration((prev) => prev + chunkDuration);

      recorderRef.current.start();
    }, chunkDuration * 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(intervalRef.current);
    if (recorderRef.current) {
      const { blob } = await recorderRef.current.stop();
      const recordedTime = Math.floor(performance.now() / 1000) % chunkDuration;
      setRecordedChunks((prev) => [...prev, blob]);
      setTotalDuration((prev) => prev + recordedTime);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleChunkDurationChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 1), 60); // Ensure 1-60 range
    setChunkDuration(value);
  };

//   const handlePlayAudio = () => {
//     if (recordedChunks.length === 0) {
//       alert('No audio chunks recorded yet!');
//       return;
//     }

//     const audioURL = URL.createObjectURL(new Blob(recordedChunks));
//     const audio = new Audio(audioURL);
//     audio.play();
//   };

  const handleMerge = () => {
    alert('Merging chunks and sending to the backend (placeholder for API integration)');
  };

  const handlePlaySavedRecording = () => {
    if (recordedChunks.length === 0) {
      alert('No audio chunks recorded yet!');
      return;
    }
    const mergedBlob = new Blob(recordedChunks);
    const audioURL = URL.createObjectURL(mergedBlob);
    const audio = new Audio(audioURL);
    audio.play();
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  React.useEffect(() => {
    fetchRecordings();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = savedRecordings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="recording-page">
      <div className="recording-left">
        <h2>Saved Recordings</h2>
        <table className="recordings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Chunks</th>
              <th>Total Duration</th>
              <th>Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((recording) => (
                <tr key={recording.id}>
                  <td>{recording.name}</td>
                  <td>{recording.chunkCount}</td>
                  <td>{recording.totalDuration}</td>
                  <td>{recording.recordedAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No recordings found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <button onClick={nextPage} disabled={startIndex + itemsPerPage >= savedRecordings.length}>Next</button>
        </div>
      </div>

      <div className="recording-right">
        <h1>Voice Recorder</h1>
        <div className="chunk-duration">
          <label>Chunk Duration (seconds): </label>
          <input
            type="number"
            value={chunkDuration}
            onChange={handleChunkDurationChange}
            min="1"
            max="60"
            disabled={isRecording}
          />
        </div>

        <div className="recording-status">
          <p><strong>Chunks Recorded:</strong> {chunkCount}</p>
          <p><strong>Total Duration:</strong> {totalDuration} sec</p>
        </div>

        <div className="recording-controls">
          <button
            onClick={toggleRecording}
            className={isRecording ? 'stop-button' : 'record-button'}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <button onClick={handlePlaySavedRecording} className="play-button">
            Play Recorded Audio
          </button>

          <button onClick={handleMerge} className="merge-button" disabled={chunkCount === 0}>
            Merge Chunks
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
