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
  Linking,
  Alert,
  ScrollView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Leaf from "../../../models/Leaf";
import Config from "../../../utils/Config";
import SkeletonLoader from "expo-skeleton-loader";
import Blog from "../../../models/Blog";
import FancyComposer from "../../../utils/components/FancyComposer";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

export default function EventScreen() {
  const { auth, isGuest, signOut } = useSession();

  const scrollContainer = React.useRef(null);
  const insets = useSafeAreaInsets();
  const { i18n, locale } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const [isLoading, setIsLoading] = React.useState(true);
  const [celebrated, setCelebrated] = React.useState(false);
  const [blog, setBlog] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const { bid } = useLocalSearchParams();

  const onShare = async (type) => {
    if (type === "facebook") {
      FB?.ui(
        {
          method: "share",
          href: blog?.getShareables(type),
        },
        (response) => {},
      );
    } else if (type === "messenger") {
      FB?.ui({
        method: "send",
        link: blog?.getShareables(type),
      });
    } else if (type === "twitter") {
      window.open(blog?.getShareables(type), "_blank");
    } else if (type === "email") {
      window?.open(blog?.getShareables(type), "_blank");
    } else if (type === "copy") {
      try {
        await navigator.clipboard.writeText(blog?.getShareables());
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }

    try {
      const res = await Api.post("/blog/stats/share", { auth, bid, type });

      if (res.isError) throw "error";

      let updatedBlog = blog.updateShares(res.data.shares);
      setBlog(updatedBlog);
    } catch (e) {
      console.log(e);
    }
  };

  const MarkAsViewed = async () => {
    try {
      await Api.post("/blog/stats/view", { auth, bid });
    } catch (e) {
      console.log(e);
    }
  };

  const load = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/blog", { auth, bid });

      if (res.isError) throw "e";

      setBlog(new Blog({ ...res.data.blog }));
      setEvents(res.data.events.map((ev) => new EventModel({ ...ev })));
      MarkAsViewed();
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onCheckoutEvent = (_event) => {
    router.push("/events/" + _event.id);
  };

  const celebrate = async () => {
    setCelebrated(true);

    try {
      await Api.post("/blog/stats/celebrate", { auth, bid });
    } catch (e) {
      console.log(e);
    }
  };

  const onClose = () => {
    router.back();
  };

  React.useEffect(() => {
    load();
  }, [bid]);

  if (isLoading || !blog)
    return (
      <LayoutContainer paddingHorizontal={0}>
        <View>
          <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
            <SkeletonLoader.Container
              style={[
                {
                  backgroundColor: "transparent",
                  width: width,
                  height: height * 0.4,
                },
              ]}
            >
              <SkeletonLoader.Item
                style={[
                  {
                    backgroundColor: "transparent",
                    width: width,
                    height: height * 0.4,
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
    <ScrollContainer
      _ref={scrollContainer}
      style={{ paddingBottom: 0 }}
      paddingHorizontal={0}
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
      <View>
        <Image
          style={{
            width: "100%",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
          contentFit="cover"
          source={{ uri: blog.cover }}
          width={"100%"}
          height={height * 0.4}
          allowDownscaling
          contentPosition={"top"}
        />
        <BlurView
          intensity={20}
          style={[
            Style.containers.column,
            {
              paddingHorizontal: 10,
              width: "100%",
              height: height * 0.4,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "flex-start",
              position: "absolute",
              top: 0,
              backgroundColor: theme["color-basic-800-10"],
            },
          ]}
        >
          <Image
            style={{
              maxWidth: "90%",
              flex: 1,
              borderRadius: 4,
              alignSelf: "center",
              marginTop: 15,
              marginBottom: 35,
            }}
            contentFit="cover"
            source={{ uri: blog.cover }}
            width={"100%"}
            contentPosition={"center"}
          />
        </BlurView>
      </View>
      <View
        style={{
          padding: 10,
          paddingVertical: 20,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          backgroundColor: theme["color-basic-100"],
          top: -30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={[Style.text.primary, Style.text.normal]}>
          {blog?.getCategory()}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.bold,
            Style.text.xl,
            { textAlign: "center", marginTop: 10 },
          ]}
        >
          {blog?.title}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.bold,
            { textAlign: "center", marginTop: 15 },
          ]}
        >
          {blog?.subtitle}
        </Text>

        {blog?.tags?.length > 0 && (
          <View
            style={[Style.containers.row, { marginTop: 15, marginBottom: 20 }]}
          >
            {blog?.tags.map((tag, tidx) => (
              <View
                style={[Style.badge, { marginHorizontal: 4 }]}
                key={"T-" + tidx}
              >
                <Text style={[Style.text.basic, Style.text.semibold]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            Style.containers.column,
            {
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            },
          ]}
        >
          {events.length > 0 && (
            <>
              <Text
                style={[
                  Style.text.dark,
                  Style.transparency.md,
                  Style.text.bold,
                  Style.text.lg,
                  { marginTop: 15, marginBottom: 10, alignSelf: "flex-start" },
                ]}
              >
                {i18n.t("featuredEvents")}
              </Text>

              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
                style={{ marginTop: 10, marginBottom: 30, width: "100%" }}
              >
                {events.map((ev) => (
                  <TouchableOpacity
                    onPress={() => onCheckoutEvent(ev)}
                    key={ev.id}
                    style={[
                      Style.cards.exposeCreative,
                      { alignSelf: "flex-start", marginHorizontal: 5 },
                    ]}
                  >
                    <Image
                      placeholder={blurhash}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      contentFit="cover"
                      source={{ uri: ev.coverT }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <FancyComposer nodes={blog?.nodes} />
        </View>
      </View>
    </ScrollContainer>
  );
}
