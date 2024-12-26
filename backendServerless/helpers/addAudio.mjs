import { S3Client, PutObjectCommand } from "aws-sdk/clients/s3";
const s3 = new S3Client({ region: 'ap-south-1' }); // Specify your AWS region

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

        // Use the PutObjectCommand to upload the file
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'audio/webm',
        });

        await s3.send(command);

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
