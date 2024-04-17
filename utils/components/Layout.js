import React from "react";
import { useSession } from "../../utils/ctx";
import {
  Dimensions,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  View,
} from "react-native";
import Style, { theme } from "../Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ScrollContainer = ({
  children,
  offsetX = 0,
  offsetY = 0,
  onScroll = () => {},
  scrollEventThrottle = 0,
  avoidKeyboard = false,
  style = {},
  refreshControl = <></>,
}) => {
  const { width, height } = Dimensions.get("window");
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = bottom + 130;

  return (
    <SafeAreaView style={[{ height, width }]}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          contentOffset={{ x: offsetX, y: offsetY }}
          showsVerticalScrollIndicator={false}
          style={{
            width,
            paddingHorizontal: 10,
            backgroundColor: theme["color-basic-100"],
          }}
          contentContainerStyle={[
            {
              paddingBottom: tabBarHeight,
            },
            style,
          ]}
          onScroll={onScroll}
          refreshControl={refreshControl}
          scrollEventThrottle={scrollEventThrottle}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export { ScrollContainer };

export default function LayoutContainer({ children }) {
  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView style={{ height, width }}>
      <View
        style={{
          height,
          width,
          paddingHorizontal: 10,
          backgroundColor: theme["color-basic-100"],
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
