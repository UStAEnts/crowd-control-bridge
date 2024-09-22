import config from "./config";
import lighting from "./lighting";
import axios from "axios";
import fixtures from "./fixtures";

// sends configuration to the frontend
function sendConfig() {
  // generate config to send to the frontend
  let postData = new FormData();
  postData.append("offline", "false");
  postData.append("fixtures", JSON.stringify(fixtures));

  // post config data to frontend
  axios
    .post(`${config.crowdcontrolServer}/receiveConfig.php`, postData)
    .then((response) => {
      console.log("Response Headers:", response.headers);
      console.log("Response Text:", response.data);
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });
}

sendConfig();

void lighting();
