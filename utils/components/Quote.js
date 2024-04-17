import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import {
  Feather,
  Octicons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import Style, { theme } from "../../utils/Styles";
import { CurrencyFormatter, Numberfy } from "../Formatters";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Sharing from "expo-sharing";
import Task from "../../models/Task";

export default function QuoteComponent({ i18n, _quote, reload }) {
  const { showActionSheetWithOptions } = useActionSheet();
  const quote = React.useMemo(() => {
    return new Task({ ..._quote });
  }, [_quote]);
  const { width, height } = Dimensions.get("window");

  const onActionsPress = () => {
    const options = ["Delete Quote", "View Quote", "Promote to Task", "Back"];
    const cancelButtonIndex = 3;
    const title = "Select Action";

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 0,
        title,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            // Save
            break;

          case 1:
            onView();
            // Save
            break;

          case 2:
            alert("Schedule");
            // Save
            break;

          case cancelButtonIndex:
          // Canceled
        }
      },
    );
  };

  const onShare = async () => {
    await Sharing.shareAsync("https://www.google.com");
  };

  const onView = () => {
    SheetManager.show("quote-view-sheet", {
      payload: {
        quote,
      },
    });
  };

  return (
    <View style={[Style.cards.showoff, Style.elevated, { width: width * 0.9 }]}>
      <View style={[Style.containers.row]}>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[Style.text.bold, Style.text.dark, Style.text.xl]}
          >
            {quote.customer.businessName}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              Style.text.semibold,
              Style.text.dark,
              Style.text.sm,
              { marginTop: 4 },
            ]}
          >
            {quote.createdAtF} • #{quote.reference}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onShare}
          style={[
            Style.button.round,
            Style.background.primary,
            { height: 40, width: 40, borderRadius: 20 },
          ]}
        >
          <Octicons name="share" size={20} color={theme["color-basic-100"]} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }} />
      <View
        style={[
          Style.containers.row,
          {
            marginTop: 45,
            marginBottom: 15,
            justifyContent: "space-evenly",
          },
        ]}
      >
        <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
          <MaterialCommunityIcons
            name="format-list-numbered"
            size={26}
            color={theme["color-primary-500"]}
          />
          <Text
            style={[Style.text.semibold, Style.text.dark, { marginLeft: 4 }]}
          >
            {quote.todosSize}
          </Text>
        </View>
        <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
          <MaterialCommunityIcons
            name="currency-usd"
            size={26}
            color={theme["color-primary-500"]}
          />
          <Text
            style={[Style.text.semibold, Style.text.dark, { marginLeft: 4 }]}
          >
            {CurrencyFormatter.format(quote.total)}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
          <MaterialCommunityIcons
            name="calendar-clock-outline"
            size={26}
            color={theme["color-primary-500"]}
          />
          <Text
            style={[Style.text.semibold, Style.text.dark, { marginLeft: 4 }]}
          >
            {quote.timeAgo()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onActionsPress}
        style={[Style.button.container, { height: 45 }]}
      >
        <Text style={[Style.button.text, Style.text.semibold]}>Actions</Text>
      </TouchableOpacity>
    </View>
  );
}
