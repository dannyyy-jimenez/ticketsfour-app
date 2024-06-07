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
  FlatScrollContainer,
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import EventComponent from "../../../utils/components/Event";
import { router } from "expo-router";
import { ReplaceWithStyle } from "../../../utils/Formatters";

const RenderEvent = React.memo(
  ({ item: event, i18n }) => (
    <EventComponent key={event.id} i18n={i18n} _event={event} />
  ),
  (prevProps, nextProps) => {
    return prevProps.item.id == nextProps.item.id;
  },
);

export default function EventsScreen() {
  const { session, signOut } = useSession();

  const { i18n, locale } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [events, setEvents] = React.useState([]);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/events", { auth: session, q: searchQuery });
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
    load();
  }, [searchQuery]);

  if (isLoading) {
    <LayoutContainer>
      <View>
        <ActivityIndicator size="small" color={theme["color-primary-500"]} />
      </View>
    </LayoutContainer>;
  }

  return (
    <FlatScrollContainer
      paddingHorizontal={2}
      refreshControl={
        <RefreshControl
          tintColor={theme["color-primary-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
      }}
      attributes={{
        ListHeaderComponent: (
          <View>
            <View
              style={[
                Style.containers.column,
                { alignItems: "center", marginTop: 10, marginBottom: 20 },
              ]}
            >
              <Text style={[Style.text.xxl, Style.text.bold, Style.text.dark]}>
                {ReplaceWithStyle(
                  i18n.t("findNextNight"),
                  "{wildNightOut}",
                  <Text
                    key={"repl"}
                    style={[Style.text.primary, Style.text.semibold]}
                  >
                    {i18n.t("wildNightOut")}
                  </Text>,
                )}
              </Text>
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
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  placeholderTextColor={theme["color-basic-700"]}
                  style={[Style.input.text]}
                  placeholder={i18n.t("search")}
                  returnKeyType="search"
                  onSubmitEditing={({
                    nativeEvent: { text, eventCount, target },
                  }) => setSearchQuery(text)}
                />
              </View>
            </View>
          </View>
        ),
      }}
      data={events}
      renderItem={(params) => <RenderEvent {...params} i18n={i18n} />}
    />
  );
}
