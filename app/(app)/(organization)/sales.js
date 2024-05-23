import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import {
  Feather,
  Octicons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalization } from "../../../locales/provider";
import { SheetManager } from "react-native-actions-sheet";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";

export default function SalesScreen() {
  const { session, signOut, isGuest } = useSession();
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const { width, height } = Dimensions.get("window");
  const skeletonTasks = new Array(4).fill(0);

  const load = async () => {
    setIsLoading(true);

    // try {
    //   const res = await Api.get("/blogs", { auth: session });

    //   if (res.isError) throw "e";

    //   setBlogs(res.data.blogs.map((b) => new Blog({ ...b })));
    //   setIsLoading(false);
    // } catch (e) {
    //   console.log(e);
    //   setIsLoading(false);
    // }
  };

  const onRefresh = () => {
    load();
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ScrollContainer
      refreshControl={
        <RefreshControl
          tintColor={theme["color-organizer-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View>
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
    </ScrollContainer>
  );
}
