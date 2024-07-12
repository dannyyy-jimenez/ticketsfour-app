///tickets/verify 6621a60afb6af7a6170236f7 pi_3PCZq0A60uJAVJy31fgHDES2 pi_3PCZq0A60uJAVJy31fgHDES2_secret_JoIeQp1y6bJyXd28QQtQVJ4HB

import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import LayoutContainer, {
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import {
  FontAwesome6,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import { useLocalSearchParams } from "expo-router";
import Ticket from "../../../models/Ticket";
import PagerView from "react-native-pager-view";
import TicketComponent from "../../../utils/components/Ticket";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArtistCard from "../../../utils/components/Talent";
import WebView from "react-native-webview";
import { StatusBar } from "expo-status-bar";

export default function TicketVerifierScreen() {
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const { session, auth, signOut } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [isExpired, setIsExpired] = React.useState(false);
  const [tickets, setTickets] = React.useState([]);
  const [activeTicketIdx, setActiveTicketIdx] = React.useState(0);
  const [artists, setArtists] = React.useState([]);
  const { eid, intent, secret } = useLocalSearchParams();
  const [activePager, setActivePager] = React.useState(0);
  const insets = useSafeAreaInsets();

  const loadTalent = async () => {
    try {
      const artistsres = await Api.get("/event/talent", { auth, eid });

      if (!artistsres.isError) {
        setArtists(artistsres.data.artists);
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setIsExpired(false);

    (async () => {
      try {
        if (!intent || !secret) throw "BAD_PARAMS";

        const res = await Api.get("/tickets/verify", {
          auth,
          eid,
          piid: intent,
        });

        if (res.isError) throw res.data.message;

        if (res.data.tickets) {
          setTickets(res.data.tickets.map((t) => new Ticket({ ...t })));
        }

        setIsLoading(false);

        loadTalent();
      } catch (e) {
        console.log(e);
        if (e === "BAD_PARAMS") {
          return;
        }
        if (e === "EXPIRED") {
          setIsExpired(true);
        } else {
          setIsError(true);
        }
        setIsLoading(false);
      }
    })();
  }, [eid, intent, secret]);

  if (isLoading)
    return (
      <LayoutContainer>
        <View style={{ paddingVertical: 30 }}>
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        </View>
      </LayoutContainer>
    );

  if (isError && !isExpired)
    return (
      <LayoutContainer>
        <View style={[{ paddingVertical: 30 }, Style.containers.column]}>
          <Text
            style={[
              Style.text.danger,
              Style.text.semibold,
              { textAlign: "center", fontSize: 64, marginBottom: 20 },
            ]}
          >
            😭
          </Text>
          <Text
            style={[
              Style.text.danger,
              Style.text.xl,
              Style.text.semibold,
              { textAlign: "center" },
            ]}
          >
            {i18n.t("issueProcessingPayment")}
          </Text>
          <Text
            style={[
              Style.text.dark,
              Style.text.lg,
              Style.text.semibold,
              { textAlign: "center", marginTop: 20 },
            ]}
          >
            {i18n.t("processingPaymentError")}
          </Text>
        </View>
      </LayoutContainer>
    );

  if (isExpired)
    return (
      <LayoutContainer>
        <View style={[{ paddingVertical: 30 }, Style.containers.column]}>
          <Text
            style={[
              Style.text.danger,
              Style.text.semibold,
              { textAlign: "center", fontSize: 64, marginBottom: 20 },
            ]}
          >
            ⌛️
          </Text>
          <Text
            style={[
              Style.text.danger,
              Style.text.xl,
              Style.text.semibold,
              { textAlign: "center" },
            ]}
          >
            {i18n.t("paymentVerifExp")}
          </Text>
          <Text
            style={[
              Style.text.dark,
              Style.text.lg,
              Style.text.semibold,
              { textAlign: "center", marginTop: 20 },
            ]}
          >
            {i18n.t("viewFromMobile")}
          </Text>
        </View>
      </LayoutContainer>
    );

  return (
    <>
      {Platform.OS == "android" && <StatusBar hidden />}
      <ScrollContainer style={{ paddingVertical: 20, paddingBottom: 5 }}>
        {artists.length > 0 && (
          <>
            <Text
              style={[
                Style.text.xxl,
                Style.text.semibold,
                { textAlign: "center", paddingVertical: 4 },
              ]}
            >
              You Got{" "}
              <Text style={{ color: theme["color-primary-500"] }}>
                Tickets Four
              </Text>
            </Text>
            <Text
              style={[
                Style.text.xxl,
                Style.text.semibold,
                { textAlign: "center", paddingVertical: 4 },
              ]}
            >
              An Unforgettable{" "}
              <Text style={{ color: theme["color-primary-500"] }}>Lineup</Text>
            </Text>
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
                { textAlign: "center", paddingVertical: 2, marginBottom: 8 },
              ]}
            >
              Make sure to practice for the event!
            </Text>
            {artists.map((talent) => (
              <ArtistCard style={{ marginVertical: 10 }} talent={talent} />
            ))}

            <Text
              style={[
                Style.text.xxl,
                Style.text.semibold,
                { textAlign: "center", paddingVertical: 4, marginTop: 8 },
              ]}
            >
              <Text style={{ color: theme["color-primary-500"] }}>Music</Text>{" "}
              That{" "}
              <Text style={{ color: theme["color-primary-500"] }}>
                Elevates
              </Text>{" "}
              Your{" "}
              <Text style={{ color: theme["color-primary-500"] }}>Soul</Text>
            </Text>
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
                { textAlign: "center", paddingVertical: 2, marginBottom: 15 },
              ]}
            >
              Checkout the most recent music from these artists
            </Text>
            {artists.map((talent, tidx) => (
              <WebView
                key={"talent-" + tidx}
                style={{ width: "100%", marginVertical: 4, height: 480 }}
                source={{ uri: talent.embed }}
              />
            ))}
          </>
        )}
        <Text
          style={[
            Style.text.dark,
            Style.text.xl,
            Style.text.semibold,
            { textAlign: "center", paddingVertical: 2 },
          ]}
        >
          {i18n.t("ticketsNextStep")}
        </Text>
        <Text
          style={[
            Style.text.primary,
            Style.text.xxl,
            Style.text.semibold,
            { textAlign: "center", paddingVertical: 2 },
          ]}
        >
          {i18n.t("danceNoOneWatching")}
        </Text>
        <View
          style={[
            Style.containers.row,
            {
              justifyContent: "space-evenly",
              width: "100%",
              marginTop: 15,
              marginBottom: 10,
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
        <PagerView
          onPageScroll={(e) => setActivePager(e.nativeEvent.position)}
          style={{
            flex: 1,
            minHeight: height * 0.68,
            marginTop: 10,
            marginBottom: 10,
          }}
          initialPage={0}
        >
          {tickets.map((ticket, tidx) => (
            <TicketComponent key={tidx} hidden ticket={ticket} />
          ))}
        </PagerView>
        <View style={[Style.containers.row, { marginTop: 5 }]}>
          {tickets.map((_p, pidx) => (
            <View
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
      </ScrollContainer>
    </>
  );
}
