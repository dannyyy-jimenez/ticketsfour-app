import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Switch,
  Platform,
} from "react-native";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useOfflineProvider, useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { Commasize, CurrencyFormatter, FormatPhoneNumber } from "../Formatters";
import Api from "../Api";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import Share from "react-native-share";
import { TextInput } from "react-native";
import ArtistCard from "../components/Talent";
import { TouchableWithoutFeedback } from "react-native";
import { Keyboard } from "react-native";
import { ScrollView } from "react-native";
import moment from "moment/moment";
import { Pressable } from "react-native";
import { ActivityIndicator } from "react-native";
import PagerView from "react-native-pager-view";
import TicketComponent from "../components/Ticket";
// import NfcManager, { Ndef, NfcEvents, NfcTech } from "react-native-nfc-manager";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function EventsShareSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;

  const onShareQR = async () => {
    let uri = await event.getShareables("qr");

    let shareImageBase64 = {
      title: "Event QR Code",
      url: uri,
      type: "image/jpeg",
      filename: "event-code.svg",
      subject: "Share Link", //  for email
    };
    Share.open(shareImageBase64);
  };

  const onShareEmail = () => {
    Linking.openURL(event.getShareables("email"));
  };

  const onShareAll = () => {
    if (Platform.OS == "android") {
      let uridata = {
        title: event.name,
        message: event.getShareables(),
      };
      Share.open(uridata).catch((e) => {});

      return;
    }

    Sharing.shareAsync(event.getShareables());
  };

  const onShareFlyer = () => {
    if (Platform.OS == "android") {
      let uridata = {
        title: event.name,
        message: event.coverT,
      };
      Share.open(uridata).catch((e) => {});

      return;
    }

    Sharing.shareAsync(event.coverT);
  };

  const onHide = () => {
    SheetManager.hide("events-share-sheet");
  };

  return (
    <ActionSheet
      id={sheetId}
      statusBarTranslucent
      drawUnderStatusBar
      gestureEnabled={false}
      isModal
      containerStyle={{
        height: height,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        backgroundColor: "transparent",
      }}
    >
      <BlurView
        intensity={40}
        style={{
          backgroundColor:
            Platform.OS == "android"
              ? "rgba(0,0,0,0.95)"
              : "rgba(11,11,11,0.4)",
          width,
          top: -30,
          height: height + 30,
          paddingVertical: 80,
          paddingHorizontal: 20,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            alignSelf: "center",
            marginBottom: 40,
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              maxWidth: width * 0.8,
              maxHeight: height * 0.35,
              borderRadius: 20,
            }}
            contentFit="contain"
            source={{ uri: event.coverT }}
            width={300}
            height={400}
          />
        </View>

        <View
          style={[
            Style.containers.column,
            { alignItems: "flex-start", marginBottom: 20 },
          ]}
        >
          <Text style={[Style.text.xl, Style.text.bold, Style.text.basic]}>
            {event.name}
          </Text>
          <Text
            style={[
              Style.text.md,
              Style.text.semibold,
              Style.text.basic,
              { marginTop: 8 },
            ]}
          >
            {event.getStart("MMMM Do, YYYY")} • {event.getStart("hh:mm A")}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={onShareQR}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="qrcode"
              size={28}
              color={theme["color-basic-100"]}
            />
            <Text
              style={[
                { marginLeft: 10 },
                Style.text.lg,
                Style.text.normal,
                Style.text.basic,
              ]}
            >
              {i18n.t("shareQR")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShareEmail}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={28}
              color={theme["color-basic-100"]}
            />
            <Text
              style={[
                { marginLeft: 10 },
                Style.text.lg,
                Style.text.normal,
                Style.text.basic,
              ]}
            >
              {i18n.t("shareEmail")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShareFlyer}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="image-auto-adjust"
              size={28}
              color={theme["color-basic-100"]}
            />
            <Text
              style={[
                { marginLeft: 10 },
                Style.text.lg,
                Style.text.normal,
                Style.text.basic,
              ]}
            >
              {i18n.t("shareImage")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShareAll}
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Feather name="share" size={26} color={theme["color-basic-100"]} />
            <Text
              style={[
                { marginLeft: 10 },
                Style.text.lg,
                Style.text.normal,
                Style.text.basic,
              ]}
            >
              {i18n.t("shareVia")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onHide}
          style={[Style.containers.row, { width: width - 80, marginTop: 10 }]}
        >
          <Text
            style={[
              Style.text.md,
              Style.text.semibold,
              Style.text.basic,
              { marginTop: 8 },
            ]}
          >
            {i18n.t("close")}
          </Text>
        </TouchableOpacity>
      </BlurView>
    </ActionSheet>
  );
}

function EventAboutSheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;

  const [name, setName] = React.useState(event.name);
  const [description, setDescription] = React.useState(event.description);
  const [tags, setTags] = React.useState(event.tags);
  const [artists, setArtists] = React.useState(event.lineup);

  const onAboutUpdate = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/about", {
        auth,
        oid,
        eid,
        name,
        description,
        tags,
        artists: artists.map((a) => a.id),
      });
      if (res.isError) throw "e";
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
      onBeforeClose={onAboutUpdate}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "flex-start",
            width: width - 20,
            marginTop: 10,
            paddingHorizontal: 10,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
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
                  Style.text.lg,
                  { marginBottom: 4 },
                ]}
              >
                {i18n.t("name")}
              </Text>
              <Text
                style={[
                  Style.text.normal,
                  Style.text.md,
                  Style.transparency.lg,
                ]}
              >
                {i18n.t("eventNameDesc")}
              </Text>
            </View>
            <View style={[Style.input.container]}>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("enter_event_name")}
                value={name}
                onChangeText={(val) => setName(val)}
              />
            </View>

            <View
              style={{
                borderRadius: 5,
                paddingVertical: 8,
                marginTop: 15,
                backgroundColor: theme["color-basic-100"],
              }}
            >
              <Text
                style={[
                  Style.text.semibold,
                  Style.text.lg,
                  { marginBottom: 4 },
                ]}
              >
                {i18n.t("description")}
              </Text>
              <Text
                style={[
                  Style.text.normal,
                  Style.text.md,
                  Style.transparency.lg,
                ]}
              >
                {i18n.t("eventDescriptionDesc")}
              </Text>
            </View>
            <View style={[Style.input.multiline]}>
              <TextInput
                multiline
                numberOfLines={15}
                style={[Style.input.text]}
                enterKeyHint="next"
                placeholder={i18n.t("enter_event_description")}
                value={description}
                onChangeText={(val) => setDescription(val)}
              />
            </View>
            <View
              style={{
                borderRadius: 5,
                paddingVertical: 8,
                marginTop: 15,
                backgroundColor: theme["color-basic-100"],
              }}
            >
              <Text
                style={[
                  Style.text.semibold,
                  Style.text.lg,
                  { marginBottom: 4 },
                ]}
              >
                {i18n.t("artists")}
              </Text>
              <Text
                style={[
                  Style.text.normal,
                  Style.text.md,
                  Style.transparency.lg,
                ]}
              >
                {i18n.t("artistsDesc")}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <ScrollView
          horizontal
          style={{
            marginVertical: 15,
            padding: 0,
            minWidth: width,
            left: -20,
          }}
          contentContainerStyle={{
            paddingHorizontal: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {artists.map((artistDatum, idx) => (
            <ArtistCard talent={artistDatum} />
          ))}
        </ScrollView>
      </View>
    </ActionSheet>
  );
}

function EventVisibilitySheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;
  const [privacy, setPrivacy] = React.useState(event.privacy);

  const onVisibilityUpdate = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/visibility", {
        auth,
        oid,
        eid,
        privacy,
      });
      if (res.isError) throw "e";
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };
  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
      onBeforeClose={onVisibilityUpdate}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "flex-start",
            width: "100%",
            marginTop: 10,
            paddingHorizontal: 10,
          },
        ]}
      >
        <View
          style={{
            width: "100%",
            paddingTop: 15,
            paddingBottom: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[Style.text.xl, Style.text.semibold, Style.text.dark]}>
              {i18n.t(privacy == "public" ? "publicEvent" : "privateEvent")}
            </Text>
          </View>
          <Switch
            trackColor={{
              false: theme["color-basic-200"],
              true: theme["color-organizer-200"],
            }}
            thumbColor={
              privacy == "public" ? theme["color-organizer-500"] : "#f4f3f4"
            }
            ios_backgroundColor={theme["color-basic-200"]}
            onValueChange={() => {
              setPrivacy(privacy == "public" ? "private" : "public");
            }}
            value={privacy == "public"}
          />
        </View>
        <Text style={[Style.text.md, Style.transparency.md, Style.text.dark]}>
          {i18n.t(privacy == "public" ? "publicEventDesc" : "privateEventDesc")}
        </Text>
      </View>
    </ActionSheet>
  );
}

function EventDateSheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;

  const [startDateTime, setStartDateTime] = React.useState(event.start);
  const [endDateTime, setEndDateTime] = React.useState(event.end);

  const onDateUpdate = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/date", {
        auth,
        oid,
        eid,
        timezone: "Etc/Universal",
        startDateTime: startDateTime.utc().format(),
        endDateTime: endDateTime.utc().format(),
        startTimeVisibility: true,
        endTimeVisibility: true,
      });
      if (res.isError) throw "e";

      load();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={false}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "flex-start",
        display: "flex",
        width: "100%",
      }}
      onBeforeClose={onDateUpdate}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "flex-start",
            marginTop: 10,
            paddingHorizontal: 10,
          },
        ]}
      >
        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            width: "100%",
            backgroundColor: theme["color-basic-100"],
          }}
        >
          <Text
            style={[
              Style.text.semibold,
              Style.text.lg,
              { alignSelf: "flex-start", width: "100%", marginBottom: 4 },
            ]}
          >
            {i18n.t("eventStartTime")}
          </Text>
        </View>
        <DateTimePicker
          value={startDateTime.toDate()}
          mode="datetime"
          minuteInterval={15}
          minimumDate={new Date()}
          // timeZoneName="Etc/Universal"
          onChange={(e, date) => setStartDateTime(moment(date))}
        />
        <View
          style={{
            marginTop: 20,
            borderRadius: 5,
            paddingVertical: 8,
            backgroundColor: theme["color-basic-100"],
          }}
        >
          <Text
            style={[Style.text.semibold, Style.text.lg, { marginBottom: 4 }]}
          >
            {i18n.t("eventEndTime")}
          </Text>
        </View>
        <DateTimePicker
          // timeZoneName="Etc/Universal"
          value={endDateTime.toDate()}
          mode="datetime"
          display="spinner"
          minuteInterval={15}
          minimumDate={startDateTime.toDate()}
          onChange={(e, date) => setEndDateTime(moment(date))}
        />
      </View>
    </ActionSheet>
  );
}

function EventPhysicalTicketsSheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;

  const [activeTierIdx, setActiveTierIdx] = React.useState(0);
  const [physicalTicketsAmount, setPhysicalTicketsAmount] = React.useState("");

  const onGeneratePhysicalTickets = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post(
        "/organizations/events/physical_tickets/generate",
        { auth, oid, eid, tidx: activeTierIdx, amount: physicalTicketsAmount },
      );
      if (res.isError) throw "e";

      SheetManager.hide("event-physical-tickets-sheet");
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={false}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: "100%",
      }}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "center",
            marginTop: 10,
            width: "100%",
            paddingHorizontal: 10,
          },
        ]}
      >
        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            width: "100%",
            backgroundColor: theme["color-basic-100"],
            marginBottom: 15,
          }}
        >
          <Text
            style={[
              Style.text.semibold,
              Style.text.xl,
              Style.text.organizer,
              {
                alignSelf: "center",
                textAlign: "center",
                width: "100%",
                marginBottom: 4,
              },
            ]}
          >
            {i18n.t("genPhysTicks")}
          </Text>
        </View>

        {event.tiers.map((tier, tidx) => (
          <Pressable
            key={"tier-" + tidx}
            onPress={() => setActiveTierIdx(tidx)}
            style={[
              Style.containers.row,
              {
                width: "100%",
                paddingHorizontal: 20,
                paddingVertical: 15,
                marginVertical: 6,
                backgroundColor: theme["color-basic-400"],
                borderRadius: 6,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.semibold,
                  Style.text.xl,
                  { marginBottom: 4 },
                ]}
              >
                ${CurrencyFormatter(tier.amount)}
              </Text>
              <Text style={[Style.text.dark, Style.text.semibold]}>
                {tier.name}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            {activeTierIdx == tidx && (
              <Feather
                name="check"
                size={24}
                color={theme["color-organizer-500"]}
              />
            )}
          </Pressable>
        ))}
        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            backgroundColor: theme["color-basic-100"],
            alignSelf: "flex-start",
            textAlign: "left",
            marginTop: 20,
          }}
        >
          <Text
            style={[Style.text.semibold, Style.text.lg, { marginBottom: 4 }]}
          >
            {i18n.t("howManyTicks")}
          </Text>
        </View>
        <View style={[Style.input.container, { marginBottom: 30 }]}>
          <TextInput
            enterKeyHint="done"
            style={[Style.input.text]}
            placeholder={"1,000"}
            value={physicalTicketsAmount}
            keyboardType="numeric"
            onChangeText={(val) => setPhysicalTicketsAmount(val)}
          />
        </View>
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
        {!isLoading && (
          <TouchableOpacity
            disabled={
              physicalTicketsAmount == "" ||
              isNaN(parseInt(physicalTicketsAmount))
            }
            onPress={onGeneratePhysicalTickets}
            style={[
              Style.button.container,
              physicalTicketsAmount == "" ? Style.button.disabled : {},
              { width: "100%", backgroundColor: theme["color-organizer-500"] },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              {i18n.t("generate")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ActionSheet>
  );
}

function EventTierSheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;

  const { edit, tierEditIdx } = payload;
  const [tierName, setTierName] = React.useState(payload.name);
  const [tierAmount, setTierAmount] = React.useState(payload.amount);

  const onTierAdd = async () => {
    setIsLoading(true);

    try {
      let tier = {
        name: tierName,
        amount: tierAmount,
      };

      const res = await Api.post("/organizations/events/tier", {
        auth,
        oid,
        eid,
        tier,
        editIdx: tierEditIdx,
      });
      if (res.isError) throw "e";

      SheetManager.hide("event-tier-sheet");
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onTierDelete = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/tier/delete", {
        auth,
        oid,
        eid,
        tidx: tierEditIdx,
      });
      if (res.isError) throw "e";

      SheetManager.hide("event-tier-sheet");
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={false}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: "100%",
      }}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "center",
            marginTop: 10,
            width: "100%",
            paddingHorizontal: 10,
          },
        ]}
      >
        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            width: "100%",
            backgroundColor: theme["color-basic-100"],
            marginBottom: 10,
          }}
        >
          <Text
            style={[
              Style.text.semibold,
              Style.text.xl,
              Style.text.organizer,
              {
                alignSelf: "center",
                textAlign: "center",
                width: "100%",
                marginBottom: 4,
              },
            ]}
          >
            {i18n.t(edit ? "editTier" : "addTier")}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            backgroundColor: theme["color-basic-100"],
            alignSelf: "flex-start",
            textAlign: "left",
          }}
        >
          <Text
            style={[Style.text.semibold, Style.text.lg, { marginBottom: 4 }]}
          >
            {i18n.t("name")}
          </Text>
        </View>
        <View style={[Style.input.container, { marginBottom: 20 }]}>
          <TextInput
            enterKeyHint="next"
            style={[Style.input.text]}
            placeholder={i18n.t("tierNameSample")}
            value={tierName}
            keyboardType="default"
            onChangeText={(val) => setTierName(val)}
          />
        </View>

        {!edit && (
          <>
            <View
              style={{
                borderRadius: 5,
                paddingVertical: 8,
                backgroundColor: theme["color-basic-100"],
                alignSelf: "flex-start",
                textAlign: "left",
              }}
            >
              <Text
                style={[
                  Style.text.semibold,
                  Style.text.lg,
                  { marginBottom: 4 },
                ]}
              >
                {i18n.t("amount")}
              </Text>
            </View>
            <View style={[Style.input.container, { marginBottom: 30 }]}>
              <MaterialCommunityIcons
                style={[Style.button.prefix]}
                name="currency-usd"
                size={20}
                color={theme["color-basic-700"]}
              />
              <TextInput
                enterKeyHint="done"
                style={[Style.input.text]}
                placeholder={"20.00"}
                value={tierAmount}
                keyboardType="numeric"
                onChangeText={(val) => setTierAmount(val)}
              />
            </View>
          </>
        )}
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
        {!isLoading && (
          <TouchableOpacity
            disabled={
              tierName == "" || tierAmount == "" || isNaN(parseInt(tierAmount))
            }
            onPress={onTierAdd}
            style={[
              Style.button.container,
              tierName == "" || tierAmount == "" || isNaN(parseInt(tierAmount))
                ? Style.button.disabled
                : {},
              { width: "100%", backgroundColor: theme["color-organizer-500"] },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              {i18n.t("update")}
            </Text>
          </TouchableOpacity>
        )}
        {!isLoading && edit && (
          <TouchableOpacity
            onPress={onTierDelete}
            style={[
              Style.containers.column,
              {
                width: "100%",
                marginTop: 30,
                height: 30,
              },
            ]}
          >
            <Text style={[Style.text.danger, Style.text.semibold]}>
              {i18n.t("delete")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ActionSheet>
  );
}

function EventNodeTierSheet({ sheetId, payload }) {
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const event = payload?.event;
  const eid = event?.id;
  const node = payload?.node;
  const [nidx, setNidx] = React.useState(payload?.nodeIdx);

  const [activeTier, setActiveTier] = React.useState(node.tier);

  const onUpdateNode = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/node", {
        auth,
        oid,
        eid,
        idx: nidx,
        identifier: node.identifier,
        capacity: node.capacity,
        holdings: node.holdings,
        tier: activeTier,
        tierTasks: [],
      });
      if (res.isError) throw "e";

      SheetManager.hide("event-node-tier-sheet");
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={false}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: "100%",
      }}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "center",
            marginTop: 10,
            width: "100%",
            paddingHorizontal: 10,
          },
        ]}
      >
        <View
          style={{
            borderRadius: 5,
            paddingVertical: 8,
            width: "100%",
            backgroundColor: theme["color-basic-100"],
            marginBottom: 10,
            flexDirection: "row",
          }}
        >
          <Text
            style={[
              Style.text.semibold,
              Style.text.xl,
              Style.text.organizer,
              {
                flex: 1,
                textAlign: "left",
                width: "100%",
                marginBottom: 4,
              },
            ]}
          >
            Section {node.getTitle()}
          </Text>
          <View
            style={[
              Style.badge,
              {
                backgroundColor: theme["color-organizer-500"],
                shadowColor: theme["color-organizer-500"],
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[Style.text.semibold, Style.text.basic]}>
              Capacity {Commasize(node.capacity)}{" "}
              {node.holdings > 0 ? `(${node.holdings} Holds)` : ""}
            </Text>
          </View>
        </View>

        {event?.tiers.map((tier, tidx) => (
          <Pressable
            key={"tier-" + tidx}
            onPress={() => {
              setActiveTier(tier.identifier);
              setNidx(tidx);
            }}
            style={[
              Style.containers.row,
              {
                width: "100%",
                paddingHorizontal: 20,
                paddingVertical: 15,
                marginVertical: 6,
                backgroundColor: theme["color-basic-400"],
                borderRadius: 6,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.semibold,
                  Style.text.xl,
                  { marginBottom: 4 },
                ]}
              >
                ${CurrencyFormatter(tier.amount)}
              </Text>
              <Text style={[Style.text.dark, Style.text.semibold]}>
                {tier.name}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            {activeTier == tier.identifier && (
              <Feather
                name="check"
                size={24}
                color={theme["color-organizer-500"]}
              />
            )}
          </Pressable>
        ))}

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme["color-organizer-500"]}
          />
        )}
        {!isLoading && (
          <TouchableOpacity
            onPress={onUpdateNode}
            style={[
              Style.button.container,
              {
                marginTop: 30,
                width: "100%",
                backgroundColor: theme["color-organizer-500"],
              },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              {i18n.t("update")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* {tierTasks
        .filter(
          (t) => t.node == ev.nodes[activeNode].identifier,
        )
        .map((task, ttidx) => (
          <Col
            key={
              "TT-" + activeNode.identifier + task.identifier
            }
          >
            <Spacer y={1} />
            {task.date !== "2000-01-01" && (
              <Row justify="center" align="center">
                <Text
                  h3
                  css={{ m: 0 }}
                  align="center"
                  color={
                    validateTaskDate(task) ? "primary" : "error"
                  }
                >
                  and on
                </Text>
                <Spacer x={1} />
                <Input
                  value={task.date}
                  status={
                    validateTaskDate(task) ? "default" : "error"
                  }
                  size="xl"
                  width={300}
                  placeholder="Enter date"
                  type="date"
                  onChange={(e) =>
                    onDateTaskChange(task, e.target.value || "")
                  }
                />
                <Spacer x={1} />
                <Text
                  h3
                  css={{ m: 0 }}
                  align="center"
                  color={
                    validateTaskDate(task) ? "primary" : "error"
                  }
                >
                  change to
                </Text>
              </Row>
            )}
            {task.date == "2000-01-01" && (
              <Row justify="center" align="center">
                <Text
                  h3
                  css={{ m: 0 }}
                  align="center"
                  color={task.amount > 0 ? "primary" : "error"}
                >
                  and when
                </Text>
                <Spacer x={1} />
                <Input
                  value={task.amount}
                  status={task.amount > 0 ? "default" : "error"}
                  size="xl"
                  width={300}
                  placeholder="Enter amount"
                  type="number"
                  onChange={(e) =>
                    onAmountTaskChange(
                      task,
                      e.target.value || "",
                    )
                  }
                />
                <Spacer x={1} />
                <Text
                  h3
                  css={{ m: 0 }}
                  align="center"
                  color={task.amount > 0 ? "primary" : "error"}
                >
                  tickets sell change to
                </Text>
              </Row>
            )}
            <Spacer y={1} />
            <Radio.Group
              aria-label="Seating Tier"
              value={task.tier}
            >
              <Grid.Container gap={2} wrap="wrap">
                {ev?.tiers.map((tier, tidx) => (
                  <Grid key={"tier-card-" + tidx}>
                    <Card
                      variant="flat"
                      onPress={() =>
                        onTierTaskChange(task, tier)
                      }
                      isPressable
                      css={{ w: "200px" }}
                    >
                      <Card.Body>
                        <Row justify="end">
                          <Radio
                            aria-label={tier.name}
                            value={tier.identifier}
                          ></Radio>
                        </Row>
                        <Row justify="center">
                          <Text h3>
                            ${CurrencyFormatter(tier.amount)}
                          </Text>
                        </Row>
                        <Row justify="center">
                          <Text h5>{tier.name}</Text>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Grid>
                ))}
              </Grid.Container>
            </Radio.Group>
            <Row justify="end">
              {task.date != "2000-01-01" && (
                <Button
                  color="primary"
                  onPress={() =>
                    onTaskTypeSwitch(task, "tickets")
                  }
                  ripple={false}
                  auto
                  light
                >
                  Switch to Tickets Sold Based
                </Button>
              )}
              {task.date == "2000-01-01" && (
                <Button
                  color="primary"
                  onPress={() => onTaskTypeSwitch(task, "date")}
                  ripple={false}
                  auto
                  light
                >
                  Switch to Date Based
                </Button>
              )}
              <Button
                color="error"
                onPress={() => onTaskRemove(task)}
                ripple={false}
                auto
                light
              >
                Remove
              </Button>
            </Row>
          </Col>
        ))}
      <Spacer y={1}></Spacer>
      <Row css={{ flexDirection: "column" }}>
        <Text h4 weight="normal">
          {ev.nodes[activeNode].getIdentifier()}'s Capacity
        </Text>
        <Text>
          Limit the capacity of this section. By default this is
          the capacity established by the venue.
        </Text>
        <Spacer y={1}></Spacer>
        <Input
          {...capacityBindings}
          status={capacityHelper.color}
          helperText={capacityHelper.text}
          helperColor={capacityHelper.color}
          color={capacityHelper.color}
          size="xl"
          aria-label="Holdings"
          width="80%"
          placeholder="Enter amount..."
          contentLeft={
            <Text>
              {ev.nodes[activeNode].capacity -
                ev.nodes[activeNode].available}
            </Text>
          }
          contentRight={
            <Text css={{ marginLeft: "-1em" }}>
              /&nbsp;
              {Commasize(ev.nodes[activeNode].extra.maxCap)}
            </Text>
          }
        />
      </Row>
      <Spacer y={1}></Spacer>
      <Row css={{ flexDirection: "column" }}>
        <Text h4 weight="normal">
          {ev.nodes[activeNode].getIdentifier()}'s Holds
        </Text>
        <Text>Reserve seats for your team</Text>
        <Spacer y={1}></Spacer>
        <Input
          {...holdingsBindings}
          status={holdingsHelper.color}
          helperText={holdingsHelper.text}
          helperColor={holdingsHelper.color}
          color={holdingsHelper.color}
          size="xl"
          aria-label="Holdings"
          width="80%"
          placeholder="Enter amount..."
          contentRight={
            <Text css={{ marginLeft: "-1em" }}>
              /&nbsp;
              {Commasize(
                parseInt(capacityAmount) -
                  ev.nodes[activeNode].booked,
              )}
            </Text>
          }
        />
      </Row> */}
    </ActionSheet>
  );
}

function EventTicketViewerSheet({ sheetId, payload }) {
  const { tickets, event } = payload;
  const [activePager, setActivePager] = React.useState(0);
  const { height, width } = Dimensions.get("window");

  // const passNfc = async () => {
  //   try {
  //     await NfcManager.requestTechnology(NfcTech.Ndef);
  //     const bytes = Ndef.encodeMessage([Ndef.textRecord("hi")]);
  //     await NfcManager.ndefHandler.writeNdefMessage(bytes);
  //   } catch (ex) {
  //     console.warn(ex);
  //     Alert.alert("Error", "Failed to write text to NFC tag");
  //   } finally {
  //     NfcManager.cancelTechnologyRequest();
  //   }
  // };

  // React.useEffect(() => {
  //   NfcManager.start().catch((_) => {});

  //   // passNfc();
  //   //
  //   NfcManager.registerTagEvent();
  //   NfcManager.setEventListener(NfcEvents.DiscoverTag, () => alert("D"));

  //   return () => {
  //     NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  //   };
  // }, []);

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-primary-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: width,
      }}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "center",
            marginTop: 10,
            width: "100%",
            paddingHorizontal: 10,
            height: height * 0.8,
          },
        ]}
      >
        <PagerView
          onPageScroll={(e) => setActivePager(e.nativeEvent.position)}
          style={{
            flex: 1,
            width: width,
            marginTop: 10,
            marginBottom: 20,
          }}
          initialPage={0}
        >
          {tickets.map((ticket, tidx) => (
            <TicketComponent key={tidx} ticket={ticket} />
          ))}
        </PagerView>
        <View style={[Style.containers.row, { marginTop: 5 }]}>
          {tickets.map((_p, pidx) => (
            <View
              key={"_pager-" + pidx}
              style={{
                height: 8,
                width: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor:
                  pidx == activePager
                    ? theme["color-primary-500"]
                    : theme["color-basic-500"],
              }}
            />
          ))}
        </View>

        <View
          style={[
            Style.containers.row,
            {
              justifyContent: "space-evenly",
              width: width,
              marginTop: 25,
              marginBottom: 5,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL("https://facebook.com/ticketsfour")}
          >
            <Feather
              name="facebook"
              color={theme["color-primary-500"]}
              size={26}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.instagram.com/ticketsfour")
            }
          >
            <MaterialCommunityIcons
              name="instagram"
              color={theme["color-primary-500"]}
              size={28}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.x.com/ticketsfourapp")}
          >
            <FontAwesome6
              name="x-twitter"
              color={theme["color-primary-500"]}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.tiktok.com/@ticketsfour")
            }
          >
            <FontAwesome6
              name="tiktok"
              color={theme["color-primary-500"]}
              size={22}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.linkedin.com/company/ticketsfour")
            }
          >
            <FontAwesome6
              name="linkedin-in"
              color={theme["color-primary-500"]}
              size={24}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
}

function EventOfflineScannerSheet({ sheetId, payload }) {
  const { sql, generateOfflineKey } = useOfflineProvider();
  const { auth, defaultOrganization: oid } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const eid = payload.eid;
  const [ticketsAmount, setTicketsAmount] = React.useState(0);
  const [progressAmount, setProgressAmount] = React.useState(0);

  const load = async () => {
    setIsLoading(true);
    setProgressAmount(0);

    let checksum = await generateOfflineKey();

    try {
      const res = await Api.get("/organizations/events/offline", {
        auth,
        oid,
        eid,
        checksum,
      });
      if (res.isError) throw "e";

      setTicketsAmount(res.data.ticketsAmount);
      setIsLoading(false);

      await sql.post(`
        DELETE FROM APOCALYPSE
      `);

      for (let i = 0; i < res.data.tickets.length; i++) {
        let ticket = res.data.tickets[i];

        await sql.post(
          `
          REPLACE INTO APOCALYPSE (
            eid,
            id,
            token,
            attended,
            timeAttended,
            offloaded
          ) VALUES (
            $eid,
            $id,
            $token,
            $attended,
            $timeAttended,
            $offloaded
          );
          `,
          {
            $eid: eid,
            $id: ticket.id,
            $token: ticket.token,
            $attended: ticket.attended,
            $timeAttended: moment(ticket.timeAttended).valueOf(),
            $offloaded: false,
          },
        );

        setProgressAmount(i + 1);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={false}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: "100%",
      }}
    >
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "center",
            marginTop: 10,
            width: "100%",
            paddingHorizontal: 10,
          },
        ]}
      >
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme["color-organizer-500"]}
          />
        )}
        {!isLoading && (
          <>
            <Text style={[Style.text.semibold, Style.text.dark]}>
              {i18n.t("savingTickets")}
            </Text>
            <Text
              style={[
                Style.text.bold,
                { fontSize: 52, marginTop: 20 },
                Style.text.organizer,
              ]}
            >
              {progressAmount} / {ticketsAmount}
            </Text>

            <Text
              style={[
                Style.text.semibold,
                Style.text.lg,
                Style.text.dark,
                { marginTop: 30, textAlign: "center" },
              ]}
            >
              {i18n.t("offlineAirplane")}
            </Text>
          </>
        )}
      </View>
    </ActionSheet>
  );
}

export {
  EventsShareSheet,
  EventAboutSheet,
  EventDateSheet,
  EventVisibilitySheet,
  EventPhysicalTicketsSheet,
  EventTierSheet,
  EventTicketViewerSheet,
  EventOfflineScannerSheet,
  EventNodeTierSheet,
};
export default EventsShareSheet;
