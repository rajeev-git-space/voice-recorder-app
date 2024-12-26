const addAudio = require('./helpers/addAudio');
const mergeAudio = require('./helpers/mergeAudio');
const retrieveAudio = require('./helpers/retrieveAudio');

exports.handler = async (event) => {
    const path = event.path;
    let response;
    console.log(event);
    try {
        switch (path) {
            case '/audio/add':
                response = await addAudio(event);
                break;
            case '/audio/merge':
                response = await mergeAudio(event);
                break;
            case '/audio/retrieve':
                response = await retrieveAudio(event);
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
    }

    return response;
};
