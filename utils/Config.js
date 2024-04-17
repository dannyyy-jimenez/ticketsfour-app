import * as Updates from "expo-updates";

let Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_ENDPOINT || "http://localhost:5000/",
  isDev: process.env.EXPO_PUBLIC_IS_DEV || true,
  key: process.env.EXPO_PUBLIC_API_KEY || "",
  enableHiddenFeatures: process.env.EXPO_PUBLIC_ENABLE_HIDDEN_FEATURES || true,
};

if (Updates.channel === "production") {
  Config.apiUrl = "https://walrus-app-ooo5u.ondigitalocean.app/";
  Config.enableHiddenFeatures = false;
  Config.isDev = false;
  Config.key = "";
} else if (Updates.channel === "preview") {
  Config.apiUrl = "https://la-bodega-sandbox-api-akmu9.ondigitalocean.app/";
  Config.enableHiddenFeatures = true;
  Config.isDev = true;
  Config.key = "";
} else if (Updates.channel === "development") {
  Config.apiUrl = "http://localhost:5000/";
  Config.enableHiddenFeatures = true;
  Config.isDev = true;
  Config.key = "";
}

// Config.apiUrl = "https://la-bodega-sandbox-api-akmu9.ondigitalocean.app/";

export default Config;
