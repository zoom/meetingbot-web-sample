const asyncHandler = require("express-async-handler");

require("dotenv").config();
const KJUR = require("jsrsasign");

const {
  getZoomAPIAccessToken,
  makeZoomAPIRequest,
} = require("../api/zoomAPI.js");

const { clickJoinMeetingButton } = require("../helpers/meetingBot.js");

/// TODO
const handleGetMeetingDetails = async (meetingNumber) => {
  const role = 0; // 0 = Attendee, 1 = Host

  // Make a request to the Zoom API to get the meeting details and ZAK token
  const getAMeeting = await makeZoomAPIRequest(
    "GET",
    `https://api.zoom.us/v2/meetings/${meetingNumber}`
  );
  const getUserZakToken = await makeZoomAPIRequest(
    "GET",
    "https://api.zoom.us/v2/users/me/token?type=zak"
  );

  // Get firstName,  and PassWord from response body
  const { firstName, passWord } = getAMeeting;

  // Get ZAK token from response body
  const { zakToken } = getUserZakToken;

  // Generate a signature using the meeting details
  const signature = generateSDKSignatureFunc(meetingNumber, role);

  // Append Bot to end of firstName and append  random number appended to string
  const createDisplayName =
    firstName + "Bot" + Math.floor(Math.random() * 1000);

  //create new object with all the data
  const meetingDetails = {
    signature,
    meetingNumber,
    passWord,
    role,
    createDisplayName,
    zakToken,
  };

  return meetingDetails;
};

const generateSDKSignature = asyncHandler(async (req, res) => {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  console.log("generateSDKSignature", req.body.meetingNumber, req.body.role);

  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    sdkKey: process.env.ZOOM_MSDK_KEY,
    mn: req.body.meetingNumber,
    role: req.body.role,
    iat: iat,
    exp: exp,
    tokenExp: iat + 60 * 60 * 2,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign(
    "HS256",
    sHeader,
    sPayload,
    process.env.ZOOM_MSDK_SECRET
  );

  res.json({
    signature: signature,
  });
});

// To Remove
const getMeetingDetails = asyncHandler(async (req, res) => {
  try {
    // Make a request to the Zoom API to get the meeting details and ZAK token
    // const meetingDetails =  await makeZoomAPIRequest("GET", "https://api.zoom.us/v2/users/me/token?type=zak")

    res.status(201).json({ id: "94992962195", passWord: "371741" });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

const getHostZAKToken = asyncHandler(async (req, res) => {
  try {
    const { token } = await makeZoomAPIRequest(
      "GET",
      "https://api.zoom.us/v2/users/me/token?type=zak"
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

module.exports = {
  generateSDKSignature,
  getMeetingDetails,
  getHostZAKToken,
};
