import {
  Dimensions,
  View,
  Text,
  Pressable,
  Keyboard,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import Style, { theme } from "../Styles";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DateFormatter,
  EmailValidator,
  PhoneFormatter,
  ReplaceWithStyle,
} from "../Formatters";
import moment from "moment";
import Api from "../Api";

function HelperSheet({ sheetId, payload }) {
  const { session, organizerMode } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const { text } = payload;

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{
        backgroundColor: organizerMode
          ? theme["color-organizer-500"]
          : theme["color-primary-500"],
      }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View style={[Style.containers.column, { marginTop: 10 }]}>
        <Feather
          name="info"
          size={30}
          color={
            organizerMode
              ? theme["color-organizer-500"]
              : theme["color-primary-500"]
          }
        />
        <Text
          style={[
            Style.text.semibold,
            Style.text.dark,
            Style.text.lg,
            { marginTop: 20, textAlign: "center" },
          ]}
        >
          {i18n.t(text)}
        </Text>
      </View>
    </ActionSheet>
  );
}

function PaymentErrorSheet({ sheetId, payload }) {
  const { session, organizerMode } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const { text } = payload;

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{
        backgroundColor: organizerMode
          ? theme["color-organizer-500"]
          : theme["color-primary-500"],
      }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View style={[Style.containers.column, { marginTop: 10 }]}>
        <MaterialCommunityIcons
          name="bank-off-outline"
          size={30}
          color={theme["color-primary-500"]}
        />
        <Text
          style={[
            Style.text.semibold,
            Style.text.dark,
            Style.text.lg,
            { marginTop: 20, textAlign: "center" },
          ]}
        >
          {i18n.t(text)}
        </Text>
      </View>
    </ActionSheet>
  );
}

function AuthenticateSheet({ sheetId, payload }) {
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const actionSheetRef = React.useRef(null);
  const { auth, signIn, setDefaultOrganization } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [login, setLogin] = React.useState(false);

  const firstNameInput = React.useRef(null);
  const lastNameInput = React.useRef(null);
  const phoneInput = React.useRef(null);
  const emailInput = React.useRef(null);
  const dobInput = React.useRef(null);

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const canReceiveOTP = React.useMemo(() => {
    return phoneNumber != "";
  }, [phoneNumber]);
  const [awaitingOTP, setAwaitingOTP] = React.useState(false);
  const [otp, setOTP] = React.useState("");
  const [loginToken, setLoginToken] = React.useState(null);
  const codeFields = React.useMemo(() => {
    return otp.slice(0, 8).padEnd(8, " ").split("");
  }, [otp]);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [email, setEmail] = React.useState("");

  const canRegister = React.useMemo(() => {
    try {
      let today = moment();
      let bday = today.clone().subtract(parseInt(dob), "Y").startOf("year");

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
    let today = moment();
    let bday = today.subtract(parseInt(dob), "Y").startOf("year");
    let dobF = moment(bday, "MM-DD-YYYY").format("YYYY-MM-DD");

    try {
      const res = await Api.post("/register", {
        firstName,
        lastName,
        phone: phoneNumber,
        email,
        dob: dobF,
      });
      if (res.isError) throw res.data.message;

      setIsLoading(false);
      signIn(res.data.usid);
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
  };

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

  React.useEffect(() => {
    if (!auth) return;

    SheetManager.hide("authentication");
  }, [auth]);

  React.useEffect(() => {
    setPhoneNumber(PhoneFormatter(phoneNumber));
  }, [phoneNumber]);

  return (
    <ActionSheet
      id={sheetId}
      keyboardHandlerEnabled={false}
      gestureEnabled={false}
      useBottomSafeAreaPadding
      ref={actionSheetRef}
      containerStyle={{
        padding: 20,
        paddingBottom: 0,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      {login && (
        <Pressable onPress={Keyboard.dismiss}>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {awaitingOTP && (
              <>
                <Text
                  style={[
                    Style.text.xxl,
                    Style.transparency.md,
                    Style.text.semibold,
                    { width: width * 0.85, marginTop: 30 },
                  ]}
                >
                  {i18n.t("checkMessages")}
                </Text>
                <Text
                  style={[
                    Style.transparency.lg,
                    { width: width * 0.85, marginTop: 8 },
                  ]}
                >
                  {i18n.t("sentOTP")}
                </Text>

                {error && (
                  <Text
                    style={[
                      Style.text.md,
                      Style.text.bold,
                      Style.text.danger,
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
                        Style.input.otp,
                        otp.length == idx ? Style.border.primaryDark : {},
                      ]}
                    >
                      <Text style={[Style.text.lg, Style.text.semibold]}>
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
                      Style.button.container,
                      otp.length != 8 ? Style.button.disabled : {},
                      { width: width - 40, marginBottom: 10 },
                    ]}
                  >
                    <Text style={[Style.button.text, Style.text.semibold]}>
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
                    Style.text.bold,
                    Style.text.dark,
                    { marginVertical: 10, fontSize: 42 },
                  ]}
                >
                  {i18n.t("helloAgain")}
                </Text>
                <Text
                  style={[
                    Style.transparency.lg,
                    Style.text.lg,
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
                      Style.text.md,
                      Style.text.bold,
                      Style.text.danger,
                      { marginTop: 5 },
                    ]}
                  >
                    {i18n.t(error)}
                  </Text>
                )}

                <View
                  style={[
                    Style.input.container,
                    {
                      width: width - 40,
                      marginVertical: 30,
                      marginBottom: 20,
                    },
                  ]}
                >
                  <TextInput
                    autoComplete="tel"
                    enterKeyHint="next"
                    style={[Style.input.text]}
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
                      Style.button.container,
                      !canReceiveOTP ? Style.button.disabled : {},
                      { width: width - 40, marginBottom: 10 },
                    ]}
                  >
                    <Text style={[Style.button.text, Style.text.semibold]}>
                      {i18n.t("next")}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity
              onPress={() => setLogin(false)}
              style={[{ marginTop: 20, marginBottom: 10 }]}
            >
              <Text style={[Style.text.semibold, Style.text.dark]}>
                {i18n.t("noAccount")}{" "}
                <Text style={[Style.text.primary, Style.text.semibold]}>
                  {i18n.t("signUp")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
      {!login && (
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
                Style.text.lg,
                Style.text.primary,
                Style.text.normal,
                { marginTop: 10, alignSelf: "flex-start" },
              ]}
            >
              {i18n.t("joinTheParty")}
            </Text>
            <Text
              style={[
                Style.text.bold,
                Style.text.dark,
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
                <Text style={[Style.text.primary, Style.text.semibold]}>
                  {i18n.t("accountParty")}
                </Text>,
              )}
            </Text>

            {error && (
              <Text
                style={[
                  Style.text.md,
                  Style.text.bold,
                  Style.text.danger,
                  { marginTop: 5 },
                ]}
              >
                {i18n.t(error)}
              </Text>
            )}

            <View style={{ flexDirection: "row", width: width - 40 }}>
              <View
                style={[
                  Style.input.container,
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
                  style={[Style.input.text]}
                  placeholder={i18n.t("firstName")}
                  value={firstName}
                  autoCorrect={false}
                  spellCheck={false}
                  onChangeText={(val) => setFirstName(val)}
                />
              </View>
              <View
                style={[
                  Style.input.container,
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
                  style={[Style.input.text]}
                  placeholder={i18n.t("lastName")}
                  keyboardType="default"
                  value={lastName}
                  autoCorrect={false}
                  spellCheck={false}
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
                  Style.input.container,
                  {
                    flex: 1,
                    marginRight: 5,
                  },
                ]}
              >
                <TextInput
                  ref={phoneInput}
                  onSubmitEditing={() => dobInput.current.focus()}
                  autoComplete="tel"
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={i18n.t("phoneNumber")}
                  inputMode="tel"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(val) => setPhoneNumber(val)}
                />
              </View>
              <View
                style={[
                  Style.input.container,
                  {
                    flex: 1,
                    marginLeft: 5,
                  },
                ]}
              >
                <TextInput
                  ref={dobInput}
                  onSubmitEditing={() => emailInput.current.focus()}
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={i18n.t("age")}
                  keyboardType="numeric"
                  value={dob}
                  onChangeText={(val) => setDob(val)}
                />
              </View>
            </View>

            <View
              style={[
                Style.input.container,
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
                style={[Style.input.text]}
                placeholder={i18n.t("email")}
                value={email}
                autoCorrect={false}
                spellCheck={false}
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
                  Style.button.container,
                  !canRegister ? Style.button.disabled : {},
                  { width: width - 60, marginBottom: 10 },
                ]}
              >
                <Text style={[Style.button.text, Style.text.semibold]}>
                  {i18n.t("register")}
                </Text>
              </TouchableOpacity>
            )}
            <View style={[{ marginTop: 5, marginBottom: 10 }]}>
              <Text
                style={[
                  Style.text.semibold,
                  Style.text.sm,
                  Style.text.dark,
                  { textAlign: "center" },
                ]}
              >
                {i18n.t("smsAgree")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setLogin(true)}
              style={[{ marginTop: 20 }]}
            >
              <Text style={[Style.text.semibold, Style.text.dark]}>
                {i18n.t("haveAccount")}{" "}
                <Text style={[Style.text.primary, Style.text.semibold]}>
                  {i18n.t("signIn")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </ActionSheet>
  );
}

export { HelperSheet, AuthenticateSheet, PaymentErrorSheet };
export default HelperSheet;
