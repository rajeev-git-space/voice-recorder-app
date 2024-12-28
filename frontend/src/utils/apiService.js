const BASE_URL = "https://8jzk1yk1me.execute-api.ap-south-1.amazonaws.com/dev/audio";

export const sendChunks = async (chunkUuid, blobData) => {
  const response = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: 'cors',
    body: JSON.stringify({ chunk_uuid: chunkUuid, blob_data: blobData }),
  });
  return await response.json();
};

export const mergeChunks = async (chunkUuid, recordingName) => {
  const response = await fetch(`${BASE_URL}/merge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chunk_uuid: chunkUuid, recording_name: recordingName }),
  });
  return response.json();
};

export const listFiles = async () => {
  const response = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  return response.json();
};

export const removeFile = async (recordingName) => {
  const response = await fetch(`${BASE_URL}/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recording_name: recordingName }),
  });
  return response.json();
};
