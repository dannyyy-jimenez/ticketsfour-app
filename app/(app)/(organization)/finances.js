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
import LayoutContainer, {
  LockedView,
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
import { CurrencyFormatter, PhoneFormatter } from "../../../utils/Formatters";
import moment from "moment/moment";
import {
  StripeProvider,
  collectBankAccountToken,
} from "@stripe/stripe-react-native";
import Config from "../../../utils/Config";
import * as WebBrowser from "expo-web-browser";
import { LineChart, XAxis, YAxis } from "react-native-svg-charts";

export default function FinancesScreen() {
  const {
    session,
    signOut,
    isGuest,
    auth,
    defaultOrganization: oid,
  } = useSession();
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const skeletonTasks = new Array(4).fill(0);
  const [connectStarted, setConnectStarted] = React.useState(false);
  const [connectUri, setConnectUri] = React.useState(false);
  const [financialConnectionsSecret, setFinancialConnectionsSecret] =
    React.useState(false);
  const [needsAttention, setNeedsAttention] = React.useState(false);
  const [willNeedAttention, setWillNeedAttention] = React.useState(false);
  const [requireExternal, setRequireExternal] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [profile, setProfile] = React.useState(null);
  const [stripe, setStripe] = React.useState(null);
  const [payouts, setPayouts] = React.useState([]);
  const [cardSection, setCardSection] = React.useState(0);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [canSetup, setCanSetup] = React.useState(false);
  const [canManageBank, setCanManageBank] = React.useState(false);

  const onViewPayout = async (payout) => {
    SheetManager.show("payout-view-sheet", {
      payload: {
        payout,
      },
    });
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await Api.get("/organizations/finances", { auth, oid });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setCanSetup(res.data.permissions.includes("FINANCES_CONNECT_EDIT"));
      setCanManageBank(
        res.data.permissions.includes("FINANCES_CONNECT_BANK_EDIT"),
      );
      setConnectStarted(res.data.connect_started);
      setNeedsAttention(res.data.needs_immediate);
      setConnectUri(res.data.connect_uri);
      setFinancialConnectionsSecret(res.data.financial_connections_secret);
      setWillNeedAttention(res.data.will_need_attention);
      setProfile(res.data.profile);
      setTotal(res.data.total_payouts);
      setRequireExternal(res.data.require_external_account);
      setPayouts(res.data.payouts || []);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onSetupStart = async () => {
    setIsLoading(true);
    try {
      const res = await Api.post("/organizations/connect/onboard", {
        auth,
        oid,
      });
      if (res.isError) throw "e";

      load();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const beginLink = () => {
    setIsLoading(true);

    collectBankAccountToken(financialConnectionsSecret)
      .then((res) => {
        if (res.error) throw res.error.message;

        return Api.post("/organizations/connect/external", {
          auth,
          oid,
          btk: res.token.id,
        });
      })
      .then((res) => {
        if (res.isError) throw "error";

        load();
      })
      .catch((e) => {
        setIsLoading(false);
        console.log(e);
      });
  };

  const onRefresh = () => {
    load();
  };

  const amountsData = React.useMemo(() => {
    return payouts.map((p) => p.breakdown.promoter / 100);
  }, [payouts]);
  const bumpsData = React.useMemo(() => {
    return payouts.map((p) => p.breakdown.venue / 100);
  }, [payouts]);

  const verticalContentInset = { top: 0, bottom: 10 };

  React.useEffect(() => {
    load();
  }, [oid]);

  if (isLoading)
    return (
      <LayoutContainer>
        <ActivityIndicator
          style={{ alignSelf: "center", paddingVertical: 20 }}
          color={theme["color-organizer-500"]}
        />
      </LayoutContainer>
    );

  if (!isLoading && !hasPermission) {
    return <LockedView />;
  }

  return (
    <StripeProvider
      publishableKey={Config.stripeKey}
      urlScheme="com.ticketsfour.app" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.ticketsfour.app" // required for Apple Pay
    >
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
          <View style={[Style.containers.row, { marginVertical: 15 }]}>
            <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
              {i18n.t("finances")}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                SheetManager.show("helper-sheet", {
                  payload: { text: "financesDesc" },
                })
              }
              style={{ padding: 10 }}
            >
              <Feather name="info" size={20} color={theme["color-basic-700"]} />
            </TouchableOpacity>
          </View>
          <Text style={[Style.text.organizer, Style.text.bold, Style.text.xxl]}>
            ${CurrencyFormatter(total)}
          </Text>

          {payouts.length > 0 && (
            <View
              style={{
                height: 200,
                marginTop: 40,
                width,
                left: -10,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1, marginLeft: 0 }}>
                <LineChart
                  style={{ flex: 1 }}
                  data={amountsData}
                  contentInset={verticalContentInset}
                  svg={{ stroke: theme["color-organizer-500"] }}
                />
                <LineChart
                  style={{ flex: 1 }}
                  data={bumpsData}
                  contentInset={verticalContentInset}
                  svg={{ stroke: theme["color-organizer-800"] }}
                />
                {/* <Grid /> */}
              </View>
            </View>
          )}

          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              { marginTop: 30, marginBottom: 10 },
            ]}
          >
            {i18n.t("about")}
          </Text>

          <View
            style={[
              Style.containers.row,
              {
                justifyContent: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 8,
              },
            ]}
          >
            <Feather name="home" size={20} color={theme["color-basic-700"]} />
            {profile?.about?.address?.line1 != null && (
              <View
                style={[
                  Style.containers.column,
                  { alignItems: "flex-start", paddingHorizontal: 10 },
                ]}
              >
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  {profile?.about?.address.line1}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  {profile?.about?.address.city},{" "}
                  {profile?.about?.address.state}{" "}
                  {profile?.about?.address.postal_code}
                </Text>
              </View>
            )}
            {profile?.about?.address?.line1 == null && (
              <View
                style={[
                  Style.containers.column,
                  { alignItems: "flex-start", paddingHorizontal: 10 },
                ]}
              >
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  123 Sample Ave
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  Chicago, IL 60623
                </Text>
              </View>
            )}
          </View>
          <View
            style={[
              Style.containers.row,
              {
                justifyContent: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 8,
              },
            ]}
          >
            <Feather name="phone" size={20} color={theme["color-basic-700"]} />
            <View
              style={[
                Style.containers.column,
                { alignItems: "flex-start", paddingHorizontal: 10 },
              ]}
            >
              {profile?.about?.phone != null && (
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  {PhoneFormatter(profile?.about?.phone?.slice(2))}
                </Text>
              )}
              {profile?.about?.phone == null && (
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  (000) 000-0000
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              WebBrowser.openBrowserAsync(connectUri, {
                presentationStyle: "popover",
              })
            }
            style={[
              Style.containers.row,
              {
                paddingVertical: 5,
                marginBottom: 20,
                flex: 1,
              },
            ]}
          >
            <Text style={[Style.text.organizer, Style.text.semibold]}>
              {i18n.t("update")}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              { marginBottom: 4 },
            ]}
          >
            {i18n.t("bankAccount")}
          </Text>

          <View
            style={[
              Style.containers.row,
              {
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingVertical: 5,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              {profile?.external?.bank_name}
            </Text>
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              ****{profile?.external?.last4}
            </Text>
          </View>

          <TouchableOpacity
            onPress={beginLink}
            style={[
              Style.containers.row,
              { paddingVertical: 5, marginBottom: 20, flex: 1 },
            ]}
          >
            <Text style={[Style.text.organizer, Style.text.semibold]}>
              {i18n.t("switch")}
            </Text>
          </TouchableOpacity>

          <Text style={[Style.text.dark, Style.text.semibold, Style.text.lg]}>
            {i18n.t("payouts")}
          </Text>
          {payouts.map((payout, pidx) => (
            <TouchableOpacity
              key={"payout-" + pidx}
              onPress={() => onViewPayout(payout)}
              style={[Style.containers.row, { paddingVertical: 15 }]}
            >
              <View
                style={[
                  Style.button.round,
                  {
                    borderRadius: 6,
                    backgroundColor: theme["color-success-200"],
                  },
                ]}
              >
                <Feather
                  name="check"
                  size={20}
                  color={theme["color-success-800"]}
                />
              </View>

              <View
                style={[
                  Style.containers.column,
                  { alignItems: "flex-start", marginLeft: 8 },
                ]}
              >
                <Text
                  style={[Style.text.dark, Style.text.semibold, Style.text.lg]}
                >
                  ${CurrencyFormatter(payout.amount)}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.transparency.md,
                    Style.text.normal,
                  ]}
                >
                  {i18n.t("payoutInitiated")}{" "}
                  {moment(payout.date).format("ddd, MMM Do")}
                </Text>
              </View>

              <View style={{ flex: 1 }} />

              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  {
                    marginHorizontal: 8,
                    maxWidth: "35%",
                  },
                ]}
                numberOfLines={2}
              >
                {payout.event}
              </Text>
              <Feather
                name="chevron-right"
                size={20}
                color={theme["color-basic-700"]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollContainer>
    </StripeProvider>
  );
}
