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

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { i18n } = useLocalization();
  const {
    session,
    isGuest,
    signOut,
    defaultOrganization,
    activeOrganization,
    organizations,
    setActiveOrganization,
    setDefaultOrganization,
    setOrganizerMode,
    organizerMode,
  } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../../../assets/Flix-Normal.otf"),
  });

  const quickActionItems = React.useMemo(() => {
    let _orgsMap = organizations
      .filter((o) => o.i != defaultOrganization)
      .map((org, oidx) => {
        return {
          text: org.n,
          icon: "account-multiple-outline",
          onPress: () => {
            setActiveOrganization(org);
          },
        };
      });

    return [
      { text: i18n.t("selectOrganization"), isTitle: true },
      ..._orgsMap,
      {
        text: i18n.t("personalMode"),
        onPress: () => {
          setOrganizerMode(false);
          setActiveOrganization(null);
        },
        icon: "account-outline",
        withSeparator: true,
      },
      {
        text: i18n.t("logOut"),
        onPress: signOut,
        icon: "exit-to-app",
        isDestructive: true,
      },
    ];
  }, [organizations, defaultOrganization]);

  const TAB_STYLE = {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: "absolute",
    borderTopColor: theme["color-organizer-500"],
    borderColor: "transparent",
    borderWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 0,
    bottom: 0,
  };

  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  if (!organizerMode) {
    return <Redirect replace href="(tabs)/events" />;
  }

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
              {fontsLoaded && (
                <View style={[Styles.containers.row]}>
                  <Text
                    style={[
                      Styles.text.organizer,
                      Styles.text.xl,
                      { fontFamily: "Flix-Normal", letterSpacing: 0.5 },
                    ]}
                  >
                    Tickets Four
                  </Text>
                  <View
                    style={[
                      Styles.badge,
                      {
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                        alignSelf: "center",
                        marginLeft: 6,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Styles.text.basic,
                        Styles.text.xs,
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
                    {activeOrganization?.n} ({activeOrganization?.r})
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={[Styles.text.semibold, Styles.text.dark]}>
                      {i18n.t("switchOrg")}
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
          name="dashboard"
          options={{
            tabBarLabel: i18n.t("dashboard"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-organizer-500"],
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
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/dashboard",
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            tabBarLabel: i18n.t("events"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-organizer-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <Feather
                name="calendar"
                size={24}
                color={
                  focused
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/events",
          }}
        />
        <Tabs.Screen
          name="venues"
          options={{
            tabBarLabel: i18n.t("venues"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-organizer-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <Feather
                name="hexagon"
                size={24}
                color={
                  focused
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="sales"
          options={{
            tabBarLabel: i18n.t("sales"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-organizer-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="currency-usd"
                size={24}
                color={
                  focused
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            tabBarLabel: i18n.t("finances"),
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: theme["color-organizer-500"],
            tabBarLabelStyle: {
              fontWeight: 700,
            },
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="bank-outline"
                size={24}
                color={
                  focused
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
              />
            ),
            href: "/finances",
          }}
        />
      </Tabs>
    </>
  );
}
