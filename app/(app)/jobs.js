import React from "react";
import { useSession } from "../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ScrollContainer } from "../../utils/components/Layout";
import Style, { theme } from "../../utils/Styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalization } from "../../locales/provider";
import Api from "../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import TaskComponent from "../../utils/components/Task";

export default function JobsScreen() {
  const { session, signOut } = useSession();

  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const skeletonTasks = new Array(4).fill(0);
  const { width, height } = Dimensions.get("window");
  const [tasks, setTasks] = React.useState([]);
  const [filter, setFilter] = React.useState("pending");

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/retro/tasks", { auth: session, filter });
      if (res.isError) throw "e";

      setTasks(res.data.tasks);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setIsLoading(true);
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, [filter]);

  return (
    <ScrollContainer
      refreshControl={
        <RefreshControl
          tintColor={theme["color-primary-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View>
        <View
          style={[Style.containers.row, { marginTop: 10, marginBottom: 20 }]}
        >
          {filter == "pending" && (
            <>
              <Text
                style={[
                  Style.text.xxxl,
                  Style.text.bold,
                  Style.text.dark,
                  { flex: 1 },
                ]}
              >
                Pending Jobs
              </Text>
              <TouchableOpacity
                onPress={() => setFilter("completed")}
                style={[Style.button.round]}
              >
                <MaterialIcons
                  name="pending-actions"
                  size={20}
                  color={theme["color-primary-500"]}
                />
              </TouchableOpacity>
            </>
          )}
          {filter == "completed" && (
            <>
              <Text
                style={[
                  Style.text.xxxl,
                  Style.text.bold,
                  Style.text.dark,
                  { flex: 1 },
                ]}
              >
                Completed Jobs
              </Text>
              <TouchableOpacity
                onPress={() => setFilter("pending")}
                style={[Style.button.round]}
              >
                <MaterialIcons
                  name="pending-actions"
                  size={20}
                  color={theme["color-primary-500"]}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
        {isLoading &&
          skeletonTasks.map((_d, lidx) => (
            <SkeletonLoader
              key={"loading-" + lidx}
              highlightColor="#DDD"
              boneColor="#EEE"
            >
              <SkeletonLoader.Container
                style={[
                  Style.cards.creativeText,
                  {
                    backgroundColor: "transparent",
                    width: width * 0.9,
                    margin: 10,
                  },
                ]}
              >
                <SkeletonLoader.Item
                  style={[
                    Style.cards.creativeText,
                    {
                      backgroundColor: "transparent",
                      width: width * 0.9,
                      margin: 10,
                    },
                  ]}
                />
              </SkeletonLoader.Container>
            </SkeletonLoader>
          ))}
      </View>
      {tasks.map((task, tidx) => (
        <TaskComponent key={task.id} i18n={i18n} _task={task} />
      ))}
    </ScrollContainer>
  );
}
