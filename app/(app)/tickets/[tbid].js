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
import { useLocalSearchParams } from "expo-router";
import Ticket from "../../../models/Ticket";
import PagerView from "react-native-pager-view";
import TicketComponent from "../../../utils/components/Ticket";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { tbid } = useLocalSearchParams();

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

  React.useEffect(() => {
    if (!eventId) return;

    loadTalent();
  }, [eventId]);

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
      setIsLoading(false);
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!tbid) return;

    load();
  }, [tbid, auth]);

  const getError = () => {
    if (error === "NO_TTKN") {
      return (
        <>
          <Text h1 align="center">
            Oh oh! This tickets link is{" "}
            <span style={{ color: theme.colors.error.value }}>lost</span>!
          </Text>
          <Text h3 color="grey" align="center">
            Please use the most recent link sent to your phone number to view
            your tickets. Tickets will only be accesible using the link that was
            sent to your phone number. Each link is only associated with the
            respective purchase made.
          </Text>
        </>
      );
    }

    return (
      <>
        <Text h1 align="center">
          Oh oh! Looks like there was an issue{" "}
          <span style={{ color: theme.colors.error.value }}>retrieving</span>{" "}
          your tickets!
        </Text>
        <Text h3 color="grey" align="center">
          If you believe this was an error, please get in contact with support.
          Please have the phone number you used to create your purchase ready to
          go to facilitate the process.
        </Text>
      </>
    );
  };

  if (isLoading)
    return (
      <LayoutContainer>
        <View style={{ paddingVertical: 30 }}>
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        </View>
      </LayoutContainer>
    );

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
      style={{ paddingVertical: 20, flex: 1, paddingBottom: 75 }}
    >
      <Text
        style={[
          Style.text.danger,
          Style.text.semibold,
          { textAlign: "center", fontSize: 64, marginBottom: 20 },
        ]}
      >
        🥳
      </Text>
      <Text
        style={[
          Style.text.dark,
          Style.text.xxl,
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
      <Text
        style={[
          Style.text.dark,
          Style.text.lg,
          Style.text.semibold,
          { textAlign: "center", marginTop: 10 },
        ]}
      >
        {i18n.t("viewFromMobile")}
      </Text>

      <PagerView
        onPageScroll={(e) => setActivePager(e.nativeEvent.position)}
        style={{ flex: 1, marginTop: 40, marginBottom: 10 }}
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
  );
}
