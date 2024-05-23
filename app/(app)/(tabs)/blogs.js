import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import {
  FontAwesome6,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import Api from "../../../utils/Api";
import SkeletonLoader from "expo-skeleton-loader";
import { Categories, Blog } from "../../../models/Blog";
import BlogComponent from "../../../utils/components/Blog";
import { SheetManager } from "react-native-actions-sheet";

export default function BlogScreen() {
  const { session, signOut } = useSession();

  const { i18n, locale } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(true);
  const skeletonTasks = new Array(4).fill(0);
  const { width, height } = Dimensions.get("window");

  const [categories, setCategories] = React.useState(Object.keys(Categories));
  const [activeCategories, setActiveCategories] = React.useState(categories);
  const [blogs, setBlogs] = React.useState([]);

  const toggleCategory = (category) => {
    let c = [...activeCategories];
    if (c.includes(category)) {
      c.splice(c.indexOf(category), 1);
    } else {
      c.push(category);
    }

    setActiveCategories(c);
  };

  const load = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/blogs", { auth: session });

      if (res.isError) throw "e";

      setBlogs(res.data.blogs.map((b) => new Blog({ ...b })));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
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
          tintColor={theme["color-primary-500"]}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View>
        <View
          style={[
            Style.containers.row,
            {
              width: "100%",
              marginTop: 15,
              marginBottom: 20,
            },
          ]}
        >
          {locale == "en" && (
            <Text
              style={[
                Style.text.xxl,
                Style.text.bold,
                Style.text.dark,
                { marginRight: 6 },
              ]}
            >
              Stay in the{" "}
              <Text
                style={[Style.text.xxl, Style.text.bold, Style.text.primary]}
              >
                loop
              </Text>{" "}
              with our blogs!
            </Text>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() =>
              SheetManager.show("helper-sheet", {
                payload: { text: "stayInLoopSub" },
              })
            }
            style={{ padding: 10 }}
          >
            <Feather name="info" size={20} color={theme["color-basic-700"]} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            Style.containers.row,
            { justifyContent: "space-evenly", marginTop: 10, marginBottom: 20 },
          ]}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL("https://facebook.com/ticketsfour")}
          >
            <Feather
              name="facebook"
              color={theme["color-primary-500"]}
              size={26}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.instagram.com/ticketsfour")
            }
          >
            <MaterialCommunityIcons
              name="instagram"
              color={theme["color-primary-500"]}
              size={28}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.x.com/ticketsfourapp")}
          >
            <FontAwesome6
              name="x-twitter"
              color={theme["color-primary-500"]}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.tiktok.com/@ticketsfour")
            }
          >
            <FontAwesome6
              name="tiktok"
              color={theme["color-primary-500"]}
              size={22}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.linkedin.com/company/ticketsfour")
            }
          >
            <FontAwesome6
              name="linkedin-in"
              color={theme["color-primary-500"]}
              size={24}
            />
          </TouchableOpacity>
        </View>
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
        {blogs.map((blog) => (
          <BlogComponent key={blog?.identifier} blog={blog} />
        ))}
      </View>
    </ScrollContainer>
  );
}
