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
  RefreshControl,
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
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import EventModel from "../../../models/Event";
import { OrgEventComponent } from "../../../utils/components/Event";
import { HoldItem } from "react-native-hold-menu";

export default function EventsScreen() {
  const { auth, defaultOrganization: oid, signOut, isGuest } = useSession();
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const skeletonTasks = new Array(4).fill(0);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [canCreateEvent, setCanCreateEvent] = React.useState(false);
  const [canViewEventData, setCanViewEventData] = React.useState(false);

  const [isVisible, setIsVisible] = React.useState(false);
  const [filters, setFilters] = React.useState(new Set(["all"]));
  const [isLoading, setIsLoading] = React.useState(true);
  const [defEvs, setDefEvs] = React.useState([]);
  const [events, setEvents] = React.useState([]);

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

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await Api.get("/organizations/events", { auth, oid });
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
      let parsedEvs = res.data.events.map((ev) => new EventModel({ ...ev }));
      setDefEvs(parsedEvs);
      setEvents(parsedEvs);

      if (parsedEvs.filter((e) => !e.isInPast).length != 0) {
        setFilters(new Set(["upcoming"]));
      } else {
        setFilters(new Set(["all"]));
      }
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (filters.has("all")) return setEvents([...defEvs].reverse());
    if (filters.has("past"))
      return setEvents([...defEvs].filter((e) => e.isInPast).reverse());

    return setEvents([...defEvs].filter((e) => !e.isInPast));
  }, [filters]);

  const onRefresh = () => {
    load();
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ScrollContainer
      refreshControl={
        <RefreshControl
          tintColor={theme["color-organizer-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View>
        <View style={[Style.containers.row, { justifyContent: "flex-end" }]}>
          <HoldItem
            closeOnTap
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
        <View style={[Style.containers.row, { marginBottom: 10 }]}>
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
            <Feather name="info" size={20} color={theme["color-basic-700"]} />
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

        {events.map((event) => (
          <View
            key={event.id}
            style={[Style.containers.row, { marginVertical: 10 }]}
          >
            <OrgEventComponent
              showPrice={false}
              key={event.id}
              i18n={i18n}
              _event={event}
            />
          </View>
        ))}
      </View>
    </ScrollContainer>
  );
}
