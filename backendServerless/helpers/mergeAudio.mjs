import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: 'ap-south-1' }); // Specify your AWS region

export const mergeAudio = async (event) => {
    try {
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
}