const WebSocketEventCounter = document.getElementById("WebSocketEventCounter");

let curValue = 0;

exampleSocket.onopen = function (event) {
  log("Connected to Zoom Websocket Server!");
  // Send the command module = heartbeat to keep the connection alive every 30 seconds
  var msg = {
    module: "heartbeat",
  };
  // Send the msg object as a JSON-formatted string.
  exampleSocket.send(JSON.stringify(msg));
};

exampleSocket.onmessage = function (event) {
  // console.log(JSON.stringify(event.data));
  const data = JSON.parse(event.data);

  console.log("Formatted-Data:", data);
  console.log("Formatted-Content:", data.content);

  try {
    const contentData = JSON.parse(data.content);
    //validate Json data and log it
    if (contentData !== typeof "string") {
      console.log("Formatted-EventHook-Type:", contentData?.event);
      console.log("Formatted-Event-TimeStamp:", contentData?.event_ts);

      const wsObj = contentData.payload?.object.uuid;
      const startTime = contentData.payload?.object.start_time.split("T")[0];
      const meetingId = contentData.payload?.object.id;
      const hostId = contentData.payload?.object.host_id;

      console.log("Formatted-WS-UUID:", wsObj);
      console.log("Formatted-WS-Start_Time:", startTime);
      console.log("Formatted-WS-ID:", meetingId);
      console.log("Formatted-WS-Host_ID:", hostId);

      const participant = contentData.payload?.object.participant;
      const userId = participant?.user_id;

      console.log("Formatted-WS-User_ID: ", userId);

      logWebSocketEventData(contentData);
      logWebSocketHeartBeat2(contentData);
    }
  } catch (error) {
    console.log("Formatted-Not-JSON-Error:", data.content);
    console.log("Error:", error.message);
  }
};

var sendWebsocketHeartbeat = setInterval(function () {
  var msg = {
    module: "heartbeat",
  };
  exampleSocket.send(JSON.stringify(msg));

  // This is where you want to log the data
  // log(JSON.stringify(msg));
  logWebSocketHeartBeatCounter();
}, 25000);

exampleSocket.onclose = function (event) {
  console.log(JSON.stringify(event));
  console.log(event);
};

// Log Events
function log(text) {
  var txt = document.createTextNode(text);
  var p = document.createElement("p");

  var a = document.createElement("a");
  a.setAttribute("href", "https://github.com/DenverCoder1/readme-typing-svg");

  var img = document.createElement("img");
  img.setAttribute(
    "src",
    "https://readme-typing-svg.herokuapp.com?lines=.+.+.+sending+heartbeat+every+30+seconds+to+keep+the+connection+alive!&center=true&width=850&height=50"
  );
  a.appendChild(img);

  p.appendChild(txt);
  p.appendChild(a);
  document.body.appendChild(p);
  document.body.appendChild(a);
}

function logWebSocketHeartBeatCounter() {
  const element = document.querySelector("#webSocketcounter");

  if (element) {
    curValue++;
    element.textContent = curValue;
  }
}

//Start here
function logWebSocketHeartBeat2(content) {
  const tableBody = document.getElementById("heartbeats");
  const newRow = document.createElement("tr");

  const userIDCell = document.createElement("td");
  const participantUserIDCell = document.createElement("td");
  const join_timeCell = document.createElement("td");

  userIDCell.textContent = content.payload.object.participant.user_id;
  participantUserIDCell.textContent =
    content.payload.object.participant.participant_user_id;
  join_timeCell.textContent =
    content.payload.object.participant.join_time.split("T")[1] ;

  // Add cells to the row
  newRow.appendChild(userIDCell);
  newRow.appendChild(participantUserIDCell);
  newRow.appendChild(join_timeCell);

  // Add the row to the table body
  tableBody.appendChild(newRow);
}

function logWebSocketEvent(text) {
  var txt = document.createTextNode(text);
  var para = document.createElement("p");
  para.appendChild(txt);

  console.log("Log WebSocketEvent Function: ", txt);
  // Append to another element:
  document.getElementById("myDIV").appendChild(para);
}

function logWebSocketEventData(content) {
  const tableBody = document.querySelector("tbody");
  const newRow = document.createElement("tr");

  // Create cells for the row
  const eventTypeCell = document.createElement("td");
  const userIDCell = document.createElement("td");
  const meetingIDCell = document.createElement("td");
  const dateCell = document.createElement("td");
  const statusCell = document.createElement("td");

  // Populate cell values with data from the event
  eventTypeCell.innerHTML = `
 
  <p>${content.event}</p>`;

  dateCell.textContent = content.payload.object.start_time.split("T")[0] + " ";

  userIDCell.textContent = content.payload.object.host_id;
  meetingIDCell.textContent = content.payload.object.id + " ";

  statusCell.innerHTML = `
  <span class="status completed" >Received</span>
`;

  // Add cells to the row
  newRow.appendChild(eventTypeCell);
  newRow.appendChild(userIDCell);
  newRow.appendChild(meetingIDCell);
  newRow.appendChild(dateCell);
  newRow.appendChild(statusCell);

  // Add the row to the table body
  tableBody.appendChild(newRow);
}
