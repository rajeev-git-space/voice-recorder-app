const { uploadToS3, listFromS3 } = require("../services/s3Service");
const { mergeAudioFiles } = require("../services/mergeService");
const { validateAddAudioInput, validateMergeAudioInput } = require("../utils/validation");
const { successResponse, errorResponse } = require("../utils/response");

exports.addAudio = async (req, res) => {
  try {
    const { audioData, fileName, chunkIndex } = req.body;

    const validationError = validateAddAudioInput(req.body);
    if (validationError) return errorResponse(res, validationError, 400);

    const s3Key = `chunks/${fileName}-chunk${chunkIndex}`;
    const s3Response = await uploadToS3(audioData, s3Key);
    return successResponse(res, { message: "Chunk uploaded successfully", s3Response });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.mergeAudio = async (req, res) => {
  try {
    const { fileName, chunkCount } = req.body;

    const validationError = validateMergeAudioInput(req.body);
    if (validationError) return errorResponse(res, validationError, 400);

    const mergedFileKey = await mergeAudioFiles(fileName, chunkCount);
    return successResponse(res, { message: "Audio merged successfully", fileKey: mergedFileKey });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.listAudio = async (req, res) => {
  try {
    const recordings = await listFromS3();
    return successResponse(res, { recordings });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
