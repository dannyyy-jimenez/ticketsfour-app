import React from "react";
import { useSession } from "../ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import Style, { theme } from "../Styles";
import {
  FontAwesome6,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalization } from "../../locales/provider";
import { useFonts } from "expo-font";
import QRCode from "react-native-qrcode-svg";
import PassKit, { AddPassButton } from "react-native-wallet-pass";
import Api from "../Api";

export default function TicketComponent({ ticket, hidden = false }) {
  const [fontsLoaded, fontError] = useFonts({
    "Flix-Normal": require("../../assets/Flix-Normal.otf"),
  });
  const { i18n } = useLocalization();
  const [hideQr, setHideQr] = React.useState(hidden);
  const [showApplePass, setShowApplePass] = React.useState(false);

  React.useEffect(() => {
    PassKit.canAddPasses().then((result) => {
      setShowApplePass(true);
    });
  });

  const onAddToAppleWallet = async () => {
    try {
      setShowApplePass(false);
      const res = await Api.get("/wallet/apple/ticket", {
        base64: true,
        id: ticket.id,
        token: "T-" + ticket.token,
        eid: ticket.event.id,
      });
      if (res.isError) throw "e";

      PassKit.addPass(res.data.encoding);
    } catch (e) {}
  };

  return (
    <>
      <View
        key={ticket.token}
        style={[
          Style.card,
          {
            alignSelf: "center",
            height: 300,
            maxWidth: 350,
            aspectRatio: "2/3",
            paddingHorizontal: 0,
            paddingVertical: 0,
            flex: 1,
            borderBottomColor: theme["color-primary-500"],
          },
        ]}
      >
        {ticket?.node?.isExposed && (
          <View
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              flexGrow: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              backgroundColor: theme["color-primary-500"],
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <Text
              style={[
                Style.text.basic,
                Style.text.xxl,
                {
                  fontFamily: "Flix-Normal",
                  letterSpacing: 0.5,
                },
              ]}
            >
              Tickets Four{" "}
            </Text>
            <MaterialCommunityIcons
              style={{ opacity: 0.8, position: "absolute", right: 10, top: 10 }}
              color={theme["color-basic-100"]}
              size={22}
              name="contactless-payment"
            />
          </View>
        )}
        {!ticket?.node?.isExposed && (
          <View
            style={{
              paddingVertical: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme["color-basic-100"],
            }}
          >
            <Text
              style={[
                Style.text.primary,
                Style.text.xxl,
                { fontFamily: "Flix-Normal", letterSpacing: 0.5 },
              ]}
            >
              Tickets Four
            </Text>
            <Text style={[Style.text.dark]}>{i18n.t("notValidEntry")}</Text>
          </View>
        )}
        <View
          style={[
            Style.containers.row,
            {
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 25,
            },
          ]}
        >
          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              Event
            </Text>
            <Text style={[Style.text.dark, Style.text.bold]}>
              {ticket.event?.name}
            </Text>
          </View>
          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              Location
            </Text>
            <Text style={[Style.text.dark, Style.text.bold]}>
              {ticket.event?.venue?.name}
            </Text>
          </View>
        </View>
        <View
          style={[
            Style.containers.row,
            {
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
            },
          ]}
        >
          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              Date
            </Text>
            <Text style={[Style.text.dark, Style.text.bold]}>
              {ticket.event.getStart("MMM Do")}
            </Text>
          </View>
          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              Doors Open
            </Text>
            <Text style={[Style.text.dark, Style.text.bold]}>
              {ticket.event.getStart("hh:mm A")}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme["color-primary-500"],
            height: 3,
            borderRadius: 4,
            width: "90%",
            alignSelf: "center",
            marginVertical: 10,
          }}
        />
        <View
          style={[
            Style.containers.row,
            {
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
            },
          ]}
        >
          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Style.text.dark,
                Style.text.semibold,
                Style.transparency.md,
              ]}
            >
              Name
            </Text>
            <Text style={[Style.text.dark, Style.text.bold]}>
              {ticket.getBuyer()}
            </Text>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flex: 1,
              },
            ]}
          >
            {ticket.node.type == "seat" && (
              <>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  Section
                </Text>
                <Text style={[Style.text.dark, Style.text.bold]}>
                  Seat {ticket.node?.name}
                </Text>
              </>
            )}
            {ticket.node.type != "seat" && (
              <>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.transparency.md,
                  ]}
                >
                  Section
                </Text>
                <Text style={[Style.text.dark, Style.text.bold]}>
                  {ticket.node?.getIdentifier([], true)}
                </Text>
              </>
            )}
          </View>
        </View>
        {!hideQr && (
          <View
            style={[
              Style.containers.row,
              { flexGrow: 1, marginTop: 6, marginBottom: 10 },
            ]}
            className="qr-holder"
          >
            <QRCode
              value={ticket.token}
              logo={require("../../assets/icon.png")}
              logoBackgroundColor={theme["color-basic-100"]}
              logoMargin={4}
              logoBorderRadius={4}
              color={theme["color-primary-500"]}
              size={160}
            />
          </View>
        )}
        {hideQr && (
          <View
            style={[Style.containers.column, { flex: 1, paddingVertical: 15 }]}
          >
            <Text
              style={[Style.text.semibold, Style.text.lg, Style.text.primary]}
            >
              Share to Social Media!
            </Text>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                margin: 10,
                borderRadius: 6,
                backgroundColor: theme["color-basic-400"],
              }}
              onPress={() => setHideQr(false)}
            >
              <Text style={[Style.text.dark, Style.text.semibold]}>
                Show QR Code
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {showApplePass && (
        <AddPassButton
          style={{
            height: 55,
            width: 250,
            marginTop: 15,
            alignSelf: "center",
          }}
          addPassButtonStyle={PassKit.AddPassButtonStyle.black}
          onPress={onAddToAppleWallet}
        />
      )}
    </>
  );
}
