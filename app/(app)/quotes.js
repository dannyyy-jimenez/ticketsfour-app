import React from "react";
import { useSession } from "../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import LayoutContainer, {
  ScrollContainer,
} from "../../utils/components/Layout";
import Style, { theme } from "../../utils/Styles";
import {
  Feather,
  Octicons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "../../locales/provider";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../utils/Api";
import QuoteComponent from "../../utils/components/Quote";

export default function QuotesScreen() {
  const { session, signOut } = useSession();

  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const [quotes, setQuotes] = React.useState([]);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/retro/quotes", { auth: session });
      if (res.isError) throw "e";

      setQuotes(res.data.quotes);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setIsLoading(true);
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    <LayoutContainer>
      <View>
        <View
          style={[Style.containers.row, { marginTop: 10, marginBottom: 20 }]}
        >
          <Text
            style={[
              Style.text.xxxl,
              Style.text.bold,
              Style.text.dark,
              { flex: 1 },
            ]}
          >
            Quotes
          </Text>
          <TouchableOpacity style={[Style.button.round]}>
            <Feather name="plus" size={20} color={theme["color-primary-500"]} />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="small" color={theme["color-primary-500"]} />
      </View>
    </LayoutContainer>;
  }

  return (
    <ScrollContainer
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
          style={[Style.containers.row, { marginTop: 10, marginBottom: 20 }]}
        >
          <Text
            style={[
              Style.text.xxxl,
              Style.text.bold,
              Style.text.dark,
              { flex: 1 },
            ]}
          >
            Quotes
          </Text>
          <TouchableOpacity style={[Style.button.round]}>
            <Feather name="plus" size={20} color={theme["color-primary-500"]} />
          </TouchableOpacity>
        </View>

        {quotes.map((quote, qidx) => (
          <QuoteComponent i18n={i18n} _quote={quote} key={quote.id} />
        ))}
      </View>
    </ScrollContainer>
  );
}
