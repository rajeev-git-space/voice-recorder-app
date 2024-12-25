const express = require("express");
const { addAudio, mergeAudio, listAudio } = require("../controllers/audioController");

const router = express.Router();

// Endpoints for audio management
router.post("/audio/add", addAudio);
router.post("/audio/merge", mergeAudio);
router.get("/audio/list", listAudio);

module.exports = router;
