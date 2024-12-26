import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
// import { validateListAudio } from '../validations/audioValidations.mjs';

const s3 = new S3Client();

export const retrieveAudio = async () => {
    // const { error } = validateListAudio();

    // if (error) {
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({ message: error.details[0].message }),
    //     };
    // }

    try {
        const bucketName = 'ec-voice-recorder-app';
        const response = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));

        const files = response.Contents.map((item) => ({
            key: item.Key,
            url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`,
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
