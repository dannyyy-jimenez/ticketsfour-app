import Mapbox, {
  Camera,
  HeatmapLayer,
  MapView,
  ShapeSource,
} from "@rnmapbox/maps";
import React from "react";
import { View } from "react-native";
import Style, { theme } from "../Styles";

Mapbox.setAccessToken(
  "pk.eyJ1IjoidGlja2V0c2ZvdXIiLCJhIjoiY2x5ZmdzcWswMGNnazJscHdoZXkzNmhybSJ9.994TtZPNIIl19golk1ttdA",
);

export default function MapComponent(props) {
  const center = props.center || [-96.87301, 32.81991];
  const [markers, setMarkers] = React.useState(props.markers || []);
  const heatmap = React.useMemo(() => {
    return props.heatmap;
  }, [props.heatmap]);
  const zoom = props.zoom || 4;
  const isOrganizer = props.isOrganizer || false;

  React.useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  return (
    <MapView
      styleURL="mapbox://styles/ticketsfour/clxyh2lv6003101qr01us0lwm"
      zoomEnabled={true}
      style={{ width: "100%", height: "100%" }}
    >
      <Camera zoomLevel={zoom} centerCoordinate={center} />
      {heatmap != null && (
        <ShapeSource id="heatmap-datapoints" shape={heatmap}>
          <HeatmapLayer
            style={{
              heatmapRadius: 15,
              heatmapColor: [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(236,222,239,0)",
                0.2,
                isOrganizer
                  ? theme["color-organizer-200"]
                  : theme["color-primary-200"],
                0.4,
                isOrganizer
                  ? theme["color-organizer-300"]
                  : theme["color-primary-300"],
                0.6,
                isOrganizer
                  ? theme["color-organizer-500"]
                  : theme["color-primary-500"],
                0.8,
                isOrganizer
                  ? theme["color-organizer-800"]
                  : theme["color-primary-800"],
              ],
            }}
            sourceID="heatmap-datapoints"
            id="heatmap"
          />
        </ShapeSource>
      )}
    </MapView>
  );
}
