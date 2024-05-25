import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSession } from "../utils/ctx";
import { router } from "expo-router";
import Api from "../utils/Api";
import { Image } from "expo-image";
import ActionSheet from "react-native-actions-sheet";
import Styles, { theme } from "../utils/Styles";
import { HoldItem } from "react-native-hold-menu";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useLocalization } from "../locales/provider";
import { PhoneFormatter, ReplaceWithStyle } from "../utils/Formatters";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useFonts } from "expo-font";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function LoginScreen() {
  const { i18n } = useLocalization();
  const actionSheetRef = React.useRef(null);
  const { width, height } = Dimensions.get("window");
  const { session, signIn, setDefaultOrganization } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("US");
  const countryCodeEmoji = React.useMemo(() => {
    if (countryCode == "MX") return "🇲🇽";
    if (countryCode == "CA") return "🇨🇦";

    return "🇺🇸";
  });
  const canReceiveOTP = React.useMemo(() => {
    return phoneNumber != "";
  }, [phoneNumber]);
  const [awaitingOTP, setAwaitingOTP] = React.useState(false);
  const [otp, setOTP] = React.useState("");
  const [loginToken, setLoginToken] = React.useState(null);
  const codeFields = React.useMemo(() => {
    return otp.slice(0, 8).padEnd(8, " ").split("");
  }, [otp]);
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../assets/Flix-Normal.otf"),
  });

  const countryCodeItems = [
    { text: "Change Country Code", isTitle: true },
    { text: "+1 - United States", onPress: () => setCountryCode("US") },
    //{ text: "+1 - Canda", onPress: () => setCountryCode("CA") },
    //{ text: "+52 - Mexico", onPress: () => setCountryCode("MX") },
  ];

  const onOTP = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await Api.post("/otp", {
        phone: phoneNumber,
      });
      if (res.isError) throw res?.data?.message;

      setIsLoading(false);
      setAwaitingOTP(true);
      setLoginToken(res.data.usat);
    } catch (e) {
      if (e == "ACCOUNT_LOCKED" || e == "NO_ACCOUNT" || e == "TIMEOUT")
        setError(e);

      setIsLoading(false);
    }
  };

  const onLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      let res = await Api.post("/login", {
        phone: phoneNumber,
        otp: otp,
        token: loginToken,
      });
      if (res.isError) throw res?.data?.message;

      setDefaultOrganization(res.data.default_org);
      setIsLoading(false);
      signIn(res.data.usid);
    } catch (e) {
      console.log(e);

      if (
        e == "WRONG_TOKEN" ||
        e == "INVALID_SESSION" ||
        e == "LOCKED_ACCOUNTT"
      )
        setError(e);

      setIsLoading(false);
    }
  };

  const asGuest = () => {
    signIn("GUEST");
  };

  React.useEffect(() => {
    if (!session) return;

    router.push("/events");
  }, [session]);

  React.useEffect(() => {
    actionSheetRef.current?.show();
    SplashScreen.hideAsync();
  }, []);

  React.useEffect(() => {
    setPhoneNumber(PhoneFormatter(phoneNumber));
  }, [phoneNumber]);

  return (
    <KeyboardAvoidingView behavior="position">
      <StatusBar style="light" />
      <TouchableWithoutFeedback
        style={{ height, width }}
        onPress={Keyboard.dismiss}
      >
        <View
          style={{ height, width, backgroundColor: theme["color-primary-500"] }}
        >
          <Text
            style={[
              Styles.text.basic,
              Styles.text.xxl,
              {
                fontFamily: "Flix-Normal",
                alignSelf: "center",
                letterSpacing: 1.5,
                fontSize: 40,
                top: height * 0.08,
              },
            ]}
          >
            Tickets Four
          </Text>
          <LottieView
            autoPlay
            style={{
              width: 300,
              height: 300,
              top: height * 0.06,
              alignSelf: "center",
            }}
            // Find more Lottie files at https://lottiefiles.com/featured
            source={require("../assets/lottie-register.json")}
          />
          <ActionSheet
            keyboardHandlerEnabled={false}
            gestureEnabled={false}
            useBottomSafeAreaPadding
            closable={false}
            isModal
            backgroundInteractionEnabled
            closeOnTouchBackdrop={false}
            ref={actionSheetRef}
            containerStyle={{
              padding: 20,
              paddingHorizontal: 20,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Pressable onPress={Keyboard.dismiss}>
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <Image
                  style={{ width: 250, height: 70 }}
                  contentFit="contain"
                  source={require("../assets/wordmark-red.png")}
                /> */}
                {awaitingOTP && (
                  <>
                    <Text
                      style={[
                        Styles.text.xxl,
                        Styles.transparency.md,
                        Styles.text.semibold,
                        { width: width * 0.85, marginTop: 30 },
                      ]}
                    >
                      {i18n.t("checkMessages")}
                    </Text>
                    <Text
                      style={[
                        Styles.transparency.lg,
                        { width: width * 0.85, marginTop: 8 },
                      ]}
                    >
                      {i18n.t("sentOTP")}
                    </Text>

                    {error && (
                      <Text
                        style={[
                          Styles.text.md,
                          Styles.text.bold,
                          Styles.text.danger,
                          { marginTop: 10 },
                        ]}
                      >
                        {i18n.t(error)}
                      </Text>
                    )}

                    <View
                      style={[
                        {
                          width: width - 40,
                          marginVertical: 30,
                          marginBottom: 60,
                          justifyContent: "space-evenly",
                          flexDirection: "row",
                        },
                      ]}
                    >
                      {codeFields.map((c, idx) => (
                        <View
                          key={"otp-" + idx}
                          style={[
                            Styles.input.otp,
                            otp.length == idx ? Styles.border.primaryDark : {},
                          ]}
                        >
                          <Text style={[Styles.text.lg, Styles.text.semibold]}>
                            {c}
                          </Text>
                        </View>
                      ))}
                      <TextInput
                        autoFocus
                        style={{
                          opacity: 0,
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          textAlign: "center",
                        }}
                        autoComplete="sms-otp"
                        onChangeText={(_otp) => setOTP(_otp.slice(0, 8))}
                      />
                    </View>

                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color={theme["color-primary-500"]}
                      />
                    )}
                    {!isLoading && (
                      <TouchableOpacity
                        disabled={otp.length != 8}
                        onPress={onLogin}
                        style={[
                          Styles.button.container,
                          otp.length != 8 ? Styles.button.disabled : {},
                          { width: width - 40, marginBottom: 10 },
                        ]}
                      >
                        <Text
                          style={[Styles.button.text, Styles.text.semibold]}
                        >
                          {i18n.t("login")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {!awaitingOTP && (
                  <>
                    <Text
                      style={[
                        Styles.text.bold,
                        Styles.text.dark,
                        { marginVertical: 10, fontSize: 42 },
                      ]}
                    >
                      {i18n.t("helloAgain")}
                    </Text>
                    <Text
                      style={[
                        Styles.transparency.lg,
                        Styles.text.lg,
                        {
                          width: width * 0.85,
                          textAlign: "center",
                          marginTop: 8,
                        },
                      ]}
                    >
                      {i18n.t("pleaseEnterPhone")}
                    </Text>

                    {error && (
                      <Text
                        style={[
                          Styles.text.md,
                          Styles.text.bold,
                          Styles.text.danger,
                          { marginTop: 5 },
                        ]}
                      >
                        {i18n.t(error)}
                      </Text>
                    )}

                    <View
                      style={[
                        Styles.input.container,
                        {
                          width: width - 40,
                          marginVertical: 30,
                          marginBottom: 60,
                        },
                      ]}
                    >
                      <HoldItem
                        closeOnTap
                        menuAnchorPosition="bottom-left"
                        activateOn="tap"
                        hapticFeedback="Heavy"
                        items={countryCodeItems}
                      >
                        <View style={[Styles.input.prefix]}>
                          <Text style={Styles.text.lg}>{countryCodeEmoji}</Text>
                        </View>
                      </HoldItem>
                      <TextInput
                        autoComplete="tel"
                        enterKeyHint="next"
                        style={[Styles.input.text]}
                        placeholder={i18n.t("phoneNumber")}
                        inputMode="tel"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(val) => setPhoneNumber(val)}
                      />
                    </View>

                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color={theme["color-primary-500"]}
                      />
                    )}
                    {!isLoading && (
                      <TouchableOpacity
                        disabled={!canReceiveOTP}
                        onPress={onOTP}
                        style={[
                          Styles.button.container,
                          !canReceiveOTP ? Styles.button.disabled : {},
                          { width: width - 40, marginBottom: 10 },
                        ]}
                      >
                        <Text
                          style={[Styles.button.text, Styles.text.semibold]}
                        >
                          {i18n.t("next")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <TouchableOpacity
                  onPress={() => router.push("/register")}
                  style={[{ marginTop: 20, marginBottom: 10 }]}
                >
                  <Text style={[Styles.text.semibold, Styles.text.dark]}>
                    {i18n.t("noAccount")}{" "}
                    <Text style={[Styles.text.primary, Styles.text.semibold]}>
                      {i18n.t("signUp")}
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={asGuest} style={[{ marginTop: 5 }]}>
                  <Text style={[Styles.text.dark, Styles.text.semibold]}>
                    {i18n.t("continueAsGuest")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </ActionSheet>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
