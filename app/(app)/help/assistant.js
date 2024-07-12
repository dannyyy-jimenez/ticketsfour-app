import React from "react";
import { useSession } from "../../../utils/ctx";
import { View, Dimensions, ScrollView, Platform } from "react-native";
import { ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";

import { TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts } from "@expo-google-fonts/inter";
import { Text } from "react-native";
import Api from "../../../utils/Api";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function TicketScreen() {
  const { auth } = useSession();
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = bottom + 80;
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState("");
  const [conversation, setConversation] = React.useState([
    {
      sender: "assistant",
      message: i18n.t("assistantGreeting"),
    },
  ]);
  const [message, setMessage] = React.useState("");
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../../../assets/Flix-Normal.otf"),
  });
  const conversationScrollRef = React.useRef(null);

  const onSubmit = async () => {
    let _message = message;
    let _conversation = [...conversation];

    _conversation.push({
      sender: "user",
      message: message,
    });

    setIsLoading(true);
    setMessage("");
    setTimeout(() => {
      setConversation(_conversation);
    }, 500);

    try {
      const res = await Api.post("/users/assistant", {
        auth,
        message: _message,
        conversationId,
      });

      if (res.isError) throw "error";

      _conversation.push({
        sender: "assistant",
        message: res.data.response,
      });
      setIsLoading(false);

      setTimeout(() => {
        setConversation(_conversation);
      }, 500);
    } catch {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    conversationScrollRef?.current?.scrollToEnd({ animated: true });
  }, [conversation.length, isLoading]);

  React.useEffect(() => {
    Api.post("/users/assistant/begin", { auth })
      .then((res) => {
        if (res.isError) throw "AH";

        setConversationId(res.data.id);
      })
      .catch((e) => {});
  }, []);

  return (
    <>
      {Platform.OS == "android" && <StatusBar hidden />}
      <KeyboardAvoidingView
        behavior="position"
        style={{
          height: height,
          backgroundColor: theme["color-basic-100"],
        }}
      >
        <ScrollView
          ref={conversationScrollRef}
          showsVerticalScrollIndicator={false}
          style={{
            width: "100%",
            paddingHorizontal: 10,
            height: height - 150,
          }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: 180,
              height: conversation.length > 1 ? 200 : height * 0.6,
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <MaterialCommunityIcons
              name="robot-confused-outline"
              size={84}
              color={theme["color-primary-500"]}
              style={{ marginVertical: 20 }}
            />
            <Text
              style={[
                Style.text.primary,
                Style.text.xxl,
                { fontFamily: "Flix-Normal", letterSpacing: 0.5 },
              ]}
            >
              Tickets Four
            </Text>
            <Text
              style={[
                Style.text.dark,
                Style.text.lg,
                {
                  textAlign: "right",
                  width: "100%",
                  fontFamily: "Flix-Normal",
                  letterSpacing: 0.5,
                },
              ]}
            >
              Assistant
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          {conversation.map((message, midx) => (
            <View
              key={"message-" + midx}
              style={{ width: "100%", marginVertical: 6 }}
            >
              <View
                style={{
                  width: width * 0.6,
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor:
                    message.sender == "assistant"
                      ? theme["color-primary-300"]
                      : theme["color-basic-700"],
                  borderBottomLeftRadius: message.sender == "assistant" ? 0 : 6,
                  borderBottomRightRadius:
                    message.sender == "assistant" ? 6 : 0,
                  alignSelf:
                    message.sender == "assistant" ? "flex-start" : "flex-end",
                }}
              >
                <Text style={[Style.text.basic, Style.text.semibold]}>
                  {message.message}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={{ width, marginVertical: 6 }}>
              <View
                style={{
                  width: width * 0.6,
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  borderBottomLeftRadius: 0,
                }}
              >
                <Text
                  style={[
                    Style.text.basic,
                    Style.text.xxl,
                    Style.text.semibold,
                  ]}
                >
                  🤔🤔🤔
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={{ width, flexGrow: 0 }}>
          <View
            style={[
              Style.input.container,
              {
                width: width - 40,
                alignSelf: "center",
              },
            ]}
          >
            <View style={[Style.input.prefix]}>
              <Feather
                name="message-square"
                size={18}
                color={theme["color-primary-400"]}
              />
            </View>
            <TextInput
              readOnly={isLoading || conversation.length > 20}
              onSubmitEditing={onSubmit}
              enterKeyHint="submit"
              style={[Style.input.text]}
              placeholder={i18n.t("enter_message")}
              value={message}
              onChangeText={(val) => setMessage(val)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
