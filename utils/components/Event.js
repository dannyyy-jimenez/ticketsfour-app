import React from "react";
import {
  Dimensions,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Style, { theme } from "../../utils/Styles";
import EventModel from "../../models/Event";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { Commasize, CurrencyFormatter, NumFormatter } from "../Formatters";
import { SheetManager } from "react-native-actions-sheet";
import { Pressable } from "react-native";
import SkeletonLoader from "expo-skeleton-loader";
import { useOfflineProvider, useSession } from "../ctx";
import Api from "../Api";

export function OrgEventComponent({
  i18n,
  _event,
  reload,
  withinMap = false,
  showPrice = true,
  lazyLoaded = true,
}) {
  const { sql } = useOfflineProvider();
  const { auth, defaultOrganization: oid } = useSession();
  const animation = new Animated.Value(0);
  const inputRange = [0, 1];
  const outputRange = [1, 0.8];
  const scale = animation.interpolate({ inputRange, outputRange });
  const event = React.useMemo(() => {
    return new EventModel({ ..._event });
  }, [_event]);
  const { width, height } = Dimensions.get("window");
  const [isLoading, setIsLoading] = React.useState(true);
  const [venue, setVenue] = React.useState(null);
  const [views, setViews] = React.useState(0);
  const [shares, setShares] = React.useState(0);
  const [attendees, setAttendees] = React.useState(0);
  const [basePrice, setBasePrice] = React.useState(0);

  const onPressIn = () => {
    Animated.spring(animation, {
      toValue: 0.3,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const onView = () => {
    router.push("/organization/events/" + event.id);
  };

  const onShare = () => {
    SheetManager.show("events-share-sheet", {
      payload: {
        event,
      },
    });
  };

  const Container = ({ children }) =>
    withinMap ? (
      <BlurView
        key={event.id}
        intensity={100}
        style={[
          Style.cards.showoff,
          {
            maxWidth: 400,
            width: width - 24,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            overflow: "hidden",
          },
        ]}
      >
        {children}
      </BlurView>
    ) : (
      <Animated.View
        key={event.id}
        style={[
          Style.cards.showoff,
          Style.elevated,
          {
            margin: 0,
            maxWidth: 400,
            width: "100%",
            padding: 0,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await Api.get("/organizations/event/lazy", {
          auth,
          oid,
          eid: event.id,
        });
        if (res.isError) throw "e";

        setVenue(res.data.venue);
        setAttendees(Commasize(res.data.attendees));
        setShares(NumFormatter(res.data.shares));
        setViews(NumFormatter(res.data.views));
        setBasePrice(res.data.event.basePrice);

        sql.post(
          `
          REPLACE INTO GENESIS (
            oid,
            id,
            cover,
            name,
            start,
            status,
            active
          ) VALUES (
            $oid,
            $id,
            $cover,
            $name,
            $start,
            $status,
            $active
          );
          `,
          {
            $oid: oid,
            $id: res.data.event.id,
            $cover: res.data.event.cover,
            $name: res.data.event.name,
            $start: res.data.event.start,
            $status: res.data.event.status,
            $active: res.data.event.active,
          },
        );
        setIsLoading(false);
      } catch (e) {
        setAttendees(event.getAttendees());
        setShares(event.getShares());
        setViews(event.getViews());

        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Container>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onView}
        style={{ width: "100%" }}
      >
        <Image
          style={{
            width: "100%",
            height: 400,
            borderRadius: 4,
          }}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: event.coverT }}
          width={500}
          height={500}
        />
        <View
          style={[
            Style.containers.column,
            {
              position: "absolute",
              backgroundColor: theme["color-basic-800-40"],
              padding: 10,
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              borderRadius: 10,
            },
          ]}
        >
          <View style={[Style.containers.row, { width: "100%" }]}>
            <Image
              style={{
                width: 75,
                height: 100,
                borderRadius: 4,
              }}
              cachePolicy={"memory-disk"}
              contentFit="contain"
              source={{ uri: event.coverT }}
              width={300}
              height={400}
            />
            <View
              style={[
                Style.containers.column,
                { alignItems: "flex-start", flex: 1, marginHorizontal: 12 },
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
          </View>

          <View style={{ flex: 1 }} />
          <View style={[Style.containers.row]}>
            <View
              style={[Style.containers.column, { alignItems: "flex-start" }]}
            >
              {!isLoading && venue != null && (
                <>
                  <Text
                    style={[
                      Style.text.md,
                      Style.text.bold,
                      Style.text.basic,
                      { marginVertical: 2 },
                    ]}
                  >
                    {venue.name}
                  </Text>
                  <Text
                    style={[
                      Style.text.md,
                      Style.text.bold,
                      Style.text.basic,
                      { marginVertical: 1 },
                    ]}
                  >
                    {venue.city}, {venue.region_ab}
                  </Text>
                </>
              )}
              {isLoading && (
                <>
                  <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                    <SkeletonLoader.Container
                      style={[
                        {
                          padding: 0,
                          height: 15,
                          borderRadius: 2,
                          opacity: 0.3,
                          overflow: "hidden",
                          width: 40,
                        },
                      ]}
                    >
                      <SkeletonLoader.Item style={[{ width: 40 }]} />
                    </SkeletonLoader.Container>
                  </SkeletonLoader>
                  <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                    <SkeletonLoader.Container
                      style={[
                        {
                          padding: 0,
                          height: 15,
                          borderRadius: 2,
                          opacity: 0.3,
                          marginTop: 4,
                          overflow: "hidden",
                          width: 100,
                        },
                      ]}
                    >
                      <SkeletonLoader.Item style={[{ width: 100 }]} />
                    </SkeletonLoader.Container>
                  </SkeletonLoader>
                </>
              )}
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onShare} style={{ padding: 10 }}>
              <Feather
                color={theme["color-basic-100"]}
                size={24}
                name="more-horizontal"
              />
            </TouchableOpacity>
            {isLoading && (
              <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                <SkeletonLoader.Container
                  style={[
                    {
                      padding: 0,
                      height: 15,
                      borderRadius: 2,
                      opacity: 0.3,
                      marginTop: 4,
                      overflow: "hidden",
                      width: 100,
                    },
                  ]}
                >
                  <SkeletonLoader.Item style={[{ width: 100 }]} />
                </SkeletonLoader.Container>
              </SkeletonLoader>
            )}
            {showPrice && !isLoading && (
              <View
                style={[
                  Style.containers.row,
                  {
                    alignSelf: "center",
                    alignItems: "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    Style.text.basic,
                    Style.text.bold,
                    { lineHeight: 24 },
                  ]}
                >
                  <MaterialIcons
                    name="attach-money"
                    size={22}
                    color={theme["color-basic-100"]}
                  />
                </Text>
                <Text
                  style={[
                    Style.text.xxl,
                    Style.text.basic,
                    Style.text.bold,
                    { lineHeight: 30, left: -4 },
                  ]}
                >
                  {CurrencyFormatter(basePrice).split(".")[0]}
                </Text>
                <Text
                  style={[
                    Style.text.md,
                    Style.text.basic,
                    Style.text.bold,
                    { lineHeight: 24, left: -2 },
                  ]}
                >
                  {CurrencyFormatter(basePrice).split(".")[1]}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              Style.containers.row,
              {
                width: "100%",
                justifyContent: "space-evenly",
                alignItems: "center",
                paddingTop: 15,
                paddingBottom: 5,
              },
            ]}
          >
            {event.status != "" && (
              <>
                <View
                  style={[
                    Style.containers.row,
                    Style.badge,
                    {
                      backgroundColor: theme["color-basic-100"],
                      shadowColor: theme["color-basic-100"],
                    },
                  ]}
                >
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xs]}
                  >
                    {event.status}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
              </>
            )}
            <View style={[Style.containers.row, { flex: 1 }]}>
              <Feather
                name="share-2"
                color={theme["color-basic-100"]}
                size={16}
              />
              {isLoading && (
                <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                  <SkeletonLoader.Container
                    style={[
                      {
                        padding: 0,
                        height: 15,
                        borderRadius: 2,
                        opacity: 0.3,
                        marginLeft: 4,
                        overflow: "hidden",
                        width: 20,
                      },
                    ]}
                  >
                    <SkeletonLoader.Item style={[{ width: 20 }]} />
                  </SkeletonLoader.Container>
                </SkeletonLoader>
              )}
              {!isLoading && (
                <Text
                  style={[Style.text.basic, Style.text.bold, { marginLeft: 4 }]}
                >
                  {NumFormatter(shares)}
                </Text>
              )}
            </View>
            <View style={[Style.containers.row, { flex: 1 }]}>
              <Feather
                name="bar-chart"
                color={theme["color-basic-100"]}
                size={16}
              />
              {isLoading && (
                <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                  <SkeletonLoader.Container
                    style={[
                      {
                        padding: 0,
                        height: 15,
                        borderRadius: 2,
                        opacity: 0.3,
                        marginLeft: 4,
                        overflow: "hidden",
                        width: 20,
                      },
                    ]}
                  >
                    <SkeletonLoader.Item style={[{ width: 20 }]} />
                  </SkeletonLoader.Container>
                </SkeletonLoader>
              )}
              {!isLoading && (
                <Text
                  style={[Style.text.basic, Style.text.bold, { marginLeft: 4 }]}
                >
                  {NumFormatter(views)}
                </Text>
              )}
            </View>
            <View style={[Style.containers.row, { flex: 1 }]}>
              <Feather
                name="check-square"
                color={theme["color-basic-100"]}
                size={16}
              />
              {isLoading && (
                <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
                  <SkeletonLoader.Container
                    style={[
                      {
                        padding: 0,
                        height: 15,
                        borderRadius: 2,
                        opacity: 0.3,
                        marginLeft: 4,
                        overflow: "hidden",
                        width: 20,
                      },
                    ]}
                  >
                    <SkeletonLoader.Item style={[{ width: 20 }]} />
                  </SkeletonLoader.Container>
                </SkeletonLoader>
              )}
              {!isLoading && (
                <Text
                  style={[Style.text.basic, Style.text.bold, { marginLeft: 4 }]}
                >
                  {Commasize(attendees)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Container>
  );
}

export function EventPurchaseComponent({
  i18n,
  _event,
  reload,
  withinMap = false,
  ticketsAmount = 0,
  tickets = [],
}) {
  const animation = new Animated.Value(0);
  const inputRange = [0, 1];
  const outputRange = [1, 0.8];
  const scale = animation.interpolate({ inputRange, outputRange });
  const event = React.useMemo(() => {
    return new EventModel({ ..._event });
  }, [_event]);
  const { width, height } = Dimensions.get("window");

  const onPressIn = () => {
    Animated.spring(animation, {
      toValue: 0.3,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const onView = () => {
    SheetManager.show("event-ticket-viewer", {
      payload: {
        event,
        tickets,
      },
    });
  };

  const onShare = () => {
    SheetManager.show("events-share-sheet", {
      payload: {
        event,
      },
    });
  };

  const Container = ({ children }) =>
    withinMap ? (
      <BlurView
        intensity={100}
        style={[
          Style.cards.showoff,
          {
            maxWidth: 400,
            width: width - 24,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            overflow: "hidden",
          },
        ]}
      >
        {children}
      </BlurView>
    ) : (
      <Animated.View
        key={event.id}
        style={[
          Style.cards.showoff,
          Style.elevated,
          {
            maxWidth: 400,
            width: width - 24,
            alignSelf: "center",
            padding: 0,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );

  return (
    <Container>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onView}
        style={{ width: "100%" }}
      >
        <Image
          style={{
            width: "100%",
            height: 250,
            borderRadius: 4,
          }}
          cachePolicy={"memory-disk"}
          contentFit="cover"
          source={{ uri: event.coverT }}
          width={500}
          height={500}
        />
        <View
          style={[
            Style.containers.column,
            {
              position: "absolute",
              backgroundColor: theme["color-basic-800-40"],
              padding: 10,
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              borderRadius: 10,
            },
          ]}
        >
          <View
            style={[Style.containers.row, { maxWidth: 380, width: "100%" }]}
          >
            <Image
              style={{
                width: 75,
                height: 100,
                borderRadius: 4,
              }}
              cachePolicy={"memory-disk"}
              contentFit="contain"
              source={{ uri: event.coverT }}
              width={300}
              height={400}
            />
            <View
              style={[
                Style.containers.column,
                { alignItems: "flex-start", flex: 1, marginHorizontal: 12 },
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
          </View>

          <View style={{ flex: 1 }} />
          {/* <Text
            style={[
              Style.text.md,
              Style.text.semibold,
              Style.text.basic,
              Style.transparency.md,
              { paddingTop: 12, paddingBottom: 8 },
            ]}
            numberOfLines={2}
          >
            {event.description}
          </Text> */}
          <View style={[Style.containers.row]}>
            <View
              style={[Style.containers.column, { alignItems: "flex-start" }]}
            >
              <Text
                style={[
                  Style.text.md,
                  Style.text.bold,
                  Style.text.basic,
                  { marginVertical: 2 },
                ]}
              >
                {event.venue.name}
              </Text>
              <Text
                style={[
                  Style.text.md,
                  Style.text.bold,
                  Style.text.basic,
                  { marginVertical: 1 },
                ]}
              >
                {event.venue.city}, {event.venue.region_ab}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={[Style.badge, { alignSelf: "center" }]}>
              <Text
                style={[Style.text.lg, Style.text.basic, Style.text.semibold]}
              >
                {tickets == 1 && <>{i18n.t("oneticket")}</>}
                {tickets !== 1 && (
                  <>{i18n.t("xtickets", { tickets: ticketsAmount })}</>
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={onShare} style={{ padding: 10 }}>
              <Feather
                color={theme["color-basic-100"]}
                size={24}
                name="more-horizontal"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Container>
  );
}

export default function EventComponent({
  i18n,
  _event,
  reload,
  withinMap = false,
  idx = 0,
}) {
  const animation = new Animated.Value(0);
  const inputRange = [0, 1];
  const outputRange = [1, 0.8];
  const scale = animation.interpolate({ inputRange, outputRange });
  const event = React.useMemo(() => {
    return new EventModel({ ..._event });
  }, [_event]);
  const { width, height } = Dimensions.get("window");

  const onPressIn = () => {
    Animated.spring(animation, {
      toValue: 0.3,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const onView = () => {
    router.push("/events/" + event.id);
  };

  const onShare = () => {
    SheetManager.show("events-share-sheet", {
      payload: {
        event,
      },
    });
  };

  const Container = ({ children }) =>
    withinMap ? (
      <BlurView
        key={event.id}
        intensity={100}
        style={[
          Style.cards.showoff,
          {
            maxWidth: 400,
            width: width - 24,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            overflow: "hidden",
          },
        ]}
      >
        {children}
      </BlurView>
    ) : (
      <Animated.View
        key={event.id + "-" + idx}
        style={[
          Style.cards.showoff,
          Style.elevated,
          {
            maxWidth: 400,
            width: width - 24,
            padding: 0,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );

  return (
    <Container>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onView}
        style={{ width: "100%" }}
      >
        <Image
          style={{
            width: "100%",
            height: 500,
            borderRadius: 4,
          }}
          cachePolicy={"memory-disk"}
          contentFit="cover"
          source={{ uri: event.coverT }}
          width={500}
          height={800}
        />
        <BlurView
          intensity={40}
          style={[
            Style.containers.column,
            {
              position: "absolute",
              backgroundColor: "rgba(255,255,255,0.7)",
              paddingHorizontal: 10,
              paddingVertical: 15,
              bottom: 10,
              alignSelf: "center",
              width: "94%",
              borderRadius: 10,
              overflow: "hidden",
            },
          ]}
        >
          <View style={[Style.containers.row, { width: "100%" }]}>
            <View
              style={[
                Style.containers.column,
                {
                  alignItems: "flex-start",
                  flex: 1,
                },
              ]}
            >
              <Text
                numberOfLines={3}
                style={[Style.text.xl, Style.text.bold, Style.text.dark]}
              >
                {event.name}
              </Text>
              <Text
                style={[
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.dark,
                  { marginTop: 4 },
                ]}
              >
                {event.getStart("MMMM Do, YYYY")} • {event.getStart("hh:mm A")}
              </Text>
            </View>
          </View>
          <View style={[Style.containers.row]}>
            <View
              style={[Style.containers.column, { alignItems: "flex-start" }]}
            >
              <Text style={[Style.text.md, Style.text.bold, Style.text.dark]}>
                {event.venue.name} | {event.venue.city}, {event.venue.region_ab}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onShare} style={{ padding: 4 }}>
              <Feather color={theme["color-basic-700"]} size={20} name="send" />
            </TouchableOpacity>
            {/* <View
              style={[
                Style.containers.row,
                {
                  alignSelf: "center",
                  alignItems: "flex-start",
                },
              ]}
            >
              <Text
                style={[Style.text.basic, Style.text.bold, { lineHeight: 24 }]}
              >
                <MaterialIcons
                  name="attach-money"
                  size={22}
                  color={theme["color-basic-100"]}
                />
              </Text>
              <Text
                style={[
                  Style.text.xxl,
                  Style.text.basic,
                  Style.text.bold,
                  { lineHeight: 30, left: -4 },
                ]}
              >
                {CurrencyFormatter(event.basePrice).split(".")[0]}
              </Text>
              <Text
                style={[
                  Style.text.md,
                  Style.text.basic,
                  Style.text.bold,
                  { lineHeight: 24, left: -2 },
                ]}
              >
                {CurrencyFormatter(event.basePrice).split(".")[1]}
              </Text>
            </View> */}
          </View>
        </BlurView>
      </Pressable>
    </Container>
  );
}
