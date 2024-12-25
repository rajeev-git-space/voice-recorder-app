exports.validateAddAudioInput = ({ audioData, fileName, chunkIndex }) => {
    if (!audioData || !fileName || chunkIndex === undefined) return "audioData, fileName, and chunkIndex are required";
    return null;
  };
  
  exports.validateMergeAudioInput = ({ fileName, chunkCount }) => {
    if (!fileName || !chunkCount) return "fileName and chunkCount are required";
    if (chunkCount <= 0) return "chunkCount must be greater than 0";
    return null;
  };
  