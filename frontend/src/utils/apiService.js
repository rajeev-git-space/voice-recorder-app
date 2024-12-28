import { toast } from 'react-toastify';

const BASE_URL = "https://8jzk1yk1me.execute-api.ap-south-1.amazonaws.com/dev/audio";

export const sendChunks = async (chunkUuid, blobData) => {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chunk_uuid: chunkUuid, blob_data: blobData }),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload chunk: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    toast.error(error.message, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2000,
    });
  }
};

export const mergeChunks = async (chunkUuid, recordingName) => {
  try {
    const response = await fetch(`${BASE_URL}/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chunk_uuid: chunkUuid, recording_name: recordingName }),
    });
    return response.json();
  } catch (error) {
    toast.error(error.message, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2000,
    });
  }
};

export const listFiles = async () => {
  try {
    const response = await fetch(`${BASE_URL}/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    return response.json();
  } catch (error) {
    toast.error(error.message, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2000,
    });
  }
};

export const removeFile = async (recordingName) => {
  try {
    const response = await fetch(`${BASE_URL}/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recording_name: recordingName }),
    });
    return response.json();
  } catch (error) {
    toast.error(error.message, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2000,
    });
  }
};
