ZoomMtg.setZoomJSLib('https://source.zoom.us/2.13.0/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')


var authEndpoint = "http://localhost:30015/api/zoom/msig";
var zakEndpoint = "http://localhost:30015/api/zoom/hzak";
var meetingDetailsEndpoint = "http://localhost:30015/api/zoom/mnum";

var sdkKey = "Enter your SDK Key";

var url = 'Enter your Meeting Invite URL';


var {meetingNumber, password} = getMeetingNumberAndPasswordFromUrl(url)

// API Response data from the backend server.js ~ MAKE DYNAMIC
var meetingNumber = meetingNumber;
var passWord = password;

// -----------------------------------
var role = 0; // 1 for host; 0 for attendee or webinar
var userName = "{Enter Name}'s Bot";

var getlocalRecordingToken = "";

var registrantToken = ''
var zakToken = ''
var leaveUrl = 'enter your Leave url'



function getSignature() {
  fetch(authEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetingNumber: meetingNumber,
      role: role
    })
  }).then((response) => {
    return response.json()
  }).then((data) => {
    console.log(data)
    startMeeting(data.signature)
  }).catch((error) => {
  	console.log(error)
  })
}


function startMeeting(signature) {

  document.getElementById('zmmtg-root').style.display = 'block'

  ZoomMtg.init({
    leaveUrl: leaveUrl,
    disablePreview: true, // Add this line
    success: (success) => {
      console.log(success)
      ZoomMtg.join({
        signature: signature,
        sdkKey: sdkKey,
        meetingNumber: meetingNumber,
        passWord: passWord,
        userName: userName,
        tk: registrantToken,
        zak: zakToken,
        success: handleJoinSuccess,
        error: handleLeaveError,
        
      })
    },
    error: (error) => {
      console.log(error)
    }
  })
}

// ------------- Bot Helper functions ------------------//
function handleJoinAudioClick() {
  var buttonFound = false;

  var t = setInterval(function () {
    var startButton = document.getElementsByClassName(
      "join-audio-by-voip__join-btn"
    )[0];

    if (startButton && !startButton.disabled) {
      console.log("Frontend: button not found");
      buttonFound = true;
      startButton.click();
    }

    var startButton = document.getElementsByClassName(
      "join-audio-by-voip__join-btn"
    )[0];

    console.log("Frontend: button found");

    if (startButton == null && buttonFound) {
      clearInterval(t);
    }
  }, 500);
}

function handleDisableVideoClick() {
  var buttonFound = false;

  var startButton = document.getElementsByClassName(
    "send-video-container__btn"
  )[0];

  function handleClick() {
    if (startButton && !startButton.disabled) {
      console.log("Frontend: button not found");
      buttonFound = true;
      startButton.click();
      startButton.removeEventListener("click", handleClick);
    }
  }

  if (startButton) {
    startButton.addEventListener("click", handleClick);
    console.log("Video Button found");
  }
}

function handleJoinSuccess(success) {
  console.log(success, 'join meeting success');

  // Not working has expected!
   handleJoinAudioClick();
   handleDisableVideoClick();

  startMediaCapturePermissionTimer();
  setupMediaCaptureListeners();
}

function startMediaCapturePermissionTimer() {

 
  setInterval(() => {
    requestMediaCapturePermission();
    console.log('pinging every 15 seconds');
  }, 15000);
}

function requestMediaCapturePermission() {
  ZoomMtg.mediaCapturePermission({
    operate: 'request',
    success: handleMediaCapturePermissionSuccess,
    error: handleMediaCapturePermissionError
  });
}

function handleMediaCapturePermissionSuccess(success) {
  console.log(success, 'media capture permission success');
  if (success.allow) {

    startMediaCapture();
    console.log('Media capture permission changed to ALLOW');
  } else {
    stopMediaCapture();
    console.log('Media capture permission changed to DENY');
    leaveMeetingAndHandleError();
  }
}

function handleMediaCapturePermissionError(error) {
  if (error.errorCode == '1') {
    console.log('Media capture permission Active');
    startMediaCapture();
  } else {
    console.log(error, 'media capture permission error');
  }
}

function startMediaCapture() {
  ZoomMtg.mediaCapture({ record: "start" });
}

function stopMediaCapture() {
  ZoomMtg.mediaCapture({ record: "stop" });
}
function pauseMediaCapture() {
  ZoomMtg.mediaCapture({ record: "pause" });
}

function leaveMeetingAndHandleError() {
  ZoomMtg.leaveMeeting({
    success: handleLeaveSuccess,
    error: handleLeaveError
  });
}

function handleLeaveSuccess(success) {
  console.log(success, 'Bot has left the meeting');
}

function handleLeaveError(error) {
  console.log(error, 'Bot failed to leave the meeting, use visibilityState of hidden to trigger leave');
  setupAccidentalLeaveListener(document, ZoomMtg);
}

function setupAccidentalLeaveListener(doc, zoom) {
  doc.addEventListener("visibilitychange", function() {
    if (doc.visibilityState === 'hidden') {
      zoom.leaveMeeting()
    }
  });
}

function setupMediaCaptureListeners() {
  ZoomMtg.inMeetingServiceListener('onMediaCapturePermissionChange', handleMediaCapturePermissionChange);
  ZoomMtg.inMeetingServiceListener('onMediaCaptureStatusChange', handleMediaCaptureStatusChange);
  ZoomMtg.inMeetingServiceListener('onUserLeave', handleUserLeave);
}

function handleMediaCapturePermissionChange({  allow: boolean }) {
  console.log('onMediaCapturePermissionChange --> ', boolean );
  if (boolean ) {
    startMediaCapture();
    console.log('Media capture permission changed to ALLOW');
  } else {
    console.log('Media capture permission changed to DENY');
    stopMediaCapture();
    leaveMeetingAndHandleError();
  }
}

function handleMediaCaptureStatusChange(data) {
  console.log('onMediaCaptureStatusChange --> ', data);
  const { status, userId } = data;
  
  console.log('onMediaCaptureStatusChange --> ', userId);
  // Add your logic for handling media capture status change here

  ZoomMtg.mute({ userId: userId, mute: true });
  
}

function handleUserLeave(data) {
  setupAccidentalLeaveListener(document, ZoomMtg);
  console.log(data, "Detected user left meeting, stopping recording");
}

function handleJoinError(error) {
  console.log(error);
}

//function to get the meeting number and passwork from the url
function getMeetingNumberAndPasswordFromUrl(url) {
  const splitUrl = url.split('?')[0];

  if (!splitUrl) {
    return {
      meetingNumber: null,
      password: null
    };
  }

  const meetingNumber = splitUrl.substring(splitUrl.lastIndexOf('/') + 1);

  const queryString = url.split('?')[1];
  const password = queryString ? queryString.split('pwd=')[1] : null;

  return {
    meetingNumber,
    password
  };
}