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
      if (res.isError) throw "e";

      setFirstName(res.data.user.first_name);
      setLastName(res.data.user.last_name);
      setEmail(res.data.user.email);
      setPhoneNumber(res.data.user.phone);

      setAddressStreet(res.data.user.address.street);
      setAddressCity(res.data.user.address.city);
      setAddressRegion(res.data.user.address.region);
      setAddressPostal(res.data.user.address.postal);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
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
    <ScrollContainer>
      <View>
        {session && !isGuest && (
          <>
            <View
              style={[Style.containers.row, { marginTop: 6, marginBottom: 20 }]}
            >
              <Text style={[Style.text.xxxl, Style.text.bold, Style.text.dark]}>
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
          </>
        )}
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
        {/* {teammates.map((teammate, tidx) => (
          <TouchableOpacity
            key={tidx}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {teammate.role == "driver" && (
              <Feather
                name="truck"
                size={20}
                color={theme["color-basic-700"]}
              />
            )}
            {teammate.role == "manager" && (
              <Feather
                name="heart"
                size={20}
                color={theme["color-basic-700"]}
              />
            )}
            {teammate.role == "salesperson" && (
              <Octicons
                name="code-of-conduct"
                size={20}
                color={theme["color-basic-700"]}
              />
            )}
            <View>
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.xs,
                  Style.text.semibold,
                  Style.transparency.md,
                  Style.text.dark,
                ]}
              >
                {i18n.t(teammate.role)}
              </Text>
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                ]}
              >
                {teammate.user?.firstName} {teammate.user?.lastName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {teammates.length == 0 && !isLoading && (
          <View style={Style.containers.row}>
            <Text
              style={[
                Style.text.dark,
                Style.transparency.md,
                Style.text.semibold,
              ]}
            >
              {i18n.t("noTeammates")}
            </Text>
          </View>
        )} */}
        {/* {!isDriver && (
          <TouchableOpacity
            onPress={onAddTeammate}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Feather
              name="users"
              size={20}
              color={theme["color-primary-500"]}
            />
            <View>
              <Text
                style={[
                  { marginLeft: 20 },
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.primary,
                ]}
              >
                {i18n.t("addTeammate")}
              </Text>
            </View>
          </TouchableOpacity>
        )} */}
        {/* <View style={[Style.divider, { marginVertical: 8 }]}></View>
        <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
          <View
            style={[Style.containers.row, { justifyContent: "flex-start" }]}
          >
            <MaterialCommunityIcons
              name="puzzle-heart-outline"
              size={20}
              color={theme["color-basic-800"]}
            />
            <Text
              style={[
                { marginLeft: 20 },
                Style.text.md,
                Style.text.semibold,
                Style.text.dark,
              ]}
            >
              {i18n.t("madeBy")}
            </Text>
          </View>
        </View>
        <View style={[Style.containers.column, { marginBottom: 15 }]}>
          <Pressable
            onPress={() => Linking.openURL("https://www.jabonmex.com")}
            style={[
              Style.cards.cover,
              { width: width - 20, marginHorizontal: 5 },
            ]}
          >
            <Image
              style={{ height: "100%", width: "100%" }}
              source={{
                uri: "https://res.cloudinary.com/labodegaltd/image/upload/f_auto/ads/template_primary.jpg",
              }}
            />
          </Pressable>
          <View
            style={[
              {
                width: width - 20,
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              },
            ]}
          >
            <Pressable
              onPress={() => Linking.openURL("http://www.lahaciendabrands.com")}
              style={[Style.cards.half, { width: width * 0.46 }]}
            >
              <Image
                style={{ height: "100%", width: "100%" }}
                source={{
                  uri: "https://res.cloudinary.com/labodegaltd/image/upload/f_auto/ads/HNDA.png",
                }}
              />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("http://www.labodegabakery.com")}
              style={[Style.cards.half, { width: width * 0.46 }]}
            >
              <Image
                style={{ height: "100%", width: "100%" }}
                source={{
                  uri: "https://res.cloudinary.com/labodegaltd/image/upload/f_auto/ads/gallito.png",
                }}
              />
            </Pressable>
          </View>
        </View> */}
        {/* <View style={[Style.divider, { marginVertical: 8 }]}></View> */}
        {/* <View
          style={{
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <MaterialCommunityIcons
            name="text-recognition"
            size={20}
            color={theme["color-basic-700"]}
          />
          <View style={{ flex: 1, marginHorizontal: 20 }}>
            <Text style={[Style.text.md, Style.text.semibold, Style.text.dark]}>
              {i18n.t("enlargedText")}
            </Text>
          </View>
          <Switch
            trackColor={{
              false: theme["color-basic-200"],
              true: theme["color-primary-200"],
            }}
            thumbColor={enlargedText ? theme["color-primary-400"] : "#f4f3f4"}
            ios_backgroundColor={theme["color-basic-200"]}
            onValueChange={() => {
              setEnlargedText(!enlargedText);
            }}
            value={enlargedText}
          />
        </View> */}
        <View style={[Style.divider, { marginVertical: 8 }]}></View>
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
          <Feather name="facebook" size={20} color={theme["color-basic-700"]} />
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
          <Feather name="log-out" size={20} color={theme["color-danger-500"]} />
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
          <Feather name="trash-2" size={20} color={theme["color-danger-500"]} />
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
  );
}
