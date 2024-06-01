import React from "react";
import {
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
import {
  DateFormatter,
  EmailValidator,
  PhoneFormatter,
  ReplaceWithStyle,
} from "../utils/Formatters";
import LottieView from "lottie-react-native";
import { useFonts } from "expo-font";
import moment from "moment";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function RegisterScreen() {
  const { i18n } = useLocalization();

  const actionSheetRef = React.useRef(null);
  const { width, height } = Dimensions.get("window");
  const { session, signIn } = useSession();

  const [isLoading, setIsLoading] = React.useState(false);
  const firstNameInput = React.useRef(null);
  const lastNameInput = React.useRef(null);
  const phoneInput = React.useRef(null);
  const companyCodeInput = React.useRef(null);
  const emailInput = React.useRef(null);
  const dobInput = React.useRef(null);
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../assets/Flix-Normal.otf"),
  });

  const [error, setError] = React.useState(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const [countryCode, setCountryCode] = React.useState("US");
  const countryCodeEmoji = React.useMemo(() => {
    if (countryCode == "MX") return "🇲🇽";
    if (countryCode == "CA") return "🇨🇦";

    return "🇺🇸";
  });
  const countryCodeItems = [
    { text: "Change Country Code", isTitle: true },
    { text: "+1 - United States", onPress: () => setCountryCode("US") },
    { text: "+1 - Canda", onPress: () => setCountryCode("CA") },
    { text: "+52 - Mexico", onPress: () => setCountryCode("MX") },
  ];

  const canRegister = React.useMemo(() => {
    if (!moment(dob, "MM-DD-YYYY").isValid()) return false;

    try {
      let bday = moment(dob, "MM-DD-YYYY");
      let today = moment();

      if (today.diff(bday, "y") < 13) throw "AGE";
    } catch (e) {
      return false;
    }

    return (
      firstName !== "" &&
      lastName !== "" &&
      email !== "" &&
      EmailValidator(email) &&
      phoneNumber != "" &&
      phoneNumber.replace(/[^0-9\.]+/g, "").length == 10
    );
  }, [firstName, lastName, phoneNumber, email, dob]);

  const onRegister = async () => {
    setError(null);
    setIsLoading(true);
    let dobF = moment(dob, "MM-DD-YYYY").format("YYYY-MM-DD");

    try {
      const res = await Api.post("/register", {
        firstName,
        lastName,
        phone: phoneNumber,
        email,
        dob: dobF,
        countryCode,
        type: "app",
      });
      console.log(res);
      if (res.isError) throw res.data.message;

      setIsLoading(false);
      signIn(res.data.usid);
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!session) return;

    router.push("/common");
  }, [session]);

  React.useEffect(() => {
    actionSheetRef.current?.show();
  }, []);

  React.useEffect(() => {
    setPhoneNumber(PhoneFormatter(phoneNumber));
  }, [phoneNumber]);

  React.useEffect(() => {
    setDob(DateFormatter(dob));
  }, [dob]);

  return (
    <KeyboardAvoidingView behavior="position">
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
          <ActionSheet
            keyboardHandlerEnabled={false}
            gestureEnabled={false}
            useBottomSafeAreaPadding
            closable={false}
            backgroundInteractionEnabled
            closeOnTouchBackdrop={false}
            ref={actionSheetRef}
            isModal
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
                <Text
                  style={[
                    Styles.text.lg,
                    Styles.text.primary,
                    Styles.text.normal,
                    { marginTop: 10, alignSelf: "flex-start" },
                  ]}
                >
                  {i18n.t("joinTheParty")}
                </Text>
                <Text
                  style={[
                    Styles.text.bold,
                    Styles.text.dark,
                    {
                      marginVertical: 10,
                      alignSelf: "flex-start",
                      fontSize: 42,
                    },
                  ]}
                >
                  {ReplaceWithStyle(
                    i18n.t("createToParty"),
                    "{accountParty}",
                    <Text style={[Styles.text.primary, Styles.text.semibold]}>
                      {i18n.t("accountParty")}
                    </Text>,
                  )}
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

                <View style={{ flexDirection: "row", width: width - 40 }}>
                  <View
                    style={[
                      Styles.input.container,
                      {
                        flex: 1,
                        marginTop: 30,
                        marginVertical: 5,
                        marginRight: 5,
                      },
                    ]}
                  >
                    <TextInput
                      ref={firstNameInput}
                      onSubmitEditing={() => lastNameInput.current.focus()}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      enterKeyHint="next"
                      style={[Styles.input.text]}
                      placeholder={i18n.t("firstName")}
                      value={firstName}
                      onChangeText={(val) => setFirstName(val)}
                    />
                  </View>
                  <View
                    style={[
                      Styles.input.container,
                      {
                        flex: 1,
                        marginTop: 30,
                        marginVertical: 5,
                        marginLeft: 5,
                      },
                    ]}
                  >
                    <TextInput
                      ref={lastNameInput}
                      onSubmitEditing={() => phoneInput.current.focus()}
                      autoCapitalize="words"
                      autoComplete="family-name"
                      enterKeyHint="next"
                      style={[Styles.input.text]}
                      placeholder={i18n.t("lastName")}
                      keyboardType="default"
                      value={lastName}
                      onChangeText={(val) => setLastName(val)}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    width: width - 40,
                    marginVertical: 5,
                  }}
                >
                  <View
                    style={[
                      Styles.input.container,
                      {
                        flex: 1,
                        marginRight: 5,
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
                      ref={phoneInput}
                      onSubmitEditing={() => dobInput.current.focus()}
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
                  <View
                    style={[
                      Styles.input.container,
                      {
                        flex: 1,
                        marginLeft: 5,
                      },
                    ]}
                  >
                    <TextInput
                      ref={dobInput}
                      onSubmitEditing={() => emailInput.current.focus()}
                      autoComplete="birthdate-full"
                      enterKeyHint="next"
                      style={[Styles.input.text]}
                      placeholder={i18n.t("dob")}
                      keyboardType="default"
                      value={dob}
                      onChangeText={(val) => setDob(val)}
                    />
                  </View>
                </View>

                <View
                  style={[
                    Styles.input.container,
                    {
                      width: width - 40,
                      marginVertical: 5,
                      marginBottom: 30,
                    },
                  ]}
                >
                  <TextInput
                    ref={emailInput}
                    keyboardType="email-address"
                    enterKeyHint="next"
                    style={[Styles.input.text]}
                    placeholder={i18n.t("email")}
                    value={email}
                    onChangeText={(val) => setEmail(val)}
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
                    disabled={!canRegister}
                    onPress={onRegister}
                    style={[
                      Styles.button.container,
                      !canRegister ? Styles.button.disabled : {},
                      { width: width - 60, marginBottom: 10 },
                    ]}
                  >
                    <Text style={[Styles.button.text, Styles.text.semibold]}>
                      {i18n.t("register")}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={[{ marginTop: 5, marginBottom: 10 }]}>
                  <Text
                    style={[
                      Styles.text.semibold,
                      Styles.text.sm,
                      Styles.text.dark,
                      { textAlign: "center" },
                    ]}
                  >
                    {i18n.t("smsAgree")}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/login")}
                  style={[{ marginTop: 20 }]}
                >
                  <Text style={[Styles.text.semibold, Styles.text.dark]}>
                    {i18n.t("haveAccount")}{" "}
                    <Text style={[Styles.text.primary, Styles.text.semibold]}>
                      {i18n.t("signIn")}
                    </Text>
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
