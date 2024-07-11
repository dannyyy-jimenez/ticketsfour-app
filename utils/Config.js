import * as Updates from "expo-updates";

let Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_ENDPOINT || "http://localhost:5000/",
  isDev: process.env.EXPO_PUBLIC_IS_DEV || true,
  key: process.env.EXPO_PUBLIC_API_KEY || "",
  enableHiddenFeatures: process.env.EXPO_PUBLIC_ENABLE_HIDDEN_FEATURES || true,
  basePath: "",
  stripeKey: "",
  cloudUri: "",
};

if (Updates.channel === "production") {
  Config.apiUrl = "https://api.ticketsfour.com/";
  Config.enableHiddenFeatures = false;
  Config.isDev = false;
  Config.key = "pdk_EcSJbumK5xZ3GUbAHWu6FqBUhNU3EpVT";
  Config.stripeKey =
    "pk_live_51ModcoA60uJAVJy3rYJnMXYon10xTdtpm0WwbF0RLD7Br8OBh1Yv0bX3DKVgLuSP2g3iMJmZSym0B0lzXUzz3UOd005fZRQUcS";
  Config.basePath = "https://www.ticketsfour.com";
  Config.cloudUri =
    "https://res.cloudinary.com/ticketsfour/image/upload/f_auto,q_auto/";
} else if (Updates.channel === "preview") {
  Config.apiUrl = "https://api.sandbox.ticketsfour.com/";
  Config.enableHiddenFeatures = true;
  Config.isDev = true;
  Config.key = "pdk_BBfHZxcHCD63ShXul7YrcrfuCwBAjGbq";
  Config.stripeKey =
    "pk_test_51ModcoA60uJAVJy3lAvcCZf59hZHewziAfKmPAFViIfPAMlb2adpnZoBUeWR0Z2eL4ZqBpoi1Qvr0F2fYw5o8El800yowWHL13";
  Config.basePath = "https://sandbox.ticketsfour.com";
  Config.cloudUri = "https://res.cloudinary.com/lgxy/image/upload/";
} else {
  Config.apiUrl = "http://10.0.0.8:5001/";
  Config.enableHiddenFeatures = true;
  Config.isDev = true;
  Config.key = "pdk_BBfHZxcHCD63ShXul7YrcrfuCwBAjGbq";
  Config.stripeKey =
    "pk_test_51ModcoA60uJAVJy3lAvcCZf59hZHewziAfKmPAFViIfPAMlb2adpnZoBUeWR0Z2eL4ZqBpoi1Qvr0F2fYw5o8El800yowWHL13";
  Config.basePath = "https://sandbox.ticketsfour.com";
  Config.cloudUri = "https://res.cloudinary.com/lgxy/image/upload/";
}

// Config.apiUrl = "https://api.ticketsfour.com/";
// Config.enableHiddenFeatures = false;
// Config.isDev = false;
// Config.key = "pdk_EcSJbumK5xZ3GUbAHWu6FqBUhNU3EpVT";
// Config.stripeKey =
//   "pk_live_51ModcoA60uJAVJy3rYJnMXYon10xTdtpm0WwbF0RLD7Br8OBh1Yv0bX3DKVgLuSP2g3iMJmZSym0B0lzXUzz3UOd005fZRQUcS";
// Config.basePath = "https://www.ticketsfour.com";
// Config.cloudUri =
//   "https://res.cloudinary.com/ticketsfour/image/upload/f_auto,q_auto/";

export default Config;
