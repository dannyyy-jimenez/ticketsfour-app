import React from "react";
import { useSession } from "../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { ScrollContainer } from "../../utils/components/Layout";
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

export default function ReceivingScreen() {
  const { session, signOut } = useSession();

  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");

  return (
    <ScrollContainer>
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
            Purchase Orders
          </Text>
          <TouchableOpacity style={[Style.button.round]}>
            <Feather
              name="download-cloud"
              size={20}
              color={theme["color-primary-500"]}
            />
          </TouchableOpacity>
        </View>
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
      </View>
    </ScrollContainer>
  );
}
