import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { FormatPhoneNumber } from "../Formatters";
import Api from "../Api";
import Task from "../../models/Task";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function ViewTaskSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const skeletonItems = new Array(10).fill(0);
  const [task, setTask] = React.useState(payload?.task);

  const [isLoading, setIsLoading] = React.useState(false);

  const load = async () => {
    setIsLoading(true);

    try {
      let res = await Api.get("/retro/task", {
        auth: session,
        taskId: task.id,
      });
      if (res.isError) throw "e";

      setTask(new Task({ ...res.data.task }));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ActionSheet
      id={sheetId}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-primary-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View>
        <View style={[{ marginTop: 10, marginBottom: 20 }]}>
          <View
            style={[
              Style.containers.row,
              {
                width: width * 0.5,
                alignSelf: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Octicons
              name="checklist"
              size={24}
              color={theme["color-primary-500"]}
            />
          </View>

          <Text
            style={[
              Style.text.xxxl,
              Style.text.bold,
              Style.text.dark,
              { textAlign: "center", marginTop: 20 },
            ]}
          >
            {task.customer?.businessName}
          </Text>
          <Text
            style={[
              Style.text.semibold,
              Style.text.dark,
              { textAlign: "center", padding: 10 },
            ]}
          >
            {task.address?.address}
          </Text>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Todo
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              {task.todo}
            </Text>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Checked In
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              {task.checkInAt.format("MMMM Do YYYY, h:mm:ss a")}
            </Text>
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Selected Proofs
            </Text>
            {task.requireProof && (
              <>
                <View style={[Style.containers.row, { marginVertical: 8 }]}>
                  {task.proof.map((proof, pidx) => (
                    <View
                      key={"proof-" + pidx}
                      style={[
                        Style.button.round,
                        Style.background.primaryLight,
                        { width: 150, marginHorizontal: 5 },
                      ]}
                    >
                      <Text style={[Style.button.text, Style.text.semibold]}>
                        {proof.split("/").slice(-1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {!task.requireProof && (
              <View style={[Style.containers.row, { marginVertical: 8 }]}>
                <Text
                  style={[
                    Style.button.text,
                    Style.text.semibold,
                    Style.text.dark,
                    { textAlign: "left" },
                  ]}
                >
                  No proof selected
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Notes
            </Text>
            {task.requireProof && (
              <>
                <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
                  {task.note}
                </Text>
              </>
            )}
            {!task.requireProof && (
              <View style={[Style.containers.row, { marginVertical: 8 }]}>
                <Text
                  style={[
                    Style.button.text,
                    Style.text.semibold,
                    Style.text.dark,
                    { textAlign: "left" },
                  ]}
                >
                  No notes entered
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              Style.containers.column,
              {
                alignSelf: "flex-start",
                marginTop: 20,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
              Approval
            </Text>
            <Text style={[Style.text.lg, Style.text.semibold, Style.text.dark]}>
              Encrypted Signature
            </Text>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
}

export { ViewTaskSheet };
export default ViewTaskSheet;
