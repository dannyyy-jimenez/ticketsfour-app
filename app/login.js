import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSession } from "../utils/ctx";
import { router } from "expo-router";
import Api from "../utils/Api";
import { Image } from "expo-image";
import ActionSheet from "react-native-actions-sheet";
import Styles, { theme } from "../utils/Styles";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useLocalization } from "../locales/provider";
import { useFonts, Bungee_400Regular } from "@expo-google-fonts/bungee";
import { Ionicons } from "@expo/vector-icons";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function LoginScreen() {
  let [fontsLoaded] = useFonts({
    Bungee_400Regular,
  });
  const { i18n } = useLocalization();
  const actionSheetRef = React.useRef(null);
  const { width, height } = Dimensions.get("window");
  const { session, signIn } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [accessCode, setAccessCode] = React.useState("");

  const onLogin = async () => {
    setIsLoading(true);
    try {
      const res = await Api.post("/auth/login", {
        code: accessCode,
      });
      if (res.isError) throw res?.data?.message;

      setIsLoading(false);
      signIn(res.data.esid);
    } catch (e) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!session) return;

    router.push("/jobs");
  }, [session]);

  React.useEffect(() => {
    actionSheetRef.current?.show();
  }, []);

  return (
    <KeyboardAvoidingView behavior="position">
      <TouchableWithoutFeedback
        style={{ height, width }}
        onPress={Keyboard.dismiss}
      >
        <View
          style={{ height, width, backgroundColor: theme["color-primary-200"] }}
        >
          <ActionSheet
            keyboardHandlerEnabled={false}
            gestureEnabled={false}
            useBottomSafeAreaPadding
            closable={false}
            isModal
            backgroundInteractionEnabled
            closeOnTouchBackdrop={false}
            ref={actionSheetRef}
            containerStyle={{
              padding: 20,
              paddingHorizontal: 20,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Pressable onPress={Keyboard.dismiss}>
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    Styles.text.dark,
                    {
                      fontSize: 50,
                      marginTop: 20,
                      fontFamily: "Bungee_400Regular",
                    },
                  ]}
                >
                  GLASS 4 YOU
                </Text>
                <Text
                  style={[Styles.text.xl, Styles.text.bold, { marginTop: 30 }]}
                >
                  Enter access code
                </Text>

                <View
                  style={[
                    Styles.input.container,
                    {
                      width: width - 40,
                      marginVertical: 30,
                      marginBottom: 60,
                    },
                  ]}
                >
                  <View style={[Styles.input.prefix]}>
                    <Ionicons
                      name="finger-print-outline"
                      color={theme["color-basic-700"]}
                      size={20}
                    />
                  </View>
                  <TextInput
                    style={[Styles.input.text]}
                    placeholder={i18n.t("accessCode")}
                    inputMode="text"
                    keyboardType="visible-password"
                    value={accessCode}
                    onChangeText={(val) => setAccessCode(val)}
                  />
                </View>
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={theme["color-primary-500"]}
                  />
                )}
                {!isLoading && (
                  <TouchableOpacity
                    disabled={accessCode == ""}
                    onPress={onLogin}
                    style={[
                      Styles.button.container,
                      accessCode == "" ? Styles.button.disabled : {},
                      { width: width - 40, marginBottom: 10 },
                    ]}
                  >
                    <Text style={[Styles.button.text, Styles.text.semibold]}>
                      Log in
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          </ActionSheet>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
