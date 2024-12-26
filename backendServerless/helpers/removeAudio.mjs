import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { validateRemoveAudio } from '../validations/audioValidations.mjs';

const s3 = new S3Client();

export const removeAudio = async (event) => {
    const input = JSON.parse(event.body);
    const { error } = validateRemoveAudio(input);

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.details[0].message }),
        };
    }

    const { recording_name } = input;
    const bucketName = 'ec-voice-recorder-app';

    try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: recording_name }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Audio file removed successfully.' }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error removing audio file.', error: err.message }),
        };
    }
};
