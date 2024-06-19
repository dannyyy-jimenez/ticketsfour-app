import React from "react";
import { Stack, router } from "expo-router";
import { Platform, Text } from "react-native";
import * as Notifications from "expo-notifications";
import { useSession } from "../../utils/ctx";
import Api from "../../utils/Api";
import * as Device from "expo-device";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";

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

export default function RootAuthLayout() {
  const {
    session,
    defaultOrganization,
    signOut,
    isLoading,
    isGuest,
    setName,
    setOrganizations,
    setActiveOrganization,
    setPhoneNumber,
  } = useSession();
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  useNotificationObserver(session);

  React.useEffect(() => {
    if (expoPushToken == "") return;

    // Api.post("/users/profile/token", {
    //   auth: session,
    //   token: expoPushToken,
    // })
    //   .then((res) => {
    //     let { data } = res;
    //   })
    //   .catch((e) => console.log(e));
  }, [expoPushToken]);

  React.useEffect(() => {
    if (!session || isGuest) {
      SplashScreen.hideAsync();
      return;
    }

    Api.get("/users/core", { auth: session })
      .then((res) => {
        if (res.isError) throw "no auth";

        setName(res.data.name);
        setPhoneNumber(res.data.phone);
        setOrganizations(res.data.organizations);
        setActiveOrganization(
          res.data.organizations.find((o) => o.i === defaultOrganization),
        );

        SplashScreen.hideAsync();
      })
      .then(() => {
        registerForPushNotificationsAsync().then((token) =>
          setExpoPushToken(token),
        );

        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
          });

        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
          });
      })
      .catch((e) => {
        SplashScreen.hideAsync();
      });

    return () => {
      if (notificationListener?.current) {
        Notifications?.removeNotificationSubscription(
          notificationListener?.current,
        );
      }
      if (responseListener?.current) {
        Notifications?.removeNotificationSubscription(
          responseListener?.current,
        );
      }
    };
  }, [session, isGuest]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  // if (!session) {
  //   // On web, static rendering will stop here as the user is not authenticated
  //   // in the headless Node process that the pages are rendered in.
  //   return <Redirect href="/login" />;
  // }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(organization)" options={{ headerShown: false }} />
      <Stack.Screen
        name="events/[eid]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="organization/events/[eid]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="tickets/verify"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="t/[tbid]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="tickets/[tbid]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="blogs/[bid]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="venues/scanner"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="help/assistant"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
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
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
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
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
