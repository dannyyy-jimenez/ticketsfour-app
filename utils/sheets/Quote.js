import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { CurrencyFormatter, FormatPhoneNumber } from "../Formatters";
import Api from "../Api";
import Task from "../../models/Task";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function ViewQuoteSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const skeletonItems = new Array(10).fill(0);
  const [quote, setQuote] = React.useState(payload?.quote);

  const [isLoading, setIsLoading] = React.useState(false);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/retro/quote", {
        auth: session,
        quoteId: quote.id,
      });
      if (res.isError) throw "e";

      setQuote(new Task({ ...res.data.quote }));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ActionSheet
      id={sheetId}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-primary-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View style={{ width: width * 0.9 }}>
        <View style={[{ marginTop: 10, marginBottom: 20 }]}>
          <View
            style={[
              Style.containers.row,
              {
                width: width * 0.5,
                alignSelf: "center",
                justifyContent: "center",
              },
            ]}
          >
            <MaterialIcons
              name="request-quote"
              size={28}
              color={theme["color-primary-500"]}
            />
          </View>

          <Text
            style={[
              Style.text.xxxl,
              Style.text.bold,
              Style.text.dark,
              { textAlign: "center", marginTop: 20 },
            ]}
          >
            #{quote.reference}
          </Text>
          <Text
            style={[
              Style.text.semibold,
              Style.text.dark,
              { textAlign: "center", padding: 10 },
            ]}
          >
            {quote.customer.businessName}
          </Text>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Line Items
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              {quote.todosSize} items
            </Text>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Date Created
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              {quote.timeAgo()}
            </Text>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Address
            </Text>

            <View style={[Style.containers.row, { marginVertical: 8 }]}>
              <Text
                style={[
                  Style.button.text,
                  Style.text.semibold,
                  Style.text.dark,
                  { textAlign: "left" },
                ]}
              >
                {quote.address.address}
              </Text>
            </View>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Customer
            </Text>
            <View style={[Style.containers.row, { marginVertical: 8 }]}>
              <Text
                style={[
                  Style.button.text,
                  Style.text.semibold,
                  Style.text.dark,
                  { textAlign: "left" },
                ]}
              >
                {quote.customer.name}, {FormatPhoneNumber(quote.customer.phone)}
              </Text>
            </View>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Total
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              {CurrencyFormatter.format(quote.total)}
            </Text>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
}

export { ViewQuoteSheet };
export default ViewQuoteSheet;
