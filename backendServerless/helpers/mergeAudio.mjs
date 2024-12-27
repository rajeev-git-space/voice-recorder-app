import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateMergeAudio } from '../validations/audioValidations.mjs';
import fs, { promises as fsPromises } from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; // Fixed __dirname issue

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

        // Download chunks to /tmp directory
        const files = [];
        for (const item of listResponse.Contents) {
            const fileKey = item.Key;
            const getObjectResponse = await s3.send(
                new GetObjectCommand({ Bucket: tempBucket, Key: fileKey })
            );

            const filePath = `/tmp/${fileKey.split('/').pop()}`;
            const writeStream = fs.createWriteStream(filePath);
            getObjectResponse.Body.pipe(writeStream);
            files.push(filePath);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
        }

        // Set paths for ffmpeg binary and output file
        const ffmpegPath = join(__dirname, 'ffmpeg'); // Reference the included binary
        const outputFilePath = `/tmp/${recording_name}.webm`;

        // Merge audio using ffmpeg
        await new Promise((resolve, reject) => {
            exec(
                `${ffmpegPath} -i "concat:${files.join('|')}" -c copy ${outputFilePath}`,
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Read the merged file and upload it to the final S3 bucket
        const fileContent = await fsPromises.readFile(outputFilePath);
        await s3.send(
            new PutObjectCommand({
                Bucket: finalBucket,
                Key: recording_name,
                Body: fileContent,
                ContentType: 'audio/webm',
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Audio merged and uploaded successfully.' }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error during merge operation.', error: err.message }),
        };
    }
};
