import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { validateMergeAudio } from '../validations/audioValidations.mjs';

const s3 = new S3Client();

export const mergeAudio = async (event) => {
    const input = JSON.parse(event.body);
    const { error } = validateMergeAudio(input);

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.details[0].message }),
        };
    }

    const { chunk_uuid, recording_name } = input;
    const tempBucket = 'temporary-audio-chunks';
    const finalBucket = 'ec-voice-recorder-app';

    try {
        // Fetch list of chunks
        const listResponse = await s3.send(
            new ListObjectsV2Command({ Bucket: tempBucket, Prefix: `${chunk_uuid}/` })
        );
        console.log('List Response:', listResponse.Contents?.length);
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No audio chunks found for the given chunk_uuid.' }),
            };
        }

        // Check for unique recording name
        const nameCheck = await s3.send(
            new ListObjectsV2Command({ Bucket: finalBucket, Prefix: recording_name })
        );
        
        if (nameCheck.Contents && nameCheck.Contents.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Recording name already exists.' }),
            };
        }

        // Download chunks
        const chunks = [];
        for (const item of listResponse.Contents) {
            const fileKey = item.Key;
            const getObjectResponse = await s3.send(
                new GetObjectCommand({ Bucket: tempBucket, Key: fileKey })
            );

            const data = await streamToBuffer(getObjectResponse.Body);
            chunks.push(data);
        }

        // Concatenate all audio chunks
        const mergedBuffer = Buffer.concat(chunks);

        // Upload merged file to the final S3 bucket
        await s3.send(
            new PutObjectCommand({
                Bucket: finalBucket,
                Key: recording_name,
                Body: mergedBuffer,
                ContentType: 'audio/webm',
            })
        );

        // Delete chunks from temporary bucket
        const deleteTemporyChunks = { // DeleteObjectRequest
            Bucket: tempBucket, // required
            Key: chunk_uuid, // required
        };
        await s3.send(new DeleteObjectCommand(deleteTemporyChunks));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Audio merged and uploaded successfully.' }),
        };
    } catch (err) {
        console.error('Error during merge operation:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error during merge operation.', error: err.message }),
        };
    }
};

// Utility function to convert a stream to a buffer
const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};
