///tickets/verify 6621a60afb6af7a6170236f7 pi_3PCZq0A60uJAVJy31fgHDES2 pi_3PCZq0A60uJAVJy31fgHDES2_secret_JoIeQp1y6bJyXd28QQtQVJ4HB

import React from "react";
import { useSession } from "../../../utils/ctx";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import LayoutContainer, {
  ScrollContainer,
} from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { useLocalization } from "../../../locales/provider";
import { router, useLocalSearchParams } from "expo-router";
import { CameraView } from "expo-camera";
import EventModel from "../../../models/Event";
import Api from "../../../utils/Api";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function PublicScannerScreen() {
  const { i18n } = useLocalization();
  const { auth } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);

  const { oid, eid, uk } = useLocalSearchParams();
  const { height, width } = Dimensions.get("window");

  const [scannerResult, setScannerResult] = React.useState(null);
  const [ev, setEvent] = React.useState(null);
  const [scannedCode, setScannedCode] = React.useState(null);
  const [isLoadingScan, setIsLoadingScan] = React.useState(false);
  const [scannerResultsDatum, setScannerResultsDatum] = React.useState(null);

  const handleScannerResponse = async (res) => {
    if (isLoadingScan || scannerResultsDatum != null) return;

    let { bounds, data, cornerPoints } = res;

    // tl, tr, bl, br = cornerPoints

    setScannerResultsDatum(res);
    setScannedCode(data);
  };

  const onScan = async () => {
    if (isLoadingScan || scannerResult) return;
    setIsLoadingScan(true);

    try {
      const res = await Api.post("/scanner", {
        auth,
        oid,
        eid,
        uk,
        tid: scannedCode,
      });
      if (res.isError) throw res.data.message;

      setScannerResult(res.data.status);
      let updatedEv = ev.updateScanned(res.data.scanned);
      setEvent(updatedEv);
      setIsLoadingScan(false);
    } catch (e) {
      if (e === "NO_EVENT") load();
      setScannerResult("INVALID_TICKET");
    }
  };

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("(tabs)/events");
    }
  };

  React.useEffect(() => {
    onScan();
  }, [scannedCode]);

  React.useEffect(() => {
    if (!scannerResult) return;

    setTimeout(() => {
      setScannerResultsDatum(null);
      setScannerResult(null);
      setIsLoadingScan(false);
      setScannedCode(null);
    }, 1500);
  }, [scannerResult]);

  const load = async () => {
    try {
      const res = await Api.get("/scanner", { auth, oid, eid, uk });
      if (res.isError) throw "e";

      setEvent(new EventModel({ ...res.data.ev }));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!oid || !eid || !uk) return;

    load();
  }, [oid, eid, uk, auth]);

  if (isLoading)
    return (
      <LayoutContainer>
        <View style={{ paddingVertical: 30 }}>
          <ActivityIndicator
            size="small"
            color={theme["color-organizer-500"]}
          />
        </View>
      </LayoutContainer>
    );

  return (
    <ScrollContainer
      style={{
        paddingVertical: 20,
        paddingBottom: 30,
      }}
    >
      <TouchableOpacity
        style={[
          Style.button.round,
          Style.elevated,
          { zIndex: 100, padding: 0, position: "absolute", top: 10, left: 0 },
        ]}
        onPress={onClose}
      >
        <Feather name="x" size={20} color={theme["color-basic-700"]} />
      </TouchableOpacity>
      <Text
        style={[
          Style.text.dark,
          Style.text.semibold,
          Style.text.lg,
          {
            marginLeft: 50,
            marginRight: 10,
            textAlign: "right",
            paddingVertical: 2,
          },
        ]}
      >
        {ev?.name} at {ev?.venue?.name}
      </Text>
      <View
        style={[
          Style.containers.column,
          { width: "100%", alignItems: "flex-start", marginVertical: 30 },
        ]}
      >
        <CameraView
          onBarcodeScanned={handleScannerResponse}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
            isHighlightingEnabled: true,
          }}
          style={{ height: height * 0.65, width, left: -10 }}
        >
          {scannerResultsDatum != null && (
            <View
              style={[
                Style.badge,
                {
                  backgroundColor: isLoadingScan
                    ? theme["color-basic-700"]
                    : scannerResult == "VALID"
                      ? theme["color-success-500"]
                      : theme["color-primary-500"],
                  shadowColor: isLoadingScan
                    ? theme["color-basic-700"]
                    : scannerResult == "VALID"
                      ? theme["color-success-500"]
                      : theme["color-primary-500"],
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 50,
                },
              ]}
            >
              {isLoadingScan && (
                <ActivityIndicator
                  size={10}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                  color={theme["color-basic-100"]}
                />
              )}
              {!isLoadingScan && scannerResult && (
                <Text
                  style={[Style.text.basic, Style.text.lg, Style.text.semibold]}
                >
                  {i18n.t(scannerResult)}
                </Text>
              )}
            </View>
          )}
        </CameraView>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.text.xl,
            { marginTop: 20, marginBottom: 10, textAlign: "left" },
          ]}
        >
          {i18n.t("scannerTips")}
        </Text>
        <Text style={[Style.text.dark, Style.text.lg, Style.transparency.md]}>
          {i18n.t("scannerTipsDesc")}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.text.lg,
            { marginTop: 20, marginBottom: 10, textAlign: "left" },
          ]}
        >
          <Text style={[Style.text.organizer]}>{i18n.t("validTicket")}</Text>{" "}
          {i18n.t("validTicketDesc")}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.text.lg,
            {
              marginTop: 10,
              marginBottom: 10,
              textAlign: "left",
              alignSelf: "flex-start",
            },
          ]}
        >
          <Text style={[Style.text.danger]}>{i18n.t("ticketScanned")}</Text>{" "}
          {i18n.t("ticketScannedDesc")}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.text.lg,
            {
              marginTop: 10,
              marginBottom: 10,
              textAlign: "left",
              alignSelf: "flex-start",
            },
          ]}
        >
          <Text style={[Style.text.danger]}>{i18n.t("invalidTicket")}</Text>{" "}
          {i18n.t("invalidTicketDesc")}
        </Text>
      </View>
    </ScrollContainer>
  );
}
