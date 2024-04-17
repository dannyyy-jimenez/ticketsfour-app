import React from "react";
import { Redirect, Tabs, router } from "expo-router";
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import Api from "../../utils/Api";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import Styles, { theme } from "../../utils/Styles";
import { useSession } from "../../utils/ctx";
import { useLocalization } from "../../locales/provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SkeletonLoader from "expo-skeleton-loader";
import { HoldItem } from "react-native-hold-menu";

function useNotificationObserver() {
  React.useEffect(() => {
    let isMounted = true;

    function redirect(notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function AppLayout() {
  const { session, signOut, isLoading, setSocket } = useSession();
  const insets = useSafeAreaInsets();
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  const onCreatePretask = () => {
    SheetManager.show("pretask-create-sheet");
  };

  const onCreateEmployee = () => {
    SheetManager.show("employee-create-sheet");
  };

  const quickActionItems = [
    { text: "Quick actions menu", isTitle: true },
    {
      text: "Pre-Task",
      onPress: onCreatePretask,
      icon: "hammer-screwdriver",
    },
    {
      text: "Employee",
      onPress: onCreateEmployee,
      icon: "account-wrench",
    },
  ];

  useNotificationObserver(session);

  React.useEffect(() => {
    if (expoPushToken == "") return;

    // Api.post("/profile/token", {
    //   auth: session,
    //   token: expoPushToken,
    // })
    //   .then((res) => {
    //     let { data } = res;
    //     let { socket } = data;

    //     setSocket(socket);
    //   })
    //   .catch((e) => console.log(e));
  }, [expoPushToken]);

  React.useEffect(() => {
    if (!session) return;

    // Api.get("/users/profile", { auth: session })
    //   .then((res) => {
    //     if (res.isError) throw "no auth";

    //     changeTeamName(res.data.teamName);
    //   })
    //   .then(() => {
    //     registerForPushNotificationsAsync().then((token) =>
    //       setExpoPushToken(token),
    //     );

    //     notificationListener.current =
    //       Notifications.addNotificationReceivedListener((notification) => {
    //         setNotification(notification);
    //       });

    //     responseListener.current =
    //       Notifications.addNotificationResponseReceivedListener((response) => {
    //         console.log(response);
    //       });
    //   })
    //   .catch((e) => console.log(e));

    // return () => {
    //   if (notificationListener?.current) {
    //     Notifications?.removeNotificationSubscription(
    //       notificationListener?.current,
    //     );
    //   }
    //   if (responseListener?.current) {
    //     Notifications?.removeNotificationSubscription(
    //       responseListener?.current,
    //     );
    //   }
    // };
  }, [session]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  const TAB_STYLE = {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: "absolute",
    borderTopColor: theme["color-primary-500"],
    borderColor: "transparent",
    borderWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 0,
    bottom: 0,
  };

  // This layout can be deferred because it's not the root layout.
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: TAB_STYLE,
          headerStyle: { backgroundColor: "#fff" },
          header: () => (
            <View
              style={[
                Styles.containers.row,
                {
                  paddingTop: insets.top,
                  paddingHorizontal: 10,
                  backgroundColor: theme["color-basic-100"],
                  paddingBottom: 10,
                },
              ]}
            >
              <HoldItem
                closeOnTap
                activateOn="tap"
                hapticFeedback="Heavy"
                items={quickActionItems}
              >
                <View style={[Styles.containers.column]}>
                  <Text
                    style={[
                      Styles.text.semibold,
                      Styles.transparency.md,
                      Styles.text.sm,
                      Styles.text.dark,
                    ]}
                  >
                    Actions
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={[Styles.text.semibold, Styles.text.dark]}>
                      Quick Create
                    </Text>
                    <Feather
                      name="chevron-down"
                      size={20}
                      color={theme["color-basic-700"]}
                    />
                  </View>
                </View>
              </HoldItem>
              {/* <TouchableOpacity onPress={onChangeTeam}>
                <Text
                  style={[
                    Styles.text.semibold,
                    Styles.transparency.md,
                    Styles.text.sm,
                    Styles.text.dark,
                  ]}
                >
                  Actions
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={[Styles.text.semibold, Styles.text.dark]}>
                    Quick Create
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={theme["color-basic-700"]}
                  />
                </View>
              </TouchableOpacity> */}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => router.push("/map")}
                style={[Styles.button.round]}
              >
                <Feather
                  name="map"
                  size={16}
                  color={theme["color-basic-700"]}
                />
              </TouchableOpacity>
            </View>
          ),
          headerShadowVisible: false,
        }}
        initialRouteName="quotes"
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: i18n.t("home"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <Feather
                name="home"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="receiving"
          options={{
            tabBarLabel: "Receiving",
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="download-box-outline"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="quotes"
          options={{
            tabBarLabel: "Quotes",
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="request-quote"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/quotes",
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            tabBarLabel: "Jobs",
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="hammer-screwdriver"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/jobs",
          }}
        />
        <Tabs.Screen
          name="jobsite"
          options={{
            tabBarLabel: "Jobsite",
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <FontAwesome6
                name="helmet-safety"
                size={20}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/jobsite",
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarLabel: "Jobsite",
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <FontAwesome6
                name="helmet-safety"
                size={20}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "8c6a3efb-b7b7-41be-991c-c589e4280025",
      })
    ).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
