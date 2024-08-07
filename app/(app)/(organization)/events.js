import React from "react";
import { useOfflineProvider, useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import {
  FlatScrollContainer,
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import {
  Feather,
  Octicons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "../../../locales/provider";
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import EventModel from "../../../models/Event";
import { OrgEventComponent } from "../../../utils/components/Event";
import { HoldItem } from "react-native-hold-menu";
import moment from "moment";

const RenderEvent = React.memo(
  ({ item: event }) => (
    <View key={event.id} style={[Style.containers.row, { marginVertical: 10 }]}>
      <OrgEventComponent showPrice={false} key={event.id} _event={event} />
    </View>
  ),
  (prevProps, nextProps) => {
    return prevProps.item.id == nextProps.item.id;
  },
);

export default function EventsScreen() {
  const { sql } = useOfflineProvider();
  const { auth, defaultOrganization: oid, signOut, isGuest } = useSession();
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const skeletonTasks = new Array(4).fill(0);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [canCreateEvent, setCanCreateEvent] = React.useState(false);
  const [canViewEventData, setCanViewEventData] = React.useState(false);

  const [filters, setFilters] = React.useState(new Set(["upcoming"]));
  const [isLoading, setIsLoading] = React.useState(true);
  const [upcomingEvents, setUpcomingEvents] = React.useState([]);
  const [pastEvents, setPastEvents] = React.useState([]);

  const events = React.useMemo(() => {
    if (filters.has("all"))
      return [...[...upcomingEvents].reverse(), ...[...pastEvents].reverse()];
    if (filters.has("past")) return [...pastEvents].reverse();

    return [...upcomingEvents];
  }, [filters, upcomingEvents, pastEvents]);

  const filterItems = [
    { text: i18n.t("selectFilter"), isTitle: true },
    {
      text: i18n.t("all"),
      onPress: () => {
        setFilters(new Set(["all"]));
      },
      icon: "timer-off-outline",
    },
    {
      text: i18n.t("upcoming"),
      onPress: () => {
        setFilters(new Set(["upcoming"]));
      },
      icon: "timer-outline",
    },
    {
      text: i18n.t("past"),
      onPress: () => {
        setFilters(new Set(["past"]));
      },
      icon: "history",
    },
  ];

  const selectedFilters = React.useMemo(
    () => Array.from(filters).join(", ").replaceAll("_", " "),
    [filters],
  );

  const loadFuture = async () => {
    setIsLoading(true);
    try {
      let _events = [];

      let now = moment.utc();
      const localres = await sql.get(`
        SELECT *
          FROM GENESIS
          WHERE
            oid = '${oid}'
          ORDER BY start
      `);

      _events = localres
        .map((ev) => new EventModel({ ...ev }))
        .sort((a, b) => a.start - b.start);

      setUpcomingEvents(_events);

      if (localres.length > 0) {
        setIsLoading(false);
      }

      const res = await Api.get("/organizations/events", {
        auth,
        oid,
        filter: "future",
        lazy: true,
      });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setCanCreateEvent(res.data.permissions.includes("EVENT_EDIT"));
      setCanViewEventData(
        res.data.permissions.includes("EVENT_DASHBOARD_VIEW"),
      );
      setIsLoading(false);

      for (let event of res.data.events) {
        if (localres.findIndex((e) => e.id == event.id) != -1) continue;

        let _event = new EventModel({ ...event });
        _events = [_event, ..._events];
      }

      setUpcomingEvents(_events);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const loadPast = async () => {
    try {
      const res = await Api.get("/organizations/events", {
        auth,
        oid,
        filter: "past",
        lazy: true,
      });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      let parsedEvs = res.data.events.map((ev) => new EventModel({ ...ev }));
      setPastEvents(parsedEvs);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setUpcomingEvents([]);
    setPastEvents([]);

    loadFuture();
    loadPast();
  };

  React.useEffect(() => {
    onRefresh();
  }, [oid]);

  return (
    <FlatScrollContainer
      paddingHorizontal={10}
      refreshControl={
        <RefreshControl
          tintColor={theme["color-organizer-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
      }}
      attributes={{
        ListHeaderComponent: (
          <View style={{ width: "100%", flex: 1 }}>
            <View
              style={[
                Style.containers.row,
                { width: "100%", justifyContent: "flex-end" },
              ]}
            >
              <HoldItem
                activateOn="tap"
                hapticFeedback="Heavy"
                items={filterItems}
              >
                <View style={[{ padding: 15 }, Style.containers.column]}>
                  <MaterialCommunityIcons
                    name="filter-variant"
                    color={theme["color-basic-700"]}
                    size={26}
                  />
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.sm,
                      Style.text.dark,
                      {
                        marginTop: 4,
                      },
                    ]}
                  >
                    {i18n.t("filters")}
                  </Text>
                </View>
              </HoldItem>
              {/* <TouchableOpacity
              onPress={() => setSection(2)}
              style={[{ padding: 15 }, Style.containers.column]}
            >
              <Feather size={26} color={theme["color-basic-700"]} name="plus" />
            </TouchableOpacity> */}
            </View>
            <View
              style={[
                Style.containers.row,
                { width: "100%", marginBottom: 10 },
              ]}
            >
              <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
                {i18n.t("events")}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() =>
                  SheetManager.show("helper-sheet", {
                    payload: { text: "eventsDescFeed" },
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
            {isLoading &&
              skeletonTasks.map((_d, lidx) => (
                <SkeletonLoader
                  key={"loading-" + lidx}
                  highlightColor="#DDD"
                  boneColor="#EEE"
                >
                  <SkeletonLoader.Container
                    style={[
                      Style.cards.creativeText,
                      {
                        backgroundColor: "transparent",
                        width: width * 0.9,
                        height: height * 0.4,
                        margin: 10,
                      },
                    ]}
                  >
                    <SkeletonLoader.Item
                      style={[
                        Style.cards.creativeText,
                        {
                          backgroundColor: "transparent",
                          width: width * 0.9,
                          height: height * 0.4,
                          margin: 10,
                        },
                      ]}
                    />
                  </SkeletonLoader.Container>
                </SkeletonLoader>
              ))}
          </View>
        ),
        removeClippedSubviews: true,
        getItemLayout: (data, index) => ({
          length: 130,
          offset: 130 * index,
          index,
        }),
      }}
      data={events}
      renderItem={(params) => <RenderEvent {...params} />}
    />
  );
}
