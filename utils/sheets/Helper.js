import { Dimensions, View, Text } from "react-native";
import React from "react";
import ActionSheet from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import Style, { theme } from "../Styles";
import { Feather } from "@expo/vector-icons";

function HelperSheet({ sheetId, payload }) {
  const { session, organizerMode } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const { text } = payload;

  return (
    <ActionSheet
      id={sheetId}
      isModal={false}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{
        backgroundColor: organizerMode
          ? theme["color-organizer-500"]
          : theme["color-primary-500"],
      }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View style={[Style.containers.column, { marginTop: 10 }]}>
        <Feather
          name="info"
          size={30}
          color={
            organizerMode
              ? theme["color-organizer-500"]
              : theme["color-primary-500"]
          }
        />
        <Text
          style={[
            Style.text.semibold,
            Style.text.dark,
            Style.text.lg,
            { marginTop: 20, textAlign: "center" },
          ]}
        >
          {i18n.t(text)}
        </Text>
      </View>
    </ActionSheet>
  );
}

export { HelperSheet };
export default HelperSheet;
