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
  LinkIOSPresentationStyle,
  LinkLogLevel,
  create as createPlaid,
  open as openPlaid,
} from "react-native-plaid-link-sdk";

export default function AccountScreen() {
  const {
    auth,
    session,
    isGuest,
    signOut,
    name,
    organizations,
    setActiveOrganization,
    setOrganizerMode,
    organizerMode,
  } = useSession();
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [addressStreet, setAddressStreet] = React.useState("");
  const [addressCity, setAddressCity] = React.useState("");
  const [addressRegion, setAddressRegion] = React.useState("");
  const [addressPostal, setAddressPostal] = React.useState("");
  const [isLoadingPlaid, setIsLoadingPlaid] = React.useState(false);
  const [plaidAccount, setPlaidAccount] = React.useState(null);
  const [plaidInstitution, setPlaidInstitution] = React.useState(null);

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

  const load = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/users/settings", { auth });
      console.log(res);
      if (res.isError) throw "e";

      setFirstName(res.data.user.first_name);
      setLastName(res.data.user.last_name);
      setEmail(res.data.user.email);
      setPhoneNumber(res.data.user.phone);

      setAddressStreet(res.data.user.address.street);
      setAddressCity(res.data.user.address.city);
      setAddressRegion(res.data.user.address.region);
      setAddressPostal(res.data.user.address.postal);

      setPlaidAccount(res.data.account);
      setPlaidInstitution(res.data.institution);
      setIsLoading(false);
    } catch (e) {
      alert(e);
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

  const linkPlaid = async (publicToken) => {
    setIsLoadingPlaid(true);

    try {
      const res = await Api.post("/users/plaid/link", {
        auth,
        public_token: publicToken,
      });
      if (res.isError) throw res.data?.message;

      setPlaidAccount(res.data.account);
      setPlaidInstitution(res.data.institution);
      setIsLoadingPlaid(false);
    } catch (e) {
      console.log(e);
      setIsLoadingPlaid(false);
    }
  };

  const handlePlaidTokenCreation = async () => {
    setIsLoadingPlaid(true);

    try {
      const res = await Api.get("/users/plaid/link", {
        auth,
      });
      if (res.isError) throw res.data?.message;

      createPlaid({
        token: res.data.link_token,
        logLevel: LinkLogLevel.DEBUG,
        noLoadingState: false,
      });

      openPlaid({
        onSuccess: (res) => {
          linkPlaid(res.publicToken);
        },
        onExit: (err) => {
          console.log(err);
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.DEBUG,
      }).catch((e) => console.log(e));
      setIsLoadingPlaid(false);
    } catch (e) {
      console.log(e);
      setIsLoadingPlaid(false);
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
                        { color: theme["color-basic-700"], paddingVertical: 8 },
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
                style={{ flexDirection: "row", marginTop: 6, marginBottom: 20 }}
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
                      payload: { text: "plaidHelper" },
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
              {isLoadingPlaid && (
                <ActivityIndicator
                  color={theme["color-primary-500"]}
                  size={20}
                  style={{ alignSelf: "center", marginBottom: 10 }}
                />
              )}
              {!isLoadingPlaid && !isLoading && (
                <>
                  {plaidAccount != null && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                      }}
                    >
                      {plaidInstitution?.logo != null && (
                        <Image
                          width={20}
                          height={20}
                          contentFit="contain"
                          source={{
                            uri:
                              "data:image/png;base64," + plaidInstitution?.logo,
                          }}
                        />
                      )}
                      <Text
                        style={[
                          { marginLeft: 20, flex: 1 },
                          Style.text.md,
                          Style.text.semibold,
                          plaidInstitution?.primary_color != null
                            ? { color: plaidInstitution?.primary_color }
                            : Style.text.dark,
                        ]}
                      >
                        {plaidInstitution?.name} - {plaidAccount?.name}
                      </Text>
                      <Text
                        style={[
                          { marginHorizontal: 4 },
                          Style.text.sm,
                          Style.text.semibold,
                          Style.text.dark,
                        ]}
                      >
                        {i18n.t("plaid_subtype_" + plaidAccount?.subtype)}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      handlePlaidTokenCreation();
                    }}
                  >
                    <View
                      style={[
                        Style.button.container,
                        {
                          backgroundColor: theme["color-basic-800"],
                          alignSelf: "center",
                          marginTop: plaidAccount != null ? 20 : 0,
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
                          uri: "https://res.cloudinary.com/ticketsfour/image/upload/q_auto,f_auto/externals/plaid/Plaid_id25TiQUJW_4_cb5119.png",
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
            onPress={() => Linking.openURL("https://www.x.com/ticketsfourapp")}
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
  );
}
