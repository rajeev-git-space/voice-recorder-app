import { addAudio } from "./helpers/addAudio.mjs";
import { mergeAudio } from "./helpers/mergeAudio.mjs";
import { retrieveAudio } from "./helpers/retrieveAudio.mjs";
import { removeAudio } from "./helpers/removeAudio.mjs";

export const handler = async (event) => {
    console.log(event);
    const path = event.path;
    let response;
    try {
        switch (path) {
            case '/audio/add':
                response = await addAudio(event);
                break;
            case '/audio/merge':
                response = await mergeAudio(event);
                break;
            case '/audio/list':
                response = await retrieveAudio(event);
                break;
            case '/audio/remove':
                response = await removeAudio(event);
                break;
            default:
                response = {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Path not found' }),
                };
        }
    } catch (error) {
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
        console.log("Error: ", error);
    }

    return response;
};
