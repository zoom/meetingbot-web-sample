const express = require("express");

const router = express.Router();
const {
  generateSDKSignature,
  getHostZAKToken,
  getMeetingDetails,
} = require("../controllers/zoomControllers.js");

router.route("/").get();

// Get MSDK Signature Route
router.route("/msig").post(generateSDKSignature);

// Get ZAK token Of Meeting Host
router.route("/hzak").get(getHostZAKToken);

// Get Meeting Details for Meeting Host
router.route("/mnum").get(getMeetingDetails);

module.exports = router; // Export the router so it can be used in server.js
