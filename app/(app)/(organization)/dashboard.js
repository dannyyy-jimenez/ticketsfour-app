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
  TextInput,
} from "react-native";
import { LockedView, ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "../../../locales/provider";
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import EventModel from "../../../models/Event";
import Venue from "../../../models/Venue";
import { CurrencyFormatter, PhoneFormatter } from "../../../utils/Formatters";
import { OrgEventComponent } from "../../../utils/components/Event";

export default function DashboardScreen() {
  const { sql } = useOfflineProvider();
  const { auth, signOut, isGuest, defaultOrganization: oid } = useSession();
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const skeletonTasks = new Array(4).fill(0);
  const [section, setSection] = React.useState(0);
  const [events, setEvents] = React.useState([]);
  const [venues, setVenues] = React.useState([]);
  const [payouts, setPayouts] = React.useState(0);
  const [members, setMembers] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [completedTasks, setCompletedTasks] = React.useState([]);
  const [newRoleModalVisible, setNewRoleModalVisible] = React.useState(false);
  const [newRolePermissions, setNewRolePermissions] = React.useState([]);
  const [about, setAbout] = React.useState({});
  const [contact, setContact] = React.useState({});
  const [logo, setLogo] = React.useState("");
  const [updatedLogo, setUpdatedLogo] = React.useState(null);
  const [financialConnectionsSecret, setFinancialConnectionsSecret] =
    React.useState(false);
  const [stripe, setStripe] = React.useState(null);

  const [hasPermission, setHasPermission] = React.useState(true);
  const [canEditTeamRoles, setCanEditTeamRoles] = React.useState(false);
  const [canEditSettings, setCanEditSettings] = React.useState(false);

  const [canCreateEvents, setCanCreateEvents] = React.useState(false);
  const [canCreateVenues, setCanCreateVenues] = React.useState(false);

  const [invitePhone, setInvitePhone] = React.useState("");
  const [newRoleName, setNewRoleName] = React.useState("");
  const [inviteError, setInviteError] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("role");
  const inviteRoleValue = React.useMemo(() => {
    let role = roles.find((r) => r.identifier == inviteRole);

    if (role) return role.name;

    return i18n.t("selectRole");
  }, [inviteRole]);

  const [contactPhone, setContactPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [facebookHandle, setFacebookHandle] = React.useState("");
  const [instaHandle, setInstaHandle] = React.useState("");
  const [twitterHandle, setTwitterHandle] = React.useState("");
  const [tiktokHandle, setTiktokHandle] = React.useState("");

  const contactPhoneHelper = React.useMemo(() => {
    if (
      contactPhone.length > 0 &&
      contactPhone.replace(/[^0-9\.]+/g, "").length !== 10
    )
      return {
        color: theme["color-danger-500"],
        text: i18n.t("invalidPhone"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: contactPhone.trim() !== "",
    };
  }, [contactPhone]);

  const emailHelper = React.useMemo(() => {
    if (email.length > 0 && !email.includes("@"))
      return {
        color: theme["color-danger-500"],
        text: i18n.t("invalidEmail"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: email.trim() !== "",
    };
  }, [email]);

  React.useEffect(() => {
    setContactPhone(PhoneFormatter(contactPhone));
  }, [contactPhone]);

  // const onPayoutsLink = () => {
  //   if (financialConnectionsSecret == "") return;

  //   stripe.collectBankAccountToken({ clientSecret: financialConnectionsSecret }).then(res => {
  //     if (res.error) throw res.error.message

  //     return Api.post('/organizations/connect/external', { auth, oid, btk: res.token.id })
  //   }).then(res => {
  //     if (res.isError) throw "error"

  //     load()
  //   }).catch(e => {
  //     setIsLoading(false)
  //     console.log(e)
  //   });
  // }

  const todos = [
    {
      key: "payouts",
      name: "enablePayouts",
      onPress: () => onPayoutsLink(),
      description: (
        <>
          Enable payouts by setting up your Stripe Connect account and linking
          your bank account.
        </>
      ),
    },
    {
      key: "team",
      name: "inviteTeam",
      onPress: () => setSection(1),
      description: (
        <>
          Invite your team members to join your organization to help you get the
          ball rolling.
        </>
      ),
    },
    {
      key: "create",
      name: "Create an Event",
      onPress: () =>
        router.push({
          pathname: "/organizations/[oid]/events/create",
          query: { oid },
        }),
      description: <>Create an event to experience our platform first-hand.</>,
    },
    {
      key: "create-venue",
      name: "Create a Venue",
      onPress: () =>
        router.push({
          pathname: "/organizations/[oid]/venues/create",
          query: { oid },
        }),
      description: <>Create a venue to being hosting events.</>,
    },
    {
      key: "socials",
      name: "Social Media",
      onPress: () => setSection(2),
      description: (
        <>
          Link your social media accounts to get the most out of our marketing
          capabilities.
        </>
      ),
    },
  ];

  // const invitePhoneHelper = React.useMemo(() => {

  //   if (inviteError === 'MEMBER_NOT_REGISTERED') return {
  //     "color": "error",
  //     "text": "Your invitee must have an account to be invited",
  //     valid: false
  //   }

  //   if (inviteError === 'ALREADY_IN_TEAM') return {
  //     "color": "error",
  //     "text": "This user is already part of your team",
  //     valid: false
  //   }

  //   if (inviteError === 'NO_ROLE') return {
  //     "color": "error",
  //     "text": "Please select an active role",
  //     valid: false
  //   }

  //   if (invitePhone.replace(/[^0-9\.]+/g, "").length !== 10) return {
  //     "color": "default",
  //     "text": "Enter a valid 10 digit phone number",
  //     valid: false
  //   }

  //   return {
  //     "color": "default",
  //     valid: true
  //   }
  // }, [invitePhone, inviteError])
  // const newRoleHelper = React.useMemo(() => {

  //   if (newRoleName.trim().length === 0 || newRolePermissions.length == 0) return {
  //     valid: false
  //   }

  //   return {
  //     valid: true
  //   }
  // }, [newRoleName, newRolePermissions])

  const load = async () => {
    setIsLoading(true);
    setRoles([]);

    try {
      let _events = [];

      const localres = await sql.get(`
        SELECT *
          FROM GENESIS
          WHERE
            oid = '${oid}'
          ORDER BY start DESC
      `);

      _events = localres
        .map((ev) => new EventModel({ ...ev }))
        .sort((a, b) => a.start - b.start);
      setEvents(_events);

      if (localres.length > 0) {
        setIsLoading(false);
      }

      const res = await Api.get("/organizations/dashboard", {
        auth,
        oid,
        lazy: true,
      });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setPayouts(res.data.payouts);

      for (let event of res.data.events) {
        if (localres.findIndex((e) => e.id == event.id) != -1) continue;

        let _event = new EventModel({ ...event });
        _events = [_event, ..._events];
      }

      setEvents(_events);
      // setVenues(res.data.venues.map((venue) => new Venue({ ...venue })));
      setCompletedTasks(res.data.tasks);
      setMembers(
        res.data.members.map((member) => {
          let role = res.data.roles.find((r) => r.identifier == member.role);

          return {
            user: member.user,
            role: role,
          };
        }),
      );
      setAbout(res.data.connect);
      setFacebookHandle(res.data.socials?.facebook || "");
      setInstaHandle(res.data.socials?.instagram || "");
      setTwitterHandle(res.data.socials?.twitter || "");
      setTiktokHandle(res.data.socials?.tiktok || "");

      setContactPhone(res.data.contact?.phone || "");
      setEmail(res.data.contact?.email || "");
      setCanEditSettings(res.data.show_edit_settings);
      setCanEditTeamRoles(res.data.show_edit_team);
      setCanCreateEvents(res.data.permissions.includes("EVENT_EDIT"));
      setCanCreateVenues(res.data.permissions.includes("VENUE_EDIT"));
      setFinancialConnectionsSecret(res.data.financial_connections_secret);

      setRoles(res.data.roles);
      setLogo(res.data.logo);
      setPermissions(res.data.org_permissions);
      setInviteRole("role");
      //setInvitePhone('')
      setIsLoading(false);
    } catch (e) {
      console.log("AHH", e);
      setIsLoading(false);
    }
  };

  const onCreateTeamRole = async () => {
    setNewRoleModalVisible(false);

    try {
      const res = await Api.post("/organizations/roles/create", {
        auth,
        oid,
        name: newRoleName,
        permissions: newRolePermissions,
      });
      if (res.isError) throw "e";

      setRoles(res.data.roles);
      setNewRolePermissions([]);
      setNewRoleName("");
    } catch (e) {
      setNewRoleModalVisible(true);
    }
  };

  const onInvite = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/team/invite", {
        auth,
        oid,
        phone: invitePhone,
        role: inviteRole,
      });
      if (res.isError) throw res.data?.message;

      setInvitePhone("");
      setMembers(
        res.data.members.map((member) => {
          let role = res.data.roles.find((r) => r.identifier == member.role);

          return {
            user: member.user,
            role: role,
          };
        }),
      );
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setInviteError(e);
      setIsLoading(false);
    }
  };

  const onUpdate = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/settings", {
        auth,
        oid,
        phone: contactPhone,
        email: email,
        fb: facebookHandle,
        ig: instaHandle,
        tw: twitterHandle,
        tk: tiktokHandle,
      });
      if (res.isError) throw res.data?.message;

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (
      newRolePermissions.some((p) => p.match(/^EVENT_.+_VIEW$/g)) &&
      newRolePermissions.indexOf("EVENT_VIEW") == -1
    ) {
      setNewRolePermissions([...newRolePermissions, "EVENT_VIEW"]);
    }
  }, [newRolePermissions]);

  // React.useEffect(() => {
  //   setInvitePhone(PhoneFormatter(invitePhone))
  // }, [invitePhone])

  React.useEffect(() => {
    setInviteError("");
  }, [invitePhone, inviteRole]);

  React.useEffect(() => {
    if (!auth || !oid) return;

    load();
  }, [oid]);

  const onRefresh = () => {
    load();
  };

  if (!isLoading && !hasPermission) {
    return <LockedView />;
  }

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
      <View style={[Style.containers.row, { justifyContent: "flex-end" }]}>
        <TouchableOpacity
          onPress={() => setSection(0)}
          style={[{ padding: 15, marginVertical: 10 }, Style.containers.column]}
        >
          <Feather
            size={26}
            color={
              section == 0
                ? theme["color-organizer-500"]
                : theme["color-basic-700"]
            }
            name="bar-chart-2"
          />
          <Text
            style={[
              Style.text.semibold,
              Style.text.sm,
              section == 0 ? Style.text.organizer : Style.text.dark,
              {
                marginTop: 4,
              },
            ]}
          >
            {i18n.t("overview")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSection(1)}
          style={[{ padding: 15, marginVertical: 10 }, Style.containers.column]}
        >
          <Feather
            size={26}
            color={
              section == 1
                ? theme["color-organizer-500"]
                : theme["color-basic-700"]
            }
            name="users"
          />
          <Text
            style={[
              Style.text.semibold,
              Style.text.sm,
              section == 1 ? Style.text.organizer : Style.text.dark,
              {
                marginTop: 4,
              },
            ]}
          >
            {i18n.t("team")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSection(2)}
          style={[{ padding: 15, marginVertical: 10 }, Style.containers.column]}
        >
          <Feather
            size={26}
            color={
              section == 2
                ? theme["color-organizer-500"]
                : theme["color-basic-700"]
            }
            name="settings"
          />
          <Text
            style={[
              Style.text.semibold,
              Style.text.sm,
              section == 2 ? Style.text.organizer : Style.text.dark,
              {
                marginTop: 4,
              },
            ]}
          >
            {i18n.t("settings")}
          </Text>
        </TouchableOpacity>
      </View>
      {section == 0 && (
        <View>
          <View style={[Style.containers.row, { marginBottom: 10 }]}>
            <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
              {i18n.t("overview")}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                SheetManager.show("helper-sheet", {
                  payload: { text: "overviewDesc" },
                })
              }
              style={{ padding: 10 }}
            >
              <Feather name="info" size={20} color={theme["color-basic-700"]} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              Style.containers.row,
              {
                margin: 5,
                borderWidth: 1.5,
                borderColor: theme["color-basic-500"],
                borderRadius: 10,
                flex: 1,
                paddingVertical: 20,
                marginBottom: 15,
                justifyContent: "space-evenly",
              },
            ]}
          >
            <View style={[Style.containers.column]}>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.semibold,
                  Style.transparency.md,
                ]}
              >
                {i18n.t("events")}
              </Text>
              <Text style={[Style.text.xl, Style.text.dark, Style.text.bold]}>
                {events.length}
              </Text>
            </View>
            <View style={[Style.containers.column]}>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.semibold,
                  Style.transparency.md,
                ]}
              >
                {i18n.t("venues")}
              </Text>
              <Text style={[Style.text.xl, Style.text.dark, Style.text.bold]}>
                {venues.length}
              </Text>
            </View>
            <View style={[Style.containers.column]}>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.semibold,
                  Style.transparency.md,
                ]}
              >
                {i18n.t("payouts")}
              </Text>
              <Text style={[Style.text.xl, Style.text.dark, Style.text.bold]}>
                ${CurrencyFormatter(payouts)}
              </Text>
            </View>
          </View>

          {/* <View style={[Style.containers.row]}>
            <Text style={[Style.text.dark, Style.text.bold, Style.text.lg]}>
              {i18n.t("events")}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                SheetManager.show("helper-sheet", {
                  payload: { text: "eventsDesc" },
                })
              }
              style={{ padding: 10 }}
            >
              <Feather name="info" size={20} color={theme["color-basic-700"]} />
            </TouchableOpacity>
          </View> */}

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
              <OrgEventComponent key={event.id} i18n={i18n} _event={event} />
            </View>
          ))}
          {/*
          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              { marginTop: 20, marginBottom: 4 },
            ]}
          >
            {i18n.t("venues")}
          </Text>
          <Text style={[Style.text.dark, Style.text.normal]}>
            {i18n.t("venuesDesc")}
          </Text> */}
        </View>
      )}
      {section == 1 && (
        <View>
          <View style={[Style.containers.row, { marginBottom: 10 }]}>
            <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
              {i18n.t("teamRoles")}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                SheetManager.show("helper-sheet", {
                  payload: { text: "teamRolesDesc" },
                })
              }
              style={{ padding: 10 }}
            >
              <Feather name="info" size={20} color={theme["color-basic-700"]} />
            </TouchableOpacity>
          </View>

          <View style={[Style.cardBlank, { marginTop: 15, marginBottom: 20 }]}>
            <Text
              style={[
                Style.text.dark,
                Style.text.bold,
                Style.text.lg,
                { alignSelf: "center" },
              ]}
            >
              {i18n.t("roles")}
            </Text>
            {isLoading && (
              <ActivityIndicator
                style={{ alignSelf: "center", marginTop: 10 }}
                color={theme["color-organizer-500"]}
              />
            )}
            {roles.map((role, ridx) => (
              <View key={"role-" + ridx} style={{ marginVertical: 10 }}>
                <Text style={[Style.text.dark, Style.text.semibold]}>
                  {role.name}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    Style.transparency.md,
                  ]}
                  numberOfLines={3}
                >
                  {role.permissions.join(", ")}
                </Text>
              </View>
            ))}
          </View>

          {members.map((member, midx) => (
            <TouchableOpacity
              key={"member-" + midx}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <Feather name="user" size={20} color={theme["color-basic-700"]} />
              <View style={{ marginHorizontal: 20, flex: 1 }}>
                <Text
                  style={[Style.text.md, Style.text.semibold, Style.text.dark]}
                >
                  {member.user}
                </Text>
                <Text
                  style={[
                    Style.text.xs,
                    Style.text.semibold,
                    Style.transparency.md,
                    Style.text.dark,
                  ]}
                  numberOfLines={2}
                >
                  {member.role.permissions.join(", ")}
                </Text>
              </View>
              <View
                style={[
                  Style.badge,
                  {
                    alignSelf: "center",
                    backgroundColor: theme["color-organizer-500"],
                    shadowColor: theme["color-organizer-500"],
                  },
                ]}
              >
                <Text
                  style={[Style.text.sm, Style.text.semibold, Style.text.basic]}
                >
                  {member.role.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

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
                        margin: 10,
                      },
                    ]}
                  />
                </SkeletonLoader.Container>
              </SkeletonLoader>
            ))}

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <View>
              <Text
                style={[
                  Style.text.md,
                  Style.text.semibold,
                  Style.text.organizer,
                ]}
              >
                {i18n.t("addMember")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {section == 2 && (
        <View>
          <View style={[Style.containers.row, { marginBottom: 10 }]}>
            <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
              {i18n.t("settings")}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                SheetManager.show("helper-sheet", {
                  payload: { text: "settingsDesc" },
                })
              }
              style={{ padding: 10 }}
            >
              <Feather name="info" size={20} color={theme["color-basic-700"]} />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              { marginTop: 20 },
            ]}
          >
            {i18n.t("contact")}
          </Text>
          <Text
            style={[Style.text.dark, Style.text.normal, { marginVertical: 10 }]}
          >
            {i18n.t("contactDesc")}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                marginRight: 5,
              }}
            >
              <View
                style={{
                  borderRadius: 5,
                  paddingVertical: 8,
                  backgroundColor: theme["color-basic-100"],
                }}
              >
                <Text
                  style={[
                    Style.text.semibold,
                    Style.text.sm,
                    { color: contactPhoneHelper.color },
                  ]}
                >
                  {i18n.t("phoneNumber")}
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <TextInput
                  autoCapitalize="words"
                  autoComplete="tel"
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={i18n.t("mainOfficeNo")}
                  value={contactPhone}
                  onChangeText={(val) => setContactPhone(val)}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 5,
              }}
            >
              <View style={{}}>
                <Text
                  style={[
                    Style.text.semibold,
                    Style.text.sm,
                    { color: emailHelper.color, paddingVertical: 8 },
                  ]}
                >
                  {i18n.t("email")}
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <TextInput
                  autoComplete="email"
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={i18n.t("enter_email")}
                  value={email}
                  onChangeText={(val) => setEmail(val)}
                />
              </View>
            </View>
          </View>
          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              { marginTop: 30 },
            ]}
          >
            {i18n.t("socials")}
          </Text>
          <Text
            style={[Style.text.dark, Style.text.normal, { marginVertical: 10 }]}
          >
            {i18n.t("socialsDesc")}
          </Text>

          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                marginRight: 5,
              }}
            >
              <View
                style={{
                  borderRadius: 5,
                  paddingVertical: 8,
                  backgroundColor: theme["color-basic-100"],
                }}
              >
                <Text style={[Style.text.semibold, Style.text.sm]}>
                  Facebook
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <Feather
                  style={[Style.input.prefix]}
                  name="facebook"
                  size={20}
                  color={theme["color-basic-700"]}
                />
                <TextInput
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={"ticketsfour"}
                  value={facebookHandle}
                  onChangeText={(val) => setFacebookHandle(val)}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 5,
              }}
            >
              <View>
                <Text
                  style={[
                    Style.text.semibold,
                    Style.text.sm,
                    { paddingVertical: 8 },
                  ]}
                >
                  Instagram
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <Feather
                  style={[Style.input.prefix]}
                  name="instagram"
                  size={20}
                  color={theme["color-basic-700"]}
                />
                <TextInput
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={"ticketsfour"}
                  value={instaHandle}
                  onChangeText={(val) => setInstaHandle(val)}
                />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <View
              style={{
                flex: 1,
                marginRight: 5,
              }}
            >
              <View
                style={{
                  borderRadius: 5,
                  paddingVertical: 8,
                  backgroundColor: theme["color-basic-100"],
                }}
              >
                <Text style={[Style.text.semibold, Style.text.sm]}>
                  X (Twitter)
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <FontAwesome6
                  style={[Style.input.prefix]}
                  name="x-twitter"
                  size={18}
                  color={theme["color-basic-700"]}
                />
                <TextInput
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={"ticketsfour"}
                  value={twitterHandle}
                  onChangeText={(val) => setTwitterHandle(val)}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 5,
              }}
            >
              <View>
                <Text
                  style={[
                    Style.text.semibold,
                    Style.text.sm,
                    { paddingVertical: 8 },
                  ]}
                >
                  TikTok
                </Text>
              </View>
              <View style={[Style.input.container]}>
                <FontAwesome6
                  style={[Style.input.prefix]}
                  name="tiktok"
                  size={18}
                  color={theme["color-basic-700"]}
                />
                <TextInput
                  enterKeyHint="next"
                  style={[Style.input.text]}
                  placeholder={"ticketsfour"}
                  value={tiktokHandle}
                  onChangeText={(val) => setTiktokHandle(val)}
                />
              </View>
            </View>
          </View>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme["color-organizer-500"]}
              style={{
                marginTop: 20,
              }}
            />
          )}
          {!isLoading && (
            <TouchableOpacity
              onPress={onUpdate}
              style={[
                Style.button.container,
                {
                  backgroundColor: theme["color-organizer-500"],
                  width: "100%",
                  marginTop: 20,
                },
              ]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                {i18n.t("update")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollContainer>
  );
}
