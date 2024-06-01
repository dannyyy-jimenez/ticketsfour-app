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
import { router, useLocalSearchParams } from "expo-router";
import Ticket from "../../../models/Ticket";
import PagerView from "react-native-pager-view";
import TicketComponent from "../../../utils/components/Ticket";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReplaceWithStyle } from "../../../utils/Formatters";
import { TypeAnimation } from "react-native-type-animation";

export default function TicketBundlerScreen() {
  const { i18n } = useLocalization();
  const { auth } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [tickets, setTickets] = React.useState([]);
  const [activeTicketIdx, setActiveTicketIdx] = React.useState(0);
  const [artists, setArtists] = React.useState([]);
  const [eventId, setEventId] = React.useState(eid);
  const [isError, setIsError] = React.useState(false);
  const [isIssue, setIsIssue] = React.useState(false);
  const { tbid, eid, k } = useLocalSearchParams();
  const [activePager, setActivePager] = React.useState(0);
  const { height, width } = Dimensions.get("window");

  const loadTalent = async () => {
    try {
      const artistsres = await Api.get("/event/talent", { auth, eid: eventId });

      if (!artistsres.isError) {
        setArtists(artistsres.data.artists);
      }
    } catch (e) {
      alert(e);
    }
  };

  const load = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (typeof tbid == "undefined" || !tbid || typeof k == "undefined" || !k)
        throw "NO_TTKN";

      const res = await Api.get("/tickets", { auth, eid, tbid, k });

      if (res.isError) throw res.data.message;

      if (res.data.tickets) {
        setEventId(res.data.eid);
        setTickets(res.data.tickets.map((t) => new Ticket({ ...t })));
      }

      console.log(res);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setError(e);
      setIsLoading(false);
    }
  };

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/events");
    }
  };

  React.useEffect(() => {
    if (!eventId) return;

    loadTalent();
  }, [eventId]);

  React.useEffect(() => {
    if (!tbid) return;

    load();
  }, [tbid, auth]);

  if (isLoading)
    return (
      <LayoutContainer>
        <View style={{ paddingVertical: 30 }}>
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        </View>
      </LayoutContainer>
    );

  if (error === "NO_TTKN") {
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
            {ReplaceWithStyle(
              i18n.t("ticketLinkLost"),
              "{lost}",
              <Text style={[Style.text.primary, Style.text.semibold]}>
                {i18n.t("lost")}
              </Text>,
            )}
          </Text>
          <Text
            style={[
              Style.text.dark,
              Style.text.lg,
              Style.text.semibold,
              { textAlign: "center", marginTop: 20 },
            ]}
          >
            {i18n.t("useRecentLink")}
          </Text>
        </View>
      </LayoutContainer>
    );
  }

  if (isError && !isIssue)
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

  if (isIssue)
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
    <ScrollContainer
      style={{
        paddingTop: 20,
        flex: 1,
        paddingBottom: 0,
      }}
    >
      <TouchableOpacity
        style={[
          Style.button.round,
          Style.elevated,
          { zIndex: 100, padding: 0, position: "absolute", left: 0 },
        ]}
        onPress={onClose}
      >
        <Feather name="x" size={20} color={theme["color-basic-700"]} />
      </TouchableOpacity>
      <TypeAnimation
        sequence={[{ text: i18n.t("quoteHellen") }]}
        style={{
          ...Style.text.primary,
          ...Style.text.xxl,
          ...Style.text.bold,
          ...{ textAlign: "center", fontStyle: "italic", paddingVertical: 2 },
        }}
      />
      <Text
        style={[
          Style.text.organizer,
          Style.text.semibold,
          {
            textAlign: "right",
            marginTop: 6,
            paddingVertical: 2,
          },
        ]}
      >
        - Hellen Keller
      </Text>
      <PagerView
        onPageScroll={(e) => setActivePager(e.nativeEvent.position)}
        style={{
          flex: 1,
          width: "100%",
          left: -10,
          marginTop: 10,
          marginBottom: 10,
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
  );
}
