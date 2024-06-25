import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
import { ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import {
  Feather,
  Octicons,
  Entypo,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "../../../locales/provider";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../../utils/Api";
import {
  EmailValidator,
  PhoneFormatter,
  ReplaceWithStyle,
} from "../../../utils/Formatters";
import { TextInput } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  StripeProvider,
  collectBankAccountForSetup,
  confirmSetupIntent,
} from "@stripe/stripe-react-native";
import Config from "../../../utils/Config";
import { Alert } from "react-native";

export default function AccountScreen() {
  const {
    auth,
    session,
    isGuest,
    signOut,
    name,
    phoneNumber,
    email,
    setName,
    setPhoneNumber,
    setEmail,
    organizations,
    setActiveOrganization,
    setOrganizerMode,
    organizerMode,
  } = useSession();
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingACH, setIsLoadingACH] = React.useState(true);
  const { width, height } = Dimensions.get("window");

  const firstName = React.useMemo(() => {
    return name.split(" ").slice(0, -1).join(" ");
  }, [name]);
  const lastName = React.useMemo(() => {
    return name.split(" ").slice(-1).join(" ");
  }, [name]);
  const [addressStreet, setAddressStreet] = React.useState("");
  const [addressCity, setAddressCity] = React.useState("");
  const [addressRegion, setAddressRegion] = React.useState("");
  const [addressPostal, setAddressPostal] = React.useState("");
  const [setupIntentClientSecret, setSetupIntentClientSecret] =
    React.useState(null);
  const [stripeInstitution, setStripeInstitution] = React.useState(null);

  const emailHelper = React.useMemo(() => {
    if (!EmailValidator(email))
      return {
        color: theme["color-danger-500"],
        text: i18n.t("invalidEmail"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: email.trim() !== "",
    };
  }, [email]);

  const onDeleteAccount = () => {};

  const handleCollectBankAccountPress = async () => {
    // Fetch the intent client secret from the backend.
    // See `fetchIntentClientSecret()`'s implementation above.

    const { setupIntent, error } = await collectBankAccountForSetup(
      setupIntentClientSecret,
      {
        paymentMethodData: {
          billingDetails: {
            name: firstName + " " + lastName,
            email: email,
          },
        },
        paymentMethodType: "USBankAccount",
      },
    );

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else if (setupIntent) {
      if (setupIntent.status === "RequiresConfirmation") {
        // The next step is to call `confirmSetup`
        const { error: confirmError, setupIntent } = await confirmSetupIntent(
          setupIntentClientSecret,
          {
            paymentMethodType: "USBankAccount",
          },
        );

        if (setupIntent?.paymentMethod?.USBankAccount) {
          setStripeInstitution(setupIntent?.paymentMethod?.USBankAccount);
        }

        if (confirmError) {
          Alert.alert(`Error code: ${confirmError.code}`, confirmError.message);
        } else if (setupIntent) {
          if (setupIntent.status === "Processing") {
            // The debit has been successfully submitted and is now processing
          } else if (
            setupIntent.status === "RequiresAction" &&
            setupIntent?.nextAction?.type === "verifyWithMicrodeposits"
          ) {
            // The payment must be verified with `verifyMicrodepositsForPayment`
          } else {
            Alert.alert("Payment status:", setupIntent.status);
          }
        }
      }
    }
  };

  const load = async () => {
    setIsLoading(true);
    setIsLoadingACH(true);

    try {
      const res = await Api.get("/users/settings", { auth });
      console.log(res);
      if (res.isError) throw "e";

      setName(res.data.user.first_name + " " + res.data.user.last_name);
      setEmail(res.data.user.email);
      setPhoneNumber(res.data.user.phone);

      setSetupIntentClientSecret(res.data.setupIntentId);
      setAddressStreet(res.data.user.address.street);
      setAddressCity(res.data.user.address.city);
      setAddressRegion(res.data.user.address.region);
      setAddressPostal(res.data.user.address.postal);
      setStripeInstitution(res.data.stripeInstitution);

      setIsLoadingACH(false);
      setIsLoading(false);
    } catch (e) {
      alert(e);
      setIsLoadingACH(false);
      setIsLoading(false);
    }
  };

  const onUpdatePersonal = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/users/settings/personal", {
        auth,
        email,
        addressStreet,
        addressCity,
        addressPostal,
        addressRegion,
      });
      if (res.isError) throw res.data?.message;

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setPhoneNumber(PhoneFormatter(phoneNumber));
  }, [phoneNumber]);

  React.useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    load();
  }, [auth]);

  return (
    <StripeProvider
      publishableKey={Config.stripeKey}
      urlScheme="com.ticketsfour.app" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.ticketsfour.app" // required for Apple Pay
    >
      <>
        <ScrollContainer>
          <View>
            {session && !isGuest && (
              <>
                <View
                  style={[
                    Style.containers.row,
                    { marginTop: 6, marginBottom: 20 },
                  ]}
                >
                  <Text
                    style={[Style.text.xxl, Style.text.bold, Style.text.dark]}
                  >
                    {ReplaceWithStyle(
                      i18n.t("accountSettings"),
                      "{settings}",
                      <Text style={[Style.text.primary, Style.text.semibold]}>
                        {i18n.t("settings")}
                      </Text>,
                    )}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() =>
                      SheetManager.show("helper-sheet", {
                        payload: { text: "accountSettingsDesc" },
                      })
                    }
                    style={{ padding: 10 }}
                  >
                    <Feather
                      name="info"
                      size={20}
                      color={theme["color-basic-700"]}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.text.lg,
                    { marginTop: 10 },
                  ]}
                >
                  {i18n.t("personalInformation")}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 15 }}>
                  <View
                    style={{
                      flex: 1,
                      marginRight: 5,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 5,
                        paddingVertical: 8,
                        backgroundColor: theme["color-basic-100"],
                      }}
                    >
                      <Text
                        style={[
                          Style.text.semibold,
                          Style.text.sm,
                          { color: theme["color-basic-700"] },
                        ]}
                      >
                        {i18n.t("firstName")}
                      </Text>
                    </View>
                    <View
                      style={[
                        Style.input.container,
                        {
                          backgroundColor: "transparent",
                          borderColor: theme["color-basic-600"],
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <TextInput
                        readOnly
                        style={[Style.input.text]}
                        value={firstName}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 5,
                    }}
                  >
                    <View style={{}}>
                      <Text
                        style={[
                          Style.text.semibold,
                          Style.text.sm,
                          {
                            color: theme["color-basic-700"],
                            paddingVertical: 8,
                          },
                        ]}
                      >
                        {i18n.t("lastName")}
                      </Text>
                    </View>
                    <View
                      style={[
                        Style.input.container,
                        {
                          backgroundColor: "transparent",
                          borderColor: theme["color-basic-600"],
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <TextInput
                        readOnly
                        style={[Style.input.text]}
                        value={lastName}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 6,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      marginRight: 5,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 5,
                        paddingVertical: 8,
                        backgroundColor: theme["color-basic-100"],
                      }}
                    >
                      <Text
                        style={[
                          Style.text.semibold,
                          Style.text.sm,
                          { color: theme["color-basic-700"] },
                        ]}
                      >
                        {i18n.t("phoneNumber")}
                      </Text>
                    </View>
                    <View
                      style={[
                        Style.input.container,
                        {
                          backgroundColor: "transparent",
                          borderColor: theme["color-basic-600"],
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <TextInput
                        readOnly
                        autoCapitalize="words"
                        autoComplete="tel"
                        enterKeyHint="next"
                        style={[Style.input.text]}
                        value={phoneNumber}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 5,
                    }}
                  >
                    <View style={{}}>
                      <Text
                        style={[
                          Style.text.semibold,
                          Style.text.sm,
                          { color: emailHelper.color, paddingVertical: 8 },
                        ]}
                      >
                        {i18n.t("email")}
                      </Text>
                    </View>
                    <View style={[Style.input.container]}>
                      <TextInput
                        autoComplete="email"
                        enterKeyHint="next"
                        style={[Style.input.text]}
                        placeholder={i18n.t("enter_email")}
                        value={email}
                        onChangeText={(val) => setEmail(val)}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Style.containers.row,
                    { marginTop: 6, marginBottom: 20 },
                  ]}
                >
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.lg,
                      { marginTop: 10 },
                    ]}
                  >
                    {i18n.t("paymentInformation")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() =>
                      SheetManager.show("helper-sheet", {
                        payload: { text: "achHelper" },
                      })
                    }
                    style={{ padding: 10 }}
                  >
                    <Feather
                      name="info"
                      size={20}
                      color={theme["color-basic-700"]}
                    />
                  </TouchableOpacity>
                </View>
                {isLoadingACH && (
                  <ActivityIndicator
                    color={theme["color-primary-500"]}
                    size={20}
                    style={{ alignSelf: "center", marginBottom: 10 }}
                  />
                )}
                {!isLoadingACH && !isLoading && (
                  <>
                    {stripeInstitution != null && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 20,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="bank-check"
                          size={18}
                          color={theme["color-basic-700"]}
                        />
                        <Text
                          style={[
                            { marginLeft: 20, flex: 1 },
                            Style.text.md,
                            Style.text.semibold,
                            Style.text.dark,
                          ]}
                        >
                          {stripeInstitution?.bankName} -{" "}
                          {stripeInstitution?.last4}
                        </Text>
                        <Text
                          style={[
                            { marginHorizontal: 4 },
                            Style.text.sm,
                            Style.text.semibold,
                            Style.text.dark,
                          ]}
                        >
                          {i18n.t(
                            "stripe_subtype_" +
                              stripeInstitution?.accountType?.toLowerCase(),
                          )}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        handleCollectBankAccountPress();
                      }}
                    >
                      <View
                        style={[
                          Style.button.container,
                          {
                            backgroundColor: theme["color-basic-800"],
                            alignSelf: "center",
                            marginTop: stripeInstitution != null ? 20 : 0,
                            width: width - 40,
                            maxWidth: 300,
                            marginBottom: 10,
                          },
                        ]}
                      >
                        <Text style={[Style.button.text, Style.text.semibold]}>
                          {i18n.t("linkAccount")}
                        </Text>
                        <Image
                          style={Style.button.suffix}
                          width={100}
                          height={30}
                          contentFit="contain"
                          source={{
                            uri: "https://res.cloudinary.com/ticketsfour/image/upload/q_auto,f_auto/externals/stripe/Powered_by_Stripe_-_white-1000x227-c5aacc8_q09lyq.png",
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
            {isGuest && (
              <>
                <View
                  style={[
                    Style.containers.row,
                    { marginTop: 6, marginBottom: 20 },
                  ]}
                >
                  <Text
                    style={[Style.text.xxxl, Style.text.bold, Style.text.dark]}
                  >
                    {i18n.t("guestMode")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() =>
                      SheetManager.show("helper-sheet", {
                        payload: { text: "guestModeDesc" },
                      })
                    }
                    style={{ padding: 10 }}
                  >
                    <Feather
                      name="info"
                      size={20}
                      color={theme["color-basic-700"]}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={theme["color-primary-500"]}
              />
            )}
            <View style={[Style.divider, { marginVertical: 8 }]}></View>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.x.com/ticketsfourapp")
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <FontAwesome6
                name="x-twitter"
                size={18}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("followX")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.facebook.com/ticketsfour")
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="facebook"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("likeFacebook")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.instagram.com/ticketsfour")
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <MaterialCommunityIcons
                name="instagram"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("followIg")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("tel://+18883113016")}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <MaterialCommunityIcons
                name="cellphone-check"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("callUs")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:info@ticketsfour.com")}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <MaterialCommunityIcons
                name="email-edit-outline"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("emailUs")}
              </Text>
            </TouchableOpacity>
            <View style={[Style.divider, { marginVertical: 8 }]}></View>
            <Text
              style={[
                Style.text.dark,
                Style.text.bold,
                Style.text.xl,
                { marginVertical: 8 },
              ]}
            >
              {i18n.t("legal")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.ticketsfour.com/legal/terms",
                  {
                    presentationStyle: "popover",
                  },
                )
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="file-text"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("termsOfUse")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.ticketsfour.com/legal/privacy",
                  {
                    presentationStyle: "popover",
                  },
                )
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="file-text"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("privacyPolicy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.ticketsfour.com/legal/purchase",
                  {
                    presentationStyle: "popover",
                  },
                )
              }
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="file-text"
                size={20}
                color={theme["color-basic-700"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {i18n.t("purchasePolicy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="log-out"
                size={20}
                color={theme["color-danger-500"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.danger,
                ]}
              >
                {i18n.t("logOut")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDeleteAccount}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather
                name="trash-2"
                size={20}
                color={theme["color-danger-500"]}
              />
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.danger,
                ]}
              >
                {i18n.t("deleteAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollContainer>
        <TouchableOpacity
          onPress={() => router.push("help/assistant")}
          style={[
            Style.elevated,
            Style.button.round,
            {
              position: "absolute",
              shadowOpacity: 0.4,
              shadowColor: theme["color-primary-300"],
              backgroundColor: theme["color-primary-300"],
              flexDirection: "row",
              alignItems: "center",
              width: 60,
              height: 60,
              borderRadius: 30,
              bottom: 90,
              right: 15,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="robot-confused-outline"
            size={26}
            color={theme["color-basic-100"]}
          />
        </TouchableOpacity>
      </>
    </StripeProvider>
  );
}
