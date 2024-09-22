import config from "./config";
import lighting from "./lighting";
import axios from "axios";
import fixtures, { FixtureConfiguration, FixtureDefinition } from "./fixtures";
import { pureEntries } from "./util";

function clearFixtureProfiles(
  fixtures: FixtureConfiguration,
): Record<string, Omit<FixtureDefinition, "profile">> {
  return Object.fromEntries(
    pureEntries(fixtures).map(([key, value]) => {
      const { profile, ...rest } = value;
      return [key, rest];
    }),
  );
}

// sends configuration to the frontend
function sendConfig() {
  // generate config to send to the frontend
  let postData = new FormData();
  postData.append("offline", "false");
  postData.append("fixtures", JSON.stringify(clearFixtureProfiles(fixtures)));

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
