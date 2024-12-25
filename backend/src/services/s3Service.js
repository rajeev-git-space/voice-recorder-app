const AWS = require("aws-sdk");
const config = require("../../config");

const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
});

exports.uploadToS3 = async (data, key) => {
  const params = {
    Bucket: config.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(data, "base64"),
    ContentType: "audio/wav",
  };
  return s3.upload(params).promise();
};

exports.listFromS3 = async () => {
  const params = { Bucket: config.AWS_S3_BUCKET_NAME };
  const data = await s3.listObjectsV2(params).promise();
  return data.Contents.map((item) => ({
    fileName: item.Key,
    lastModified: item.LastModified,
  }));
};
