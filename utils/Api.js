import axios from "axios";
import axiosRetry from "axios-retry";
import qs from "qs";
import { Platform, NativeModules } from "react-native";
import Config from "./Config";

const deviceLanguage =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
    : NativeModules.I18nManager.localeIdentifier;

const isIOS = Platform.OS === "ios";

axiosRetry(axios, {
  retries: 3, // Number of retries (Defaults to 3)
});

const client = axios.create({
  withCredentials: true,
  baseURL: Config.apiUrl + "api/",
});

const onSuccess = (res) => {
  if (res.data._hE) {
    return {
      isError: true,
      responseCode: res.status,
      response: res.data._e,
      data: res.data.data,
      date: new Date().getTime(),
    };
  }

  return {
    isError: false,
    responseCode: res.status,
    response: "success",
    data: res.data.data,
    date: new Date().getTime(),
  };
};

const onError = (error) => {
  if (!error.response) {
    error.response = {
      status: 500,
    };
  }
  return {
    isError: true,
    responseCode: error.response.status,
    response: error.response.data ? error.response.data._e : "error",
    data: null,
    date: new Date().getTime(),
  };
};

export default {
  IS_TEST: Config.isDev,
  get: async (query, data) => {
    try {
      let lang = deviceLanguage;
      const res = await client.get(query, {
        params: { ...data, lang, key: Config.key, isApp: true, isIOS },
      });
      return onSuccess(res);
    } catch (error) {
      return onError(error);
    }
  },
  post: async (uri, data) => {
    try {
      const res = await client.post(uri, {
        ...data,
        key: Config.key,
        isApp: true,
        isIOS,
      });

      return onSuccess(res);
    } catch (error) {
      return onError(error);
    }
  },
};
