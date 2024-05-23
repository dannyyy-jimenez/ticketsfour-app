import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Style, { theme } from "../Styles";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

const VIRTUAL_AXIS = {
  X: 1920,
  Y: 1080,
  R: 16 / 9,
};

function SeatMap({
  name,
  nodes = [],
  tiers = [],
  selected = [],
  onFocus = null,
  onBlur = null,
  variant = null,
  mode = "view",
  panEnabled = false,
}) {
  const container = React.useRef(null);
  const { width, height } = Dimensions.get("window");
  const [clientWidth, setClientWidth] = React.useState(VIRTUAL_AXIS.X);
  const [rX, setRX] = React.useState(1);
  const [rY, setRY] = React.useState(1);
  const [loaded, setLoaded] = React.useState(false);
  const getVariant = React.useMemo(() => {
    if (variant) return variant;

    if (mode === "view") return "shadow";

    return "flat";
  }, [variant, mode]);

  const isPressable = (node) => {
    if (mode === "view") {
      return onFocus !== null;
    }

    if (clientWidth < 500) return false;

    // if (selected.includes(node.identifier)) return false;

    return onFocus !== null && node?.available > 0;
  };

  const getBackground = (node) => {
    if (node.isDecorative) {
      if (node.name === "WHITE_BLOCK") return "#fff";

      return "#333";
    }
    if (mode === "view") {
      return theme["color-basic-500"];
    }

    if (selected.includes(node.identifier)) return theme["color-primary-500"];

    return node.available > 0 ? theme["color-primary-200"] : "rgba(0,0,0,0.2)";
  };

  React.useEffect(() => {
    if (!container.current) return;

    let localGrid = {
      width: width * 2,
      height: width * (9 / 16) * 2,
    };

    setClientWidth(localGrid.width);
    let rX = localGrid.width / VIRTUAL_AXIS.X;
    let rY = localGrid.height / VIRTUAL_AXIS.Y;

    setRX(rX);
    setRY(rY);
  }, [loaded, width]);

  return (
    <View
      style={{
        flex: 1,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ReactNativeZoomableView
        zoomEnabled={panEnabled}
        panEnabled={panEnabled}
        maxZoom={30}
        initialZoom={0.5}
        style={{
          height: width * (9 / 16),
          width: width,
          alignSelf: "center",
        }}
        contentWidth={width}
        contentHeight={width * (9 / 16)}
        bindToBorders={false}
        panBoundaryPadding={5}
        onTransform={() => setLoaded(true)}
        ref={container}
      >
        {nodes.map((node, nidx) => (
          <TouchableOpacity
            disabled={!isPressable(node)}
            onPress={() => onFocus(node)}
            key={"n-" + nidx}
            onBlur={onBlur}
            style={[
              Style.containers.row,
              {
                position: "absolute",
                overflow: "visible",
                transformOrigin: "top left",
                transform: [{ rotate: `${node.tilt}deg` }],
                left: node.lng * rX,
                top: node.lat * rY,
                width: node.w * rX,
                height: node.h * rY,
                borderTopLeftRadius: node.borders[0] * rX,
                borderTopRightRadius: node.borders[1] * rX,
                borderBottomRightRadius: node.borders[2] * rX,
                borderBottomLeftRadius: node.borders[3] * rX,
                backgroundColor: getBackground(node),
              },
            ]}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                overflow: "visible",
              }}
            >
              {(mode === "view" || node.isDecorative) && (
                <Text
                  adjustsFontSizeToFit
                  allowFontScaling
                  style={[
                    Style.text.semibold,
                    {
                      fontSize: Math.max(node.w * 0.02, 4),
                      textAlign: "center",
                      color: node.isDecorative
                        ? theme["color-basic-100"]
                        : theme["color-basic-700"],
                    },
                  ]}
                >
                  {node.getTitle()}
                </Text>
              )}
              {mode === "ticketize" && !node.isDecorative && (
                <Text
                  adjustsFontSizeToFit
                  allowFontScaling
                  numberOfLines={1}
                  style={[
                    Style.text.semibold,
                    Style.text.dark,
                    {
                      fontSize: Math.max(node.w * 0.2, 0.3),
                      textAlign: "center",
                    },
                  ]}
                >
                  {node.name}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ReactNativeZoomableView>
    </View>
  );
}

export default SeatMap;
