import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import LayoutContainer, {
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather, Ionicons, Fontisto } from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import { Link, router, useLocalSearchParams } from "expo-router";
import EventModel from "../../../models/Event";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import MapView, { Marker } from "react-native-maps";
import PagerView from "react-native-pager-view";
import * as Sharing from "expo-sharing";
import {
  CurrencyFormatter,
  EmailValidator,
  PhoneFormatter,
} from "../../../utils/Formatters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Leaf from "../../../models/Leaf";
import SeatMap from "../../../utils/components/SeatMap";
import { WebView } from "react-native-webview";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Config from "../../../utils/Config";
import SkeletonLoader from "expo-skeleton-loader";
import Blog from "../../../models/Blog";
import * as Linking from "expo-linking";

export default function EventScreen() {
  const { session, isGuest, signOut } = useSession();

  const scrollContainer = React.useRef(null);
  const insets = useSafeAreaInsets();
  const { i18n, locale } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const [quotes, setQuotes] = React.useState([]);
  const params = useLocalSearchParams();
  const [event, setEvent] = React.useState(null);
  const [pagers, setPagers] = React.useState(new Array(2).fill(0));
  const [activePager, setActivePager] = React.useState(0);

  const [isLoadingLeaves, setIsLoadingLeaves] = React.useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = React.useState(false);
  const [priceChanges, setPriceChanges] = React.useState(null);
  const [blogs, setBlogs] = React.useState([]);
  const [seats, setSeats] = React.useState([]);
  const [seatSortDesc, setSeatSortDesc] = React.useState(null);
  const [selectedNodes, setSelectedNodes] = React.useState([]);
  const [selectedLeaves, setSelectedLeaves] = React.useState([]);
  const [checkoutSection, setCheckoutSection] = React.useState(1);

  const [unexposedPager, setUnexposedPager] = React.useState(0);
  const unexposedPagerStartIdx = React.useMemo(() => {
    return unexposedPager * 5;
  }, [unexposedPager]);
  const unexposedPagerEndIdx = React.useMemo(() => {
    return unexposedPager * 5 + 5;
  }, [unexposedPager]);
  const [seatMapZoomEnabled, setSeatMapZoomEnabled] = React.useState(false);

  const [nodeQuantities, setNodeQuantities] = React.useState({});

  const firstNameInput = React.useRef(null);
  const lastNameInput = React.useRef(null);
  const phoneInput = React.useRef(null);
  const phoneVerifInput = React.useRef(null);
  const emailInput = React.useRef(null);

  const [fnameFocused, setFNameFocused] = React.useState(false);
  const [lnameFocused, setLNameFocused] = React.useState(false);
  const [phoneFocused, setPhoneFocused] = React.useState(false);
  const [phoneVerifFocused, setPhoneVerifFocused] = React.useState(false);
  const [emailFocused, setEmailFocused] = React.useState(false);

  const [subtotal, setSubtotal] = React.useState(0);
  const [serviceFee, setServiceFee] = React.useState(0);
  const [tax, setTax] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [customerStripe, setCustomerStripe] = React.useState(null);
  const [ephemeralStripe, setEphemeralStripe] = React.useState(null);
  const [paymentIntent, setPaymentIntent] = React.useState(null);
  const [paymentIntentSecret, setPaymentIntentSecret] = React.useState(null);

  const missingEntry = React.useMemo(() => {
    return !selectedLeaves.some((leaf) => leaf.node?.isExposed);
  }, [selectedNodes, selectedLeaves]);

  const offersPremiumSeating = React.useMemo(() => {
    return (
      event?.nodes?.filter((n) => !n.isDecorative && !n.isExposed).length > 0
    );
  }, [event]);

  const seatMapIsWorthy = React.useMemo(() => {
    return (
      event?.nodes?.filter((n) => !n.isDecorative).length > 1 &&
      !event?.soldOut &&
      event.active
    );
  }, [event]);

  const seatMapWorthyViews = React.useMemo(() => {
    if (
      event?.nodes?.filter((n) => !n.isDecorative).length > 1 &&
      !event?.soldOut &&
      event.active
    ) {
      return [1];
    }

    return [];
  }, [event]);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [phoneVerif, setPhoneVerif] = React.useState("");
  const [email, setEmail] = React.useState("");

  const seatMapHeight = React.useMemo(() => {
    return Math.min(400, width * 0.75);
  }, [width]);

  const firstNameHelper = React.useMemo(() => {
    if (fnameFocused && firstName.trim() == "")
      return {
        color: theme["color-danger-500"],
        text: i18n.t("firstNameReq"),
        valid: false,
      };

    if (firstName.includes(" "))
      return {
        color: theme["color-basic-700"],
        text: i18n.t("firstNameOnly"),
        valid: fnameFocused,
      };

    return {
      color: theme["color-basic-700"],
      valid: fnameFocused,
    };
  }, [firstName, fnameFocused]);

  const lastNameHelper = React.useMemo(() => {
    if (lnameFocused && lastName.trim() == "")
      return {
        color: theme["color-danger-500"],
        text: i18n.t("lastNameReq"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: lnameFocused,
    };
  }, [lastName, lnameFocused]);

  const phoneHelper = React.useMemo(() => {
    if (phoneFocused && phone.trim() == "")
      return {
        color: theme["color-danger-500"],
        text: i18n.t("phoneReq"),
        valid: false,
      };

    if (phoneFocused && phone.replace(/[^0-9\.]+/g, "").length !== 10)
      return {
        color: theme["color-danger-500"],
        text: i18n.t("phoneValidReq"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: phoneFocused,
    };
  }, [phone, phoneFocused]);

  const phoneVHelper = React.useMemo(() => {
    if (phoneFocused && phone != phoneVerif)
      return {
        color: theme["color-danger-500"],
        text: i18n.t("phoneMatchReq"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: phoneFocused,
    };
  }, [phoneVerif, phone, phoneFocused]);

  const emailHelper = React.useMemo(() => {
    if (emailFocused && email.trim() == "")
      return {
        color: theme["color-danger-500"],
        text: i18n.t("emailReq"),
        valid: false,
      };

    if (emailFocused && !EmailValidator(email))
      return {
        color: theme["color-danger-500"],
        text: i18n.t("emailValidReq"),
        valid: false,
      };

    return {
      color: theme["color-basic-700"],
      valid: emailFocused,
    };
  }, [email, emailFocused]);

  const MarkAsViewed = async () => {
    try {
      await Api.post("/event/stats/view", { auth: session, eid: params?.eid });
    } catch (e) {
      console.log(e);
    }
  };

  const nodeQuantityChange = (nodeId, increase = true) => {
    let _nodeQuantities = { ...nodeQuantities };

    if (Object.keys(_nodeQuantities).includes(nodeId)) {
      _nodeQuantities[nodeId] = increase
        ? Math.min(6, _nodeQuantities[nodeId] + 1)
        : Math.max(1, _nodeQuantities[nodeId] - 1);
    } else {
      _nodeQuantities[nodeId] = increase ? 2 : 1;
    }

    setNodeQuantities(_nodeQuantities);
  };

  const load = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/event", { auth: session, eid: params?.eid });

      if (res.isError) throw "e";

      setEvent(new EventModel({ ...res.data.event }));
      setPriceChanges(res.data.updates);
      setBlogs(res.data.blogs.map((blog) => new Blog({ ...blog })));

      let _pagers = 2;

      if (
        res.data.event?.nodes?.filter((n) => !n.isDecorative && n.available > 0)
          .length > 1 &&
        res.data.event?.active
      ) {
        _pagers += 1;
      }

      setPagers(new Array(_pagers + res.data.event.lineup.length).fill(0));
      MarkAsViewed();
      // try {
      //   fbq.event("ViewContent", {
      //     content_name: res.data?.event?.name,
      //     content_ids: [res.data?.event?.id],
      //     content_type: 'event',
      //     value: 0.50,
      //     currency: 'USD'
      //   })
      //   gtag.event("page_view", {
      //     event_category: "events",
      //     event_label: res.data?.event?.id,
      //     value: 0.50,
      //     currency: 'USD'
      //   })
      //   ttq.event("ViewContent", {
      //     description: res.data?.event?.name,
      //     content_id: res.data?.event?.id,
      //     quantity: 1,
      //     content_type: 'product',
      //     value: 0.50,
      //     currency: 'USD'
      //   })
      //   snaptr.event("VIEW_CONTENT", {
      //     description: res.data?.event?.name,
      //     item_ids: [res.data?.event?.id],
      //     item_category: 'event',
      //     value: 0.50,
      //     currency: 'USD'
      //   })

      //   setMusicKitDevToken(res.data._mkt)
      //   setMusicKitReady(true)
      // } catch (e) {
      // }
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const loadLeaves = async () => {
    setIsLoadingLeaves(true);
    try {
      const res = await Api.get("/event/leaves", {
        auth: session,
        eid: params?.eid,
        nodes: Array.from(selectedNodes).join(","),
      });

      if (res.isError) throw "error";

      setSelectedLeaves(
        res.data.leaves.map((l) => new Leaf({ ...l, nodes: event?.nodes })),
      );
      setIsLoadingLeaves(false);
    } catch (e) {
      console.log(e);
      setIsLoadingLeaves(false);
    }
  };

  const handlePersonal = async () => {
    setIsLoadingPricing(true);

    try {
      const res = await Api.post("/event/customer/link", {
        auth: session,
        eid: params?.eid,
        piid: paymentIntent,
        fname: firstName,
        lname: lastName,
        phone: phone,
        email: email,
      });

      if (res.isError) throw "error";

      setEphemeralStripe(res.data.ephemeralKey);
      setCustomerStripe(res.data.customer);
      setCheckoutSection(2);
      setIsLoadingPricing(false);
    } catch (e) {
      console.log(e);
      setIsLoadingPricing(false);
    }
  };

  const handlePayment = async () => {
    const verifyAvailability = await Api.post("/event/availability", {
      eid: params?.eid,
      leaves: selectedLeaves,
    });

    if (verifyAvailability.isError) {
      return;
    }

    const proceedIntent = await Api.post("/event/hold/v2", {
      eid: params?.eid,
      leaves: selectedLeaves,
      intent: paymentIntent,
      secret: paymentIntentSecret,
    });

    if (proceedIntent.isError) {
      return;
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      await Api.post("/event/hold/remove/v2", {
        eid: params?.eid,
        leaves: selectedLeaves,
        intent: paymentIntent,
        secret: paymentIntentSecret,
      });
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      //

      setSelectedNodes([]);
      setSelectedLeaves(null);
      setIsLoadingPricing(false);
    } else {
      router.replace({
        pathname: "tickets/verify",
        params: {
          eid: params?.eid,
          intent: paymentIntent,
          secret: paymentIntentSecret,
        },
      });
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  React.useEffect(() => {
    if (phone == "") return;
    setPhoneFocused(true);
  }, [phone]);

  React.useEffect(() => {
    if (firstName == "") return;
    setFNameFocused(true);
  }, [firstName]);

  React.useEffect(() => {
    if (lastName == "") return;
    setLNameFocused(true);
  }, [lastName]);

  React.useEffect(() => {
    setPhone(PhoneFormatter(phone));
  }, [phone]);

  React.useEffect(() => {
    setPhoneVerif(PhoneFormatter(phoneVerif));
  }, [phoneVerif]);

  React.useEffect(() => {
    if (!customerStripe || checkoutSection != 2 || !ephemeralStripe) return;

    initPaymentSheet({
      returnURL: `${Config.basePath}/tickets/verify?eid=${params?.eid}`,
      merchantDisplayName: "Tickets Four,LLC",
      customerId: customerStripe,
      customerEphemeralKeySecret: ephemeralStripe,
      paymentIntentClientSecret: paymentIntentSecret,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: firstName + " " + lastName,
      },
      applePay: {
        merchantCountryCode: "US",
      },
      appearance: {
        shapes: {
          borderRadius: 8,
          borderWidth: 0.5,
        },
        primaryButton: {
          shapes: {
            borderRadius: 20,
          },
        },
        colors: {
          primary: theme["color-primary-500"],
          background: theme["color-basic-100"],
          componentBackground: theme["color-basic-100"],
          componentBorder: theme["color-basic-100"],
          componentDivider: theme["color-basic-700"],
          primaryText: theme["color-basic-700"],
          secondaryText: theme["color-basic-700"],
          componentText: theme["color-basic-700"],
          placeholderText: theme["color-basic-600"],
        },
      },
    })
      .then((res) => {
        if (res.paymentOption == "undefined") return;

        handlePayment();
      })
      .catch((e) => {
        console.log("ER", e);
      });
  }, [checkoutSection, customerStripe, ephemeralStripe]);

  const onShare = async () => {
    Sharing.shareAsync(event.getShareables());

    try {
      const res = await Api.post("/event/stats/share", {
        auth: session,
        eid: params?.eid,
        type: "copy",
      });

      if (res.isError) throw "error";

      let updatedEv = event.updateShares(res.data.shares);
      setEvent(updatedEv);
    } catch (e) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    load();
  }, [params?.eid]);

  React.useEffect(() => {
    if (selectedNodes.length === 0) {
      setSelectedLeaves([]);
      return;
    }
    loadLeaves();
  }, [selectedNodes]);

  React.useEffect(() => {
    if (selectedLeaves.length === 0) {
      setTax(0);
      setServiceFee(0);
      setSubtotal(0);
      setTotal(0);
      return;
    }

    setIsLoadingPricing(true);

    Api.post(session && !isGuest ? "users/event/pricing" : "event/pricing", {
      auth: session,
      eid: params?.eid,
      piid: paymentIntent,
      leaves: selectedLeaves.map((l) => l.requestify()),
    })
      .then(async (res) => {
        if (res.isError) throw "error";

        setServiceFee(res.data.service);
        setSubtotal(res.data.subtotal);
        setTotal(res.data.total);
        setTax(res.data.tax);

        setPaymentIntentSecret(res.data.payment_secret);
        setPaymentIntent(res.data.piid);
        setIsLoadingPricing(false);

        if (session && !isGuest) {
          setPhone(res.data.ph);
          setEmail(res.data.em);
          setEphemeralStripe(res.data.ephemeralKey);
          setCustomerStripe(res.data.customer);
          setCheckoutSection(2);
        }

        try {
          setTimeout(() => {
            scrollContainer?.current?.scrollToEnd({
              animated: true,
            });
          }, 200);
        } catch (e) {
          console.log(e);
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoadingPricing(true);
      });
  }, [selectedLeaves]);

  const onSelect = (e) => {
    let idx = Array.from(selectedNodes).findIndex((n) => n == e.identifier);

    let nodes = [];
    if (idx > -1) {
      nodes = [...selectedNodes];
      nodes.splice(idx, 1);
    } else {
      nodes = [e.identifier, ...selectedNodes];
    }

    setSelectedNodes(new Set(nodes));
  };

  const handleLeafSelection = (e, idx) => {
    let updated = [...selectedLeaves];
    updated.splice(
      idx,
      1,
      new Leaf({ ...selectedLeaves[idx], selected: Array.from(e)[0] }),
    );
    setSelectedLeaves(updated);
  };

  const onMapNavigate = () => {
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${event?.venue?.center[1]},${event?.venue?.center[0]}`;
    const label = event?.venue?.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const handleDropdownLeafSelection = async (node, selection) => {
    setIsLoadingLeaves(true);

    if (selectedLeaves.find((l) => l.node.identifier == node.identifier)) {
      let idx = selectedLeaves.findIndex(
        (l) => l.node.identifier == node.identifier,
      );

      if (node.type === "table" || node.type == "seat") {
        let c = [...selectedLeaves];
        c.splice(idx, 1);
        setSelectedLeaves(c);
      } else if (selection == "NONE") {
        let c = [...selectedLeaves];
        c.splice(idx, 1);
        setSelectedLeaves(c);
      } else {
        handleLeafSelection([selection], idx);
      }
      setIsLoadingLeaves(false);
      return;
    }

    if (selection == "NONE") {
      setIsLoadingLeaves(false);
      return;
    }

    try {
      const res = await Api.get("/event/leaves", {
        auth: session,
        eid: params?.eid,
        nodes: node.identifier,
      });

      if (res.isError) throw "error";

      setSelectedLeaves([
        ...selectedLeaves,
        ...res.data.leaves.map(
          (l) => new Leaf({ ...l, nodes: event?.nodes, selected: selection }),
        ),
      ]);
      setIsLoadingLeaves(false);
    } catch (e) {
      console.log(e);
      setIsLoadingLeaves(false);
    }
  };

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("(tabs)/events");
    }
  };

  if (isLoading || !event)
    return (
      <LayoutContainer paddingHorizontal={0}>
        <View>
          <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
            <SkeletonLoader.Container
              style={[
                {
                  backgroundColor: "transparent",
                  width: width,
                  height: height * 0.6,
                },
              ]}
            >
              <SkeletonLoader.Item
                style={[
                  {
                    backgroundColor: "transparent",
                    width: width,
                    height: height * 0.6,
                  },
                ]}
              />
            </SkeletonLoader.Container>
          </SkeletonLoader>
        </View>
        <View
          style={{
            padding: 10,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            backgroundColor: theme["color-basic-100"],
            top: -30,
          }}
        >
          <ActivityIndicator
            style={{ marginVertical: 10 }}
            color={theme["color-primary-500"]}
          />
        </View>
      </LayoutContainer>
    );

  return (
    <StripeProvider
      publishableKey={Config.stripeKey}
      urlScheme="com.ticketsfour.app" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.ticketsfour.app" // required for Apple Pay
    >
      <ScrollContainer
        _ref={scrollContainer}
        paddingHorizontal={0}
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          style={[
            Style.button.round,
            Style.elevated,
            { zIndex: 100, padding: 0, position: "absolute", left: 0 },
          ]}
          onPress={onClose}
        >
          <Feather name="x" size={20} color={theme["color-basic-700"]} />
        </TouchableOpacity>
        <PagerView
          scrollEnabled={!seatMapZoomEnabled}
          onPageScroll={(e) => setActivePager(e?.nativeEvent?.position)}
          style={{ height: height * 0.6 }}
          initialPage={0}
        >
          {seatMapWorthyViews.map((_m, midx) => (
            <View
              key={"seatmap-layout-" + midx}
              style={{
                backgroundColor: theme["color-basic-400"],
                paddingVertical: 10,
              }}
            >
              <View
                style={[
                  Style.containers.column,
                  { marginTop: 4, marginBottom: 15 },
                ]}
              >
                <Text style={[Style.text.bold, Style.text.xl, Style.text.dark]}>
                  {event?.venue?.name}
                </Text>
                <Text style={[Style.text.semibold, Style.text.dark]}>
                  {event.venue?.location?.street.split(",")[0]}
                </Text>
                <Text style={[Style.text.semibold, Style.text.dark]}>
                  {event.venue?.location?.city}, {event.venue?.location?.region}{" "}
                  {event.venue?.location?.postal}
                </Text>
              </View>

              <SeatMap
                panEnabled={seatMapZoomEnabled}
                selected={selectedLeaves.map((l) => l.node.identifier)}
                onFocus={event.active ? onSelect : null}
                mode={event.active ? "ticketize" : "view"}
                variant="flat"
                nodes={event.nodes}
              />

              <TouchableOpacity
                onPress={() => setSeatMapZoomEnabled(!seatMapZoomEnabled)}
                style={[
                  Style.elevated,
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    backgroundColor: seatMapZoomEnabled
                      ? theme["color-basic-400"]
                      : theme["color-basic-200"],
                    zIndex: 10,
                    position: "absolute",
                    right: 5,
                    top: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Feather
                  size={26}
                  color={theme["color-basic-700"]}
                  name="zoom-in"
                />
              </TouchableOpacity>
            </View>
          ))}
          <View key="cover">
            <Image
              style={{
                width: width,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
              contentFit="cover"
              source={{ uri: event?.coverT }}
              width={width}
              height={height * 0.6}
              allowDownscaling
              contentPosition={"top"}
            />
            <BlurView
              intensity={20}
              style={[
                Style.containers.column,
                {
                  paddingHorizontal: 10,
                  width,
                  height: height * 0.6,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  position: "absolute",
                  top: 0,
                  backgroundColor: theme["color-basic-800-10"],
                },
              ]}
            >
              {!seatMapIsWorthy && (
                <View style={[Style.containers.column, { marginTop: 4 }]}>
                  <Text
                    style={[Style.text.bold, Style.text.xl, Style.text.basic]}
                  >
                    {event?.venue?.name}
                  </Text>
                  <Text style={[Style.text.semibold, Style.text.basic]}>
                    {event.venue?.location?.street.split(",")[0]}
                  </Text>
                  <Text style={[Style.text.semibold, Style.text.basic]}>
                    {event.venue?.location?.city},{" "}
                    {event.venue?.location?.region}{" "}
                    {event.venue?.location?.postal}
                  </Text>
                </View>
              )}
              <Image
                style={{
                  maxWidth: "90%",
                  flex: 1,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  alignSelf: "center",
                  marginTop: 15,
                  marginBottom: 35,
                }}
                contentFit="cover"
                source={{ uri: event?.coverT }}
                width={width}
                contentPosition={"center"}
              />
              {event?.soldOut && (
                <View
                  style={[
                    Style.containers.row,
                    {
                      borderColor: theme["color-primary-500"],
                      backgroundColor: theme["color-primary-500"],
                      borderRadius: 8,
                      borderWidth: 4,
                      paddingHorizontal: 14,
                      paddingVertical: 4,
                      position: "absolute",
                      alignSelf: "center",
                      top: height * 0.2,
                      transform: [{ rotate: "-30deg" }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      Style.text.bold,
                      Style.text.basic,
                      {
                        fontSize: 48,
                      },
                    ]}
                  >
                    {i18n.t("soldOut")}
                  </Text>
                </View>
              )}
            </BlurView>
          </View>
          <View key="map">
            <MapView
              scrollEnabled={false}
              showsUserLocation={true}
              initialRegion={{
                latitude: event.venue.center[1],
                longitude: event.venue.center[0],
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              style={{ height: height * 0.6, width: "100%" }}
            >
              <Marker
                coordinate={{
                  latitude: event.venue.center[1],
                  longitude: event.venue.center[0],
                }}
              >
                <Fontisto
                  size={32}
                  color={theme["color-primary-500"]}
                  name="map-marker-alt"
                />
              </Marker>
            </MapView>
            <TouchableOpacity
              onPress={onMapNavigate}
              style={[
                Style.elevated,
                {
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  backgroundColor: theme["color-basic-200"],
                  zIndex: 10,
                  position: "absolute",
                  right: 5,
                  top: 10,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons
                size={26}
                color={theme["color-basic-700"]}
                name="car-sport"
              />
            </TouchableOpacity>
          </View>
          {event?.lineup?.map((talent, tidx) => (
            <View key={(3 + tidx).toString()} style={{ paddingTop: 120 }}>
              <Image
                style={{
                  height: "100%",
                  width: "100%",
                }}
                contentFit="cover"
                source={{
                  uri: talent.cover?.url
                    ?.replace("{w}", "800")
                    .replace("{h}", "800"),
                }}
              />
              <BlurView
                intensity={60}
                style={[
                  Style.containers.column,
                  {
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    paddingTop: 0,
                    paddingBottom: 10,
                    paddingHorizontal: 20,
                    backgroundColor: theme["color-basic-800-10"],
                  },
                ]}
              >
                <WebView
                  style={{ width: width, height: 160 }}
                  source={{ uri: talent.embed }}
                />
                <View style={[Style.containers.row, { marginTop: 10 }]}>
                  <Text
                    style={[
                      Style.text.basic,
                      Style.text.bold,
                      Style.text.xxl,
                      { flex: 1 },
                    ]}
                  >
                    {talent.name}
                  </Text>
                  {locale == "es" && (
                    <Image
                      alt="apple music icon"
                      contentFit="contain"
                      style={{
                        width: 180,
                        height: 60,
                      }}
                      source={{
                        uri: "https://res.cloudinary.com/ticketsfour/image/upload/v1698388850/externals/apple/ESLA_Apple_Music_Listen_on_Lockup_RGB_white_090120_xzjkan.svg",
                      }}
                    />
                  )}
                  {locale !== "es" && (
                    <Image
                      alt="apple music icon"
                      contentFit="contain"
                      style={{
                        width: 180,
                        height: 60,
                      }}
                      source={{
                        uri: "https://res.cloudinary.com/ticketsfour/image/upload/v1698389281/externals/apple/US-UK_Apple_Music_Listen_on_Lockup_RGB_wht_072720_u9mqob.svg",
                      }}
                    />
                  )}
                </View>
              </BlurView>
            </View>
          ))}
        </PagerView>
        <View
          style={{
            padding: 10,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            backgroundColor: theme["color-basic-100"],
            top: -30,
          }}
        >
          <View style={[Style.containers.row, { marginTop: 5 }]}>
            {pagers.map((_p, pidx) => (
              <View
                key={"pager-" + pidx}
                style={{
                  height: 8,
                  width: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor:
                    pidx == activePager
                      ? theme["color-basic-700"]
                      : theme["color-basic-500"],
                }}
              />
            ))}
          </View>
          <View
            style={[
              Style.containers.row,
              {
                marginTop: 20,
                alignItems: "flex-start",
                justifyContent: "flex-start",
              },
            ]}
          >
            <View
              style={[
                Style.containers.column,
                {
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  flex: 1,
                },
              ]}
            >
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                {i18n.t("xPresents", {
                  promoters: event.hosts.map((h) => h.name).join(", "),
                })}
              </Text>
              <Text
                style={[
                  Style.text.xl,
                  Style.text.semibold,
                  Style.text.primary,
                  { marginTop: 4, marginBottom: 4 },
                ]}
              >
                {event.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onShare}
              style={[Style.button.round, { marginLeft: 4 }]}
            >
              <Feather
                name="share"
                size={18}
                color={theme["color-basic-700"]}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              Style.containers.row,
              {
                width: "100%",
                justifyContent: "space-between",
                marginTop: 5,
              },
            ]}
          >
            <Text
              style={[
                Style.text.semibold,
                Style.transparency.md,
                Style.text.dark,
              ]}
            >
              {event.getStart("dddd, MMM Do, YYYY")} •{" "}
              {i18n.t("doorsOpen", { time: event.getStart("hh:mm A") })}
            </Text>
          </View>
          <Text
            style={[
              Style.text.semibold,
              Style.text.dark,
              Style.transparency.sm,
              { marginTop: 14 },
            ]}
          >
            {event.description}
          </Text>
          {!event.active && (
            <Text
              style={[
                Style.text.lg,
                Style.transparency.md,
                Style.text.dark,
                Style.text.semibold,
                { marginTop: 30, textAlign: "center" },
              ]}
            >
              {i18n.t("inactiveEvent")}
            </Text>
          )}
          {event.active && (
            <>
              {event?.nodes.filter((n) => n.isExposed).length > 0 && (
                <>
                  <Text
                    style={[
                      Style.text.bold,
                      Style.text.primary,
                      Style.text.lg,
                      Style.transparency.sm,
                      { marginTop: 20, marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("chooseTickets")}
                  </Text>
                  {event?.nodes
                    .filter((n) => !n.isDecorative && n.isExposed)
                    .map((node) => {
                      if (node.type == "ga-sec")
                        return (
                          <View
                            key={"node+" + node.identifier}
                            style={[
                              Style.card,
                              selectedLeaves.find(
                                (l) => l.node.identifier == node.identifier,
                              )
                                ? { borderColor: theme["color-primary-500"] }
                                : { borderColor: theme["color-basic-700"] },
                            ]}
                          >
                            <View style={[Style.containers.column]}>
                              <Text
                                style={[
                                  Style.text.semibold,
                                  selectedLeaves.find(
                                    (l) => l.node.identifier == node.identifier,
                                  )
                                    ? Style.text.primary
                                    : Style.text.dark,
                                  Style.text.xl,
                                ]}
                              >
                                {node.getIdentifier()}
                              </Text>
                              <Text
                                style={[
                                  Style.text.semibold,
                                  selectedLeaves.find(
                                    (l) => l.node.identifier == node.identifier,
                                  )
                                    ? Style.text.primary
                                    : Style.text.dark,
                                  { marginTop: 6 },
                                ]}
                              >
                                ${node.getPrice()} + $
                                {CurrencyFormatter(node.extra?.fee)}{" "}
                                {i18n.t("fee")}
                              </Text>
                              {/* {node.type == "table" && (
                            <Text
                              style={[
                                Style.transparency.md,
                                Style.text.sm,
                                Style.text.dark,
                              ]}
                            >
                              {Pluralize(node.seatsAvailable, "Guest")}{" "}
                              {i18n.t("per_table")}
                            </Text>
                          )} */}

                              <View
                                style={[
                                  Style.containers.row,
                                  {
                                    width: "100%",
                                    justifyContent: "space-evenly",
                                    marginTop: 40,
                                    marginBottom: 10,
                                  },
                                ]}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    nodeQuantityChange(node.identifier, false)
                                  }
                                  style={[
                                    Style.button.round,
                                    { height: 48, borderRadius: 24, width: 48 },
                                  ]}
                                >
                                  <Feather
                                    name="minus"
                                    size={32}
                                    color={theme["color-basic-700"]}
                                  />
                                </TouchableOpacity>

                                <Text
                                  style={[
                                    { fontSize: 54 },
                                    Style.text.bold,
                                    Style.text.dark,
                                  ]}
                                >
                                  {nodeQuantities[node.identifier] || 1}
                                </Text>

                                <TouchableOpacity
                                  onPress={() =>
                                    nodeQuantityChange(node.identifier, true)
                                  }
                                  style={[
                                    Style.button.round,
                                    { height: 48, borderRadius: 24, width: 48 },
                                  ]}
                                >
                                  <Feather
                                    name="plus"
                                    size={32}
                                    color={theme["color-basic-700"]}
                                  />
                                </TouchableOpacity>
                              </View>

                              <Text
                                style={[
                                  Style.text.md,
                                  Style.text.semibold,
                                  Style.text.dark,
                                  { marginBottom: 10 },
                                ]}
                              >
                                {i18n.t("tickets")}
                              </Text>
                            </View>

                            <View
                              style={[
                                Style.containers.row,
                                {
                                  justifyContent: "space-between",
                                  marginTop: 10,
                                  marginBottom: 5,
                                  paddingHorizontal: 10,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  Style.text.bold,
                                  Style.text.xl,
                                  Style.text.dark,
                                  { width: "45%", textAlign: "center" },
                                ]}
                              >
                                $
                                {CurrencyFormatter(
                                  (node.price + node.extra?.fee) *
                                    (nodeQuantities[node.identifier] || 1),
                                )}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  handleDropdownLeafSelection(
                                    node,
                                    nodeQuantities[node.identifier] || 1,
                                  )
                                }
                                style={[
                                  Style.button.container,
                                  {
                                    width: "45%",
                                    height: 50,
                                    borderRadius: 50,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    Style.text.bold,
                                    Style.text.xl,
                                    Style.text.basic,
                                  ]}
                                >
                                  {i18n.t("select")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );

                      if (node.type == "seat" && node.available > 0)
                        return (
                          <TouchableOpacity
                            key={"node+" + node.identifier}
                            disabled={node.available <= 0}
                            onPress={() =>
                              handleDropdownLeafSelection(node, "1")
                            }
                            style={[
                              Style.card,
                              selectedLeaves.find(
                                (l) => l.node.identifier == node.identifier,
                              )
                                ? { borderColor: theme["color-primary-500"] }
                                : { borderColor: theme["color-basic-700"] },
                            ]}
                          >
                            <View
                              style={[Style.containers.row, { width: "100%" }]}
                            >
                              <Text
                                style={[
                                  Style.text.semibold,
                                  selectedLeaves.find(
                                    (l) => l.node.identifier == node.identifier,
                                  )
                                    ? Style.text.primary
                                    : Style.text.dark,
                                  Style.text.xxl,
                                ]}
                              >
                                {node.getTitle(event?.nodes)}
                              </Text>

                              <View
                                style={[
                                  Style.containers.column,
                                  { alignItems: "flex-end", flex: 1 },
                                ]}
                              >
                                <Text
                                  style={[
                                    Style.text.bold,
                                    Style.text.xl,
                                    selectedLeaves.find(
                                      (l) =>
                                        l.node.identifier == node.identifier,
                                    )
                                      ? Style.text.primary
                                      : Style.text.dark,
                                  ]}
                                >
                                  $
                                  {CurrencyFormatter(
                                    (node.price + node.extra?.fee) *
                                      (nodeQuantities[node.identifier] || 1),
                                  )}
                                </Text>
                                <Text
                                  style={[
                                    Style.text.semibold,
                                    selectedLeaves.find(
                                      (l) =>
                                        l.node.identifier == node.identifier,
                                    )
                                      ? Style.text.primary
                                      : Style.text.dark,
                                    { marginTop: 6 },
                                  ]}
                                >
                                  {i18n.t("includesXfee", {
                                    fee: CurrencyFormatter(node.extra?.fee),
                                  })}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );

                      return <></>;
                    })}
                  {priceChanges && priceChanges?.amount > 0 && (
                    <>
                      <Text
                        style={[
                          Style.text.primary,
                          Style.text.bold,
                          Style.text.lg,
                          { marginTop: 20 },
                        ]}
                      >
                        {i18n.t("price_amount_count", {
                          trigger: priceChanges?.amount,
                          price: CurrencyFormatter(priceChanges?.tier),
                        })}
                      </Text>
                    </>
                  )}
                  {priceChanges && priceChanges?.amount == 0 && (
                    <>
                      <Text
                        style={[
                          Style.text.primary,
                          Style.text.bold,
                          Style.text.lg,
                          { marginTop: 20 },
                        ]}
                      >
                        {i18n.t("price_amount_date", {
                          trigger: moment(priceChanges?.date).format("MMM DDo"),
                          price: CurrencyFormatter(priceChanges?.tier),
                        })}
                      </Text>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {selectedLeaves.length > 0 && !event.soldOut && event.active && (
            <View
              style={[
                Style.containers.column,
                {
                  paddingTop: 50,
                  paddingBottom: 20,
                  width: "100%",
                  paddingHorizontal: 10,
                },
              ]}
            >
              <View
                style={[
                  Style.card,
                  {
                    borderBottomWidth: 0,
                    width: "100%",
                    marginBottom: 50,
                  },
                ]}
              >
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.text.xl,
                    { marginBottom: 20, textAlign: "center" },
                  ]}
                >
                  {i18n.t("completePurchase")}
                </Text>
                {isLoadingPricing && (
                  <ActivityIndicator
                    style={{ marginVertical: 20 }}
                    size="small"
                    color={theme["color-primary-500"]}
                  />
                )}
                {!isLoadingPricing && (
                  <>
                    {selectedLeaves.map((leaf, lidx) => (
                      <View
                        key={"lead_" + lidx}
                        style={[Style.containers.row, { paddingVertical: 10 }]}
                      >
                        <View style={{ flex: 1 }}>
                          {leaf.node?.type == "table" && (
                            <Text
                              style={[
                                Style.elevated,
                                { backgroundColor: theme["color-primary-500"] },
                              ]}
                            >
                              {leaf.node?.getIdentifier(event?.nodes, true)}
                            </Text>
                          )}
                          {leaf.node?.type == "ga-sec" && (
                            <View style={[Style.badge]}>
                              <Text style={[Style.text.basic, Style.text.bold]}>
                                {leaf.selected} x{" "}
                                {leaf.node?.getIdentifier(event?.nodes, true)}
                              </Text>
                            </View>
                          )}
                          {leaf.node?.type == "seat" && (
                            <View style={[Style.badge]}>
                              <Text style={[Style.text.basic, Style.text.bold]}>
                                {leaf.selected} x{" "}
                                {leaf.node?.getTitle(event?.nodes)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View>
                          <Text
                            style={[Style.text.dark, Style.transparency.md]}
                          >
                            ${leaf.getPrice()}
                          </Text>
                        </View>
                      </View>
                    ))}
                    <View
                      style={[Style.containers.row, { paddingVertical: 10 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[Style.text.dark]}>
                          {i18n.t("service_fee")}
                        </Text>
                      </View>

                      <View>
                        <Text style={[Style.text.dark, Style.transparency.md]}>
                          ${CurrencyFormatter(serviceFee)}
                        </Text>
                      </View>
                    </View>
                    {tax > 0 && (
                      <View
                        style={[Style.containers.row, { paddingVertical: 10 }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[Style.text.dark]}>{i18n.t("tax")}</Text>
                        </View>

                        <View>
                          <Text
                            style={[Style.text.dark, Style.transparency.md]}
                          >
                            ${CurrencyFormatter(tax)}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View
                      style={[Style.containers.row, { paddingVertical: 10 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[Style.text.dark]}>
                          {i18n.t("delivery")}
                        </Text>
                      </View>

                      <View>
                        <Text style={[Style.text.dark, Style.transparency.md]}>
                          {i18n.t("free")}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[Style.containers.row, { paddingVertical: 10 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.semibold,
                            Style.text.lg,
                          ]}
                        >
                          {i18n.t("total")}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.semibold,
                            Style.text.lg,
                            Style.transparency.md,
                          ]}
                        >
                          ${CurrencyFormatter(total)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
                <View style={[Style.containers.row, { paddingVertical: 10 }]}>
                  <View
                    style={{
                      width: "98%",
                      height: 8,
                      backgroundColor: theme["color-basic-400"],
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme["color-primary-500"],
                        height: "100%",
                        width: `${checkoutSection * 50}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
              {checkoutSection == 1 && (!session || isGuest) && (
                <>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.xl,
                      Style.text.dark,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    {i18n.t("personal_info")}
                  </Text>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.dark,
                      Style.transparency.md,
                      Style.text.lg,
                      {
                        marginTop: 5,
                        marginBottom: 15,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    {i18n.t("tickets_to_mobile")}
                  </Text>
                  {missingEntry && (
                    <>
                      <Text
                        style={[
                          Style.text.danger,
                          Style.text.semibold,
                          { marginBottom: 10 },
                        ]}
                      >
                        {i18n.t("no_entry")}
                      </Text>
                    </>
                  )}
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={[
                        Style.input.container,
                        {
                          flex: 1,
                          marginTop: 20,
                          marginVertical: 5,
                          marginRight: 5,
                          borderWidth: 1.5,
                          borderColor:
                            firstNameHelper.valid || !fnameFocused
                              ? "transparent"
                              : firstNameHelper.color,
                        },
                      ]}
                    >
                      {(firstNameHelper.valid || fnameFocused) && (
                        <View
                          style={{
                            position: "absolute",
                            top: -15,
                            left: 5,
                            borderRadius: 5,
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            backgroundColor: theme["color-basic-100"],
                          }}
                        >
                          <Text
                            style={[
                              Style.text.semibold,
                              Style.text.sm,
                              { color: firstNameHelper.color },
                            ]}
                          >
                            {i18n.t("firstName")}
                          </Text>
                        </View>
                      )}
                      <TextInput
                        ref={firstNameInput}
                        onSubmitEditing={() => lastNameInput.current.focus()}
                        autoCapitalize="words"
                        autoComplete="given-name"
                        enterKeyHint="next"
                        style={[Style.input.text]}
                        placeholder={i18n.t("enter_f_name")}
                        value={firstName}
                        autoFocus
                        onFocus={() => setFNameFocused(true)}
                        onChangeText={(val) => setFirstName(val)}
                      />
                    </View>
                    <View
                      style={[
                        Style.input.container,
                        {
                          flex: 1,
                          marginTop: 20,
                          marginVertical: 5,
                          marginLeft: 5,
                          borderWidth: 1.5,
                          borderColor:
                            lastNameHelper.valid || !lnameFocused
                              ? "transparent"
                              : lastNameHelper.color,
                        },
                      ]}
                    >
                      {(lastNameHelper.valid || lnameFocused) && (
                        <View
                          style={{
                            position: "absolute",
                            top: -15,
                            left: 5,
                            borderRadius: 5,
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            backgroundColor: theme["color-basic-100"],
                          }}
                        >
                          <Text
                            style={[
                              Style.text.semibold,
                              Style.text.sm,
                              { color: lastNameHelper.color },
                            ]}
                          >
                            {i18n.t("lastName")}
                          </Text>
                        </View>
                      )}
                      <TextInput
                        ref={lastNameInput}
                        onSubmitEditing={() => phoneInput.current.focus()}
                        autoCapitalize="words"
                        autoComplete="family-name"
                        enterKeyHint="next"
                        style={[Style.input.text]}
                        placeholder={i18n.t("enter_l_name")}
                        value={lastName}
                        onFocus={() => setLNameFocused(true)}
                        onChangeText={(val) => setLastName(val)}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 25,
                      marginVertical: 5,
                    }}
                  >
                    <View
                      style={[
                        Style.input.container,
                        {
                          flex: 1,
                          marginRight: 5,
                          borderWidth: 1.5,
                          borderColor:
                            phoneHelper.valid || !phoneFocused
                              ? "transparent"
                              : phoneHelper.color,
                        },
                      ]}
                    >
                      {(phoneHelper.valid || phoneFocused) && (
                        <View
                          style={{
                            position: "absolute",
                            top: -15,
                            left: 5,
                            borderRadius: 5,
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            backgroundColor: theme["color-basic-100"],
                          }}
                        >
                          <Text
                            style={[
                              Style.text.semibold,
                              Style.text.sm,
                              { color: phoneHelper.color },
                            ]}
                          >
                            {i18n.t("phoneNumber")}
                          </Text>
                        </View>
                      )}
                      <TextInput
                        ref={phoneInput}
                        onSubmitEditing={() => phoneVerifInput.current.focus()}
                        autoComplete="tel"
                        enterKeyHint="next"
                        keyboardType="phone-pad"
                        style={[Style.input.text]}
                        placeholder={i18n.t("enter_phone_number")}
                        value={phone}
                        onFocus={() => setPhoneFocused(true)}
                        onChangeText={(val) => setPhone(val)}
                      />
                    </View>
                    <View
                      style={[
                        Style.input.container,
                        {
                          flex: 1,
                          marginLeft: 5,
                          borderWidth: 1.5,
                          borderColor:
                            phoneVHelper.valid || !phoneVerifFocused
                              ? "transparent"
                              : phoneVHelper.color,
                        },
                      ]}
                    >
                      {(phoneVHelper.valid || phoneVerifFocused) && (
                        <View
                          style={{
                            position: "absolute",
                            top: -15,
                            left: 5,
                            borderRadius: 5,
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            backgroundColor: theme["color-basic-100"],
                          }}
                        >
                          <Text
                            style={[
                              Style.text.semibold,
                              Style.text.sm,
                              { color: phoneVHelper.color },
                            ]}
                          >
                            {i18n.t("re_enter_phone_number")}
                          </Text>
                        </View>
                      )}
                      <TextInput
                        ref={phoneVerifInput}
                        onSubmitEditing={() => emailInput.current.focus()}
                        autoComplete="tel"
                        keyboardType="phone-pad"
                        enterKeyHint="next"
                        style={[Style.input.text]}
                        placeholder={i18n.t("enter_phone_number")}
                        value={phoneVerif}
                        onFocus={() => setPhoneVerifFocused(true)}
                        onChangeText={(val) => setPhoneVerif(val)}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      Style.input.container,
                      {
                        flex: 1,
                        marginRight: 5,
                        borderWidth: 1.5,
                        borderColor:
                          emailHelper.valid || !emailFocused
                            ? "transparent"
                            : emailHelper.color,
                        marginTop: 25,
                        marginVertical: 5,
                      },
                    ]}
                  >
                    {(emailHelper.valid || emailFocused) && (
                      <View
                        style={{
                          position: "absolute",
                          top: -15,
                          left: 5,
                          borderRadius: 5,
                          paddingHorizontal: 6,
                          paddingVertical: 4,
                          backgroundColor: theme["color-basic-100"],
                        }}
                      >
                        <Text
                          style={[
                            Style.text.semibold,
                            Style.text.sm,
                            { color: emailHelper.color },
                          ]}
                        >
                          {i18n.t("email")}
                        </Text>
                      </View>
                    )}
                    <TextInput
                      ref={emailInput}
                      autoComplete="email"
                      enterKeyHint="enter"
                      keyboardType="email-address"
                      style={[Style.input.text]}
                      placeholder={i18n.t("enter_email")}
                      value={email}
                      onFocus={() => setEmailFocused(true)}
                      onChangeText={(val) => setEmail(val)}
                    />
                  </View>

                  <TouchableOpacity
                    disabled={
                      isLoadingPricing ||
                      event.soldOut ||
                      !firstNameHelper.valid ||
                      !lastNameHelper.valid ||
                      !phoneHelper.valid ||
                      !phoneVHelper.valid ||
                      !emailHelper.valid
                    }
                    onPress={handlePersonal}
                    style={[
                      Style.button.container,
                      isLoadingPricing ||
                      event.soldOut ||
                      !firstNameHelper.valid ||
                      !lastNameHelper.valid ||
                      !phoneHelper.valid ||
                      !phoneVHelper.valid ||
                      !emailHelper.valid
                        ? Style.button.disabled
                        : {},
                      { width: "100%", marginTop: 30 },
                    ]}
                  >
                    <Text style={[Style.button.text, Style.text.semibold]}>
                      {i18n.t("proceed_to_payment")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {checkoutSection == 2 && total > 0 && (
                <>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.xl,
                      Style.text.dark,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    {i18n.t("payment_info")}
                  </Text>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.dark,
                      Style.transparency.md,
                      Style.text.lg,
                      {
                        marginTop: 5,
                        marginBottom: 15,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    {i18n.t("tickets_to_mobile")}
                  </Text>

                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.dark,
                      Style.transparency.md,
                      Style.text.lg,
                      {
                        marginTop: 5,
                        marginBottom: 15,
                        alignSelf: "center",
                      },
                    ]}
                  >
                    {i18n.t("openingPaySheet")}
                  </Text>
                  <ActivityIndicator
                    style={{ marginVertical: 20 }}
                    size="small"
                    color={theme["color-primary-500"]}
                  />
                </>
              )}
              {checkoutSection == 2 && total == 0 && (
                <>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.xl,
                      Style.text.dark,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    {i18n.t("payment_info")}
                  </Text>
                  <Text
                    style={[
                      Style.text.semibold,
                      Style.text.dark,
                      Style.transparency.md,
                      Style.text.lg,
                      {
                        marginTop: 5,
                        marginBottom: 15,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    {i18n.t("tickets_to_mobile")}
                  </Text>
                  {/* <CheckoutFormFree auth={auth} eid={eid} leaves={selectedLeaves} personal={{ firstName: fnameValue, lastName: lnameValue, phone: phoneValue, email: emailValue, auth: auth != null }} ev={ev} onBack={auth ? null : () => setCheckoutSection(1)} total={total}></CheckoutFormFree> */}
                </>
              )}
              {locale == "es" && (
                <Text
                  style={[Style.text.dark, Style.text.sm, { marginTop: 20 }]}
                >
                  Al presionar Proceder con el pago, estas de acuerdo con &nbsp;
                  <Link
                    href="/legal/terms"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Condiciones de Uso
                  </Link>
                  &nbsp;, la{" "}
                  <Link
                    href="/legal/privacy"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Politica de Privacidad
                  </Link>
                  &nbsp; y nuestra{" "}
                  <Link
                    href="/legal/purchase"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Politica de Compra
                  </Link>
                  .
                </Text>
              )}
              {locale !== "es" && (
                <Text
                  style={[Style.text.dark, Style.text.sm, { marginTop: 20 }]}
                >
                  By clicking Proceed to Payment, you agree to the&nbsp;
                  <Link
                    href="/legal/terms"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Terms of Use
                  </Link>
                  , the{" "}
                  <Link
                    target="_blank"
                    href="/legal/privacy"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Privacy Policy
                  </Link>
                  , our{" "}
                  <Link
                    href="/legal/purchase"
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    Purchase Policy
                  </Link>
                  , and{" "}
                  <Text style={[Style.text.primary, Style.text.semibold]}>
                    consent to recieve SMS messages
                  </Text>
                  .
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollContainer>
    </StripeProvider>
  );
}
