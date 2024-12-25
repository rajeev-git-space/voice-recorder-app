exports.handler = async (event) => {
    const { httpMethod, resource } = event;
  
    if (httpMethod === "POST") {
      switch (resource) {
        case "/audio/add":
          return require("./controllers/audioController").addAudio(event);
        case "/audio/merge":
          return require("./controllers/audioController").mergeAudio(event);
        case "/audio/list":
          return require("./controllers/audioController").listAudio(event);
        default:
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Route not found" }),
          };
      }
    }
  
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  };
  