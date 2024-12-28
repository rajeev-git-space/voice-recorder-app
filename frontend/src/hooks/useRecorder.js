import { useState, useRef } from "react";
import Recorder from "recorder-js";
import { v4 as uuidv4 } from "uuid"; // To generate unique chunk UUIDs
import { sendChunks, mergeChunks } from "../utils/apiService";

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(10); // Default 10 seconds
  const [chunkCount, setChunkCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [chunkUuid, setChunkUuid] = useState(""); // Single UUID per session
  const [recordingName, setRecordingName] = useState(""); // Name for merging
  const recorderRef = useRef(null);
  const intervalRef = useRef(null);

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

    const sessionUuid = uuidv4(); // Generate a unique UUID for this session
    setChunkUuid(sessionUuid);

    recorderRef.current.start();

    intervalRef.current = setInterval(async () => {
      const { blob } = await recorderRef.current.stop();

      // Upload chunk to the backend
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(",")[1];
          await sendChunks(sessionUuid, base64Data); // Use sessionUuid for chunks
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
          await sendChunks(chunkUuid, base64Data); // Use sessionUuid for the final chunk
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
      throw new Error(
        "Recording name must only contain letters, underscores, or dashes."
      );
    }

    if (!chunkUuid) {
      throw new Error(
        "No recording session found. Please start a recording session first."
      );
    }

    try {
      const response = await mergeChunks(chunkUuid, recordingName);
      return response.message; // Return success message
    } catch (error) {
      console.error("Error merging chunks:", error);
      throw new Error("Failed to merge recordings. Please try again.");
    }
  };

  return {
    isRecording,
    chunkDuration,
    chunkCount,
    totalDuration,
    recordingName,
    setRecordingName,
    startRecording,
    stopRecording,
    mergeRecording,
    setChunkDuration, // Allow dynamic chunk duration setting
  };
};
