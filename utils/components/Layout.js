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
import { FlatList } from "react-native";

const ScrollContainer = ({
  children,
  offsetX = 0,
  offsetY = 0,
  onScroll = () => {},
  scrollEventThrottle = 0,
  avoidKeyboard = false,
  style = {},
  paddingHorizontal = 10,
  refreshControl = <></>,
  _ref = null,
}) => {
  const { width, height } = Dimensions.get("window");
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = bottom + 20;

  return (
    <SafeAreaView
      style={[
        { flex: 1, width: "100%", backgroundColor: theme["color-basic-100"] },
      ]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          ref={_ref}
          contentOffset={{ x: offsetX, y: offsetY }}
          showsVerticalScrollIndicator={false}
          style={{
            width: "100%",
            flex: 1,
            paddingHorizontal: paddingHorizontal,
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

const FlatScrollContainer = ({
  data,
  renderItem,
  keyExtractor = (item) => item.id,
  offsetX = 0,
  offsetY = 0,
  onScroll = () => {},
  scrollEventThrottle = 0,
  avoidKeyboard = false,
  style = {},
  paddingHorizontal = 10,
  refreshControl = <></>,
  _ref = null,
  attributes,
}) => {
  const { width, height } = Dimensions.get("window");
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = bottom + 20;

  return (
    <SafeAreaView
      style={[
        { flex: 1, width: "100%", backgroundColor: theme["color-basic-100"] },
      ]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <FlatList
          ref={_ref}
          contentOffset={{ x: offsetX, y: offsetY }}
          showsVerticalScrollIndicator={false}
          style={{
            width: "100%",
            flex: 1,
            paddingHorizontal: paddingHorizontal,
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
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          {...attributes}
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export { ScrollContainer, FlatScrollContainer };

export default function LayoutContainer({ children, paddingHorizontal = 10 }) {
  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView style={{ height, width }}>
      <View
        style={{
          height,
          width,
          paddingHorizontal: paddingHorizontal,
          backgroundColor: theme["color-basic-100"],
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
