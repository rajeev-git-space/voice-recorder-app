import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client();

export const retrieveAudio = async () => {

    try {
        const bucketName = 'ec-voice-recorder-app';
        const response = await s3.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: 'merged-audio/' }));
        console.log('Response:', response);
        if (!response.Contents?.length) {
            throw new Error("No Audio Saved!");
        }
        const files = response.Contents.map((item) => ({
            key: item.Key,
            url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`,
            lastModified: item.LastModified,
            size: item.Size,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ files }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error listing audio files.', error: err.message }),
        };
    }
};
