const AWS = require('aws-sdk');
const S3 = new AWS.S3();

module.exports = async (event) => {
    const { chunk_uuid, blob_data } = JSON.parse(event.body);

    if (!chunk_uuid || !blob_data) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'chunk_uuid and blob_data are required.' }),
        };
    }

    const bucketName = 'temporary-audio-chunks';
    const key = `${chunk_uuid}/${Date.now()}.webm`;

    try {
        const buffer = Buffer.from(blob_data, 'base64');
        await S3.putObject({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'audio/webm',
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Audio chunk uploaded successfully.', key }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error uploading audio chunk.', error: error.message }),
        };
    }
};
