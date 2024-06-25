import React from "react";
import { View, Text } from "react-native";
import Style, { theme } from "../Styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { TouchableOpacity } from "react-native";
import { Linking } from "react-native";

export default ArtistCard = ({
  talent,
  orientation = "horizontal",
  style = {},
  condensed = false,
}) => {
  const width = React.useMemo(() => {
    if (condensed) return 350;

    if (orientation === "singular") {
      let w = window?.innerWidth * 0.88;
      return w > 750 ? 750 : w;
    }

    return orientation == "horizontal" ? 550 : 300;
  }, [orientation]);

  const height = React.useMemo(() => {
    if (condensed) return 250;

    if (orientation === "singular") {
      let w = window?.innerWidth * 0.88;
      return w > 750 ? 562 : w * 0.75;
    }

    return orientation == "horizontal" ? 350 : 350;
  }, [orientation]);

  return (
    <View
      key={talent?.id}
      style={[
        Style.cardBlank,
        {
          width: 350,
          alignSelf: "center",
          maxWidth: 350,
          marginHorizontal: 10,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 0,
          paddingVertical: 0,
          paddingBottom: 0,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {/* <LinearGradient
        // Background Linear Gradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: "100%",
        }}
      /> */}
      <View
        style={{
          position: "absolute",
          top: 0,
          padding: 10,
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          zIndex: 1,
          backgroundColor: theme["color-basic-800-10"],
        }}
      >
        <Text
          style={[
            Style.text.basic,
            Style.text.semibold,
            Style.text.md,
            Style.transparency.md,
          ]}
        >
          Artist
        </Text>
        <Text style={[Style.text.basic, Style.text.semibold, Style.text.lg]}>
          {talent.name}
        </Text>
      </View>
      {talent.cover && !condensed && (
        <Image
          source={talent.cover?.url
            ?.replace("{w}", "1200")
            .replace("{h}", "900")}
          contentFit="cover"
          style={{
            maxWidth: 350,
            width: "100%",
          }}
          width={400}
          height={200}
          alt="artist poster"
        />
      )}
      <BlurView
        intensity={20}
        style={{
          position: "absolute",
          bottom: 0,
          zIndex: 1,
          width: "100%",
          paddingHorizontal: 10,
          paddingVertical: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => Linking.openURL(talent.externals)}
          style={[Style.containers.row]}
        >
          <Text style={[Style.text.basic, Style.text.semibold]}>
            {talent.genres}
          </Text>
          <View style={{ flex: 1 }} />
          <Image
            contentFit="contain"
            width={125}
            height={30}
            source="https://res.cloudinary.com/ticketsfour/image/upload/v1698389281/externals/apple/US-UK_Apple_Music_Listen_on_Lockup_RGB_wht_072720_u9mqob.svg"
          />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};
