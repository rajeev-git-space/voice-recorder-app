const AWS = require("aws-sdk");
const config = require("../../config");

const s3 = new AWS.S3();

exports.mergeAudioFiles = async (fileName, chunkCount) => {
  try {
    const mergedFileKey = `merged/${fileName}.wav`;
    const chunkKeys = Array.from({ length: chunkCount }, (_, i) => `chunks/${fileName}-chunk${i + 1}`);
    
    const chunks = await Promise.all(
      chunkKeys.map((key) =>
        s3.getObject({ Bucket: config.AWS_S3_BUCKET_NAME, Key: key }).promise()
      )
    );

    const mergedBuffer = Buffer.concat(chunks.map((chunk) => chunk.Body));

    await s3
      .upload({
        Bucket: config.AWS_S3_BUCKET_NAME,
        Key: mergedFileKey,
        Body: mergedBuffer,
        ContentType: "audio/wav",
      })
      .promise();

    return mergedFileKey;
  } catch (err) {
    throw new Error("Failed to merge audio files: " + err.message);
  }
};
