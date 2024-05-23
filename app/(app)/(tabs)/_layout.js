import React from "react";
import { Redirect, Tabs, router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import Styles, { theme } from "../../../utils/Styles";
import { useLocalization } from "../../../locales/provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HoldItem } from "react-native-hold-menu";
import { useSession } from "../../../utils/ctx";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { i18n } = useLocalization();
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
    signIn,
  } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../../../assets/Flix-Normal.otf"),
  });

  const quickActionItems = React.useMemo(() => {
    let _orgsMap = organizations.map((org, oidx) => {
      return {
        text: org.n,
        icon: "account-multiple-outline",
        onPress: () => {
          setActiveOrganization(org);
          setOrganizerMode(true);
        },
        withSeparator: oidx == organizations.length,
      };
    });

    return [
      { text: i18n.t("selectOrganization"), isTitle: true },
      ..._orgsMap,
      {
        text: i18n.t("logOut"),
        onPress: signOut,
        icon: "exit-to-app",
        isDestructive: true,
      },
    ];
  }, [organizations]);

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

  if (organizerMode) {
    return <Redirect href="(organization)/dashboard" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: TAB_STYLE,
          headerStyle: { backgroundColor: "#fff" },
          header: () =>
            isGuest || !auth ? (
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
                {fontsLoaded && (
                  <View style={[Styles.containers.row]}>
                    <Text
                      style={[
                        Styles.text.primary,
                        Styles.text.xxl,
                        { fontFamily: "Flix-Normal", letterSpacing: 0.5 },
                      ]}
                    >
                      Tickets Four
                    </Text>
                    <View
                      style={[
                        Styles.badge,
                        { alignSelf: "center", marginLeft: 6 },
                      ]}
                    >
                      <Text
                        style={[
                          Styles.text.basic,
                          Styles.text.sm,
                          Styles.text.bold,
                        ]}
                      >
                        Beta
                      </Text>
                    </View>
                  </View>
                )}
                <View style={{ flex: 1 }} />

                <TouchableOpacity onPress={signOut}>
                  <View style={[Styles.containers.column]}>
                    <Text
                      style={[
                        Styles.text.semibold,
                        Styles.transparency.md,
                        Styles.text.sm,
                        Styles.text.dark,
                      ]}
                    >
                      Guest Mode
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={[Styles.text.semibold, Styles.text.dark]}>
                        Login / Register
                      </Text>
                      <Feather
                        name="chevron-down"
                        size={20}
                        color={theme["color-basic-700"]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
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
              </View>
            ) : (
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
                {fontsLoaded && (
                  <View style={[Styles.containers.row]}>
                    <Text
                      style={[
                        Styles.text.primary,
                        Styles.text.xxl,
                        { fontFamily: "Flix-Normal", letterSpacing: 0.5 },
                      ]}
                    >
                      Tickets Four
                    </Text>
                    <View
                      style={[
                        Styles.badge,
                        { alignSelf: "center", marginLeft: 6 },
                      ]}
                    >
                      <Text
                        style={[
                          Styles.text.basic,
                          Styles.text.sm,
                          Styles.text.bold,
                        ]}
                      >
                        Beta
                      </Text>
                    </View>
                  </View>
                )}
                <View style={{ flex: 1 }} />
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
                      {i18n.t("helloX", { name: name?.split(" ")[0] })}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={[Styles.text.semibold, Styles.text.dark]}>
                        {i18n.t("organizerModeQ")}
                      </Text>
                      <Feather
                        name="chevron-down"
                        size={20}
                        color={theme["color-basic-700"]}
                      />
                    </View>
                  </View>
                </HoldItem>
              </View>
            ),
          headerShadowVisible: false,
        }}
        initialRouteName="quotes"
      >
        <Tabs.Screen
          name="events"
          options={{
            tabBarLabel: i18n.t("events"),
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
            href: "/(tabs)/events",
          }}
        />
        <Tabs.Screen
          name="blogs"
          options={{
            tabBarLabel: i18n.t("blogs"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/blogs",
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            tabBarLabel: i18n.t("myTickets"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="ticket-confirmation-outline"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: auth ? "/tickets" : null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: i18n.t("settings"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-primary-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <Feather
                name="settings"
                size={24}
                color={
                  focused
                    ? theme["color-primary-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/settings",
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
