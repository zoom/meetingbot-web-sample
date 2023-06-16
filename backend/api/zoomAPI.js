require("dotenv").config();
const axios = require("axios");
const btoa = require("btoa");

const getZoomAPIAccessToken = async () => {
  try {
    base_64 = btoa(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET);

    const resp = await axios({
      method: "POST",
      url:
        "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
        `${process.env.ACCOUNT_ID}`,
      headers: {
        Authorization: "Basic" + `${base_64} `,
      },
    });

    return resp.data.access_token;
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
};

console.log(getZoomAPIAccessToken());

/**
 * Generic function for making requests to the Zoom API
 * @param {string} method - Request method
 * @param {string | URL} endpoint - Zoom API Endpoint
 * @param {string} token - Access Token
 * @param {object} [data=null] - Request data
 */
const makeZoomAPIRequest = async (method, endpoint, data = null) => {
  try {
    const resp = await axios({
      method: method,
      url: endpoint,
      headers: {
        Authorization: "Bearer " + `${await getZoomAPIAccessToken()} `,
        "Content-Type": "application/json",
      },
    });

    console.log("ZakMeeting", resp.data);

    return resp.data;
  } catch (err) {
    if (err.status == undefined) {
      console.log("Error : ", err);
    }
  }
};

module.exports = {
  getZoomAPIAccessToken,
  makeZoomAPIRequest,
};
