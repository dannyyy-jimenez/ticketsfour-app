import React from "react";
import { useSession } from "../../../utils/ctx";
import { Dimensions, Text } from "react-native";
import LayoutContainer from "../../../utils/components/Layout";
import { theme } from "../../../utils/Styles";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import MapView, { Marker, Callout } from "react-native-maps";
import { useFocusEffect } from "expo-router";
import { Fontisto } from "@expo/vector-icons";
import EventComponent from "../../../utils/components/Event";

export default function JobsScreen() {
  const { session, signOut } = useSession();

  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const skeletonTasks = new Array(4).fill(0);
  const { width, height } = Dimensions.get("window");
  const [tasks, setTasks] = React.useState([]);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/retro/tasks", {
        auth: session,
        filter: "todo",
      });
      if (res.isError) throw "e";

      //setTasks(res.data.tasks);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();

      return () => {};
    }, []),
  );

  return (
    <LayoutContainer>
      <MapView
        showsUserLocation={true}
        style={{ left: -10, height: height, width }}
      >
        {tasks.map((_task, tidx) => (
          <Marker
            key={tidx}
            coordinate={{
              latitude: _task.address.lat,
              longitude: _task.address.lng,
            }}
          >
            <Fontisto
              size={32}
              color={
                _task.status == "A"
                  ? theme["color-primary-500"]
                  : theme["color-basic-700"]
              }
              name="map-marker"
            />

            <Callout tooltip={true} alphaHitTest>
              <EventComponent
                withinMap
                _event={_event}
                i18n={i18n}
                key={_event.id}
              />
            </Callout>
          </Marker>
        ))}
      </MapView>
    </LayoutContainer>
  );
}
