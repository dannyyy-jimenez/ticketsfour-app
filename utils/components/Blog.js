import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Style, { theme } from "../Styles";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../../locales/provider";
import { Image } from "expo-image";
import { router } from "expo-router";

export default function BlogComponent({ blog }) {
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");

  const onView = () => {
    router.push("/blogs/" + blog.identifier);
  };

  return (
    <TouchableOpacity
      onPress={onView}
      style={[
        Style.card,
        {
          alignSelf: "center",
          paddingHorizontal: 0,
          paddingVertical: 0,
          width: width * 0.9,
          borderBottomColor: theme["color-primary-500"],
        },
      ]}
    >
      {blog.cover && (
        <Image
          source={{ uri: blog.getCoverURI() }}
          contentFit="cover"
          style={{ width: "100%", aspectRatio: "2/1" }}
        />
      )}
      <View
        style={[
          Style.containers.column,
          {
            alignItems: "flex-start",
            paddingHorizontal: 15,
            paddingTop: 10,
          },
        ]}
      >
        <View style={[Style.containers.row, { width: "100%" }]}>
          <View
            style={[
              Style.containers.column,
              {
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flex: 1,
                marginRight: 15,
              },
            ]}
          >
            <Text
              style={[Style.text.primary, Style.text.lg, Style.text.semibold]}
            >
              {blog.title}
            </Text>
          </View>
          <View style={[Style.badge]}>
            <Text style={[Style.text.basic, Style.text.semibold]}>
              {blog.getCategory()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.transparency.md,
            { marginTop: 6 },
          ]}
        >
          {blog.subtitle.length > 95
            ? blog.subtitle.slice(0, 95) + "..."
            : blog.subtitle}
          <Text style={[Style.text.primary, Style.text.sm]}>
            {blog.tags.map((t) => "#" + t).join(" ")}
          </Text>
        </Text>
        <View
          style={[
            Style.containers.row,
            { justifyContent: "space-evenly", width: "100%", marginTop: 15 },
          ]}
        >
          <View style={[Style.containers.row]}>
            <Feather
              name="bar-chart-2"
              size={18}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.text.sm,
                { marginLeft: 2 },
              ]}
            >
              {blog.getViews()}
            </Text>
          </View>
          <View style={[Style.containers.row]}>
            <Feather name="heart" size={18} color={theme["color-basic-700"]} />
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.text.sm,
                { marginLeft: 4 },
              ]}
            >
              {blog.getLikes()}
            </Text>
          </View>
          <View style={[Style.containers.row]}>
            <Feather
              name="share-2"
              size={18}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.text.sm,
                { marginLeft: 4 },
              ]}
            >
              {blog.getShares()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
