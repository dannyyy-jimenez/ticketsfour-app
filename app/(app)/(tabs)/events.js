import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import LayoutContainer, {
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import EventComponent from "../../../utils/components/Event";
import { router } from "expo-router";

export default function EventsScreen() {
  const { session, signOut } = useSession();

  const [search, setSearch] = React.useState("");
  const { i18n, locale } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const [events, setEvents] = React.useState([]);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/events", { auth: session });
      if (res.isError) throw "e";

      setEvents(res.data.events);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setIsLoading(true);
    load();
  }, []);

  React.useEffect(() => {
    // setTimeout(() => {
    //   router.push({
    //     pathname: "tickets/verify",
    //     params: {
    //       eid: "6621a60afb6af7a6170236f7",
    //       intent: "pi_3PCbCJA60uJAVJy31bDMtjqN",
    //       secret:
    //         "pi_3PCbCJA60uJAVJy31bDMtjqN_secret_GCKSdr8GEdVhyReFnWDXwWPFw",
    //     },
    //   });
    // }, 3000);
    load();
  }, []);

  if (isLoading) {
    <LayoutContainer>
      <View>
        <ActivityIndicator size="small" color={theme["color-primary-500"]} />
      </View>
    </LayoutContainer>;
  }

  return (
    <ScrollContainer
      paddingHorizontal={2}
      refreshControl={
        <RefreshControl
          tintColor={theme["color-primary-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View>
        <View
          style={[
            Style.containers.column,
            { alignItems: "center", marginTop: 10, marginBottom: 20 },
          ]}
        >
          {locale == "en" && (
            <Text
              style={[
                Style.text.xl,
                Style.text.bold,
                Style.text.dark,
                { textAlign: "center" },
              ]}
            >
              Find your next{" "}
              <Text
                style={[Style.text.xl, Style.text.bold, Style.text.primary]}
              >
                wild night out
              </Text>{" "}
              with friends
            </Text>
          )}
          <View
            style={[
              Style.input.container,
              {
                width: width - 20,
                marginVertical: 15,
                marginBottom: 0,
              },
            ]}
          >
            <View style={[Style.input.prefix]}>
              <Feather
                name="search"
                size={20}
                color={theme["color-basic-700"]}
              />
            </View>
            <TextInput
              value={search}
              autoCorrect={false}
              clearButtonMode="while-editing"
              placeholderTextColor={theme["color-basic-700"]}
              style={[Style.input.text]}
              placeholder={i18n.t("search")}
              onChangeText={(val) => setSearch(val)}
            />
          </View>
        </View>
      </View>
      {events.map((event, eidx) => (
        <EventComponent key={event.id} i18n={i18n} _event={event} />
      ))}
    </ScrollContainer>
  );
}
