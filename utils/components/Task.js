import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import {
  Feather,
  Octicons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import Style, { theme } from "../../utils/Styles";
import { CurrencyFormatter, Numberfy } from "../Formatters";
import Task from "../../models/Task";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Linking from "expo-linking";
import { BlurView } from "expo-blur";

export default function TaskComponent({
  i18n,
  _task,
  reload,
  withinMap = false,
}) {
  const { showActionSheetWithOptions } = useActionSheet();
  const task = React.useMemo(() => {
    return new Task({ ..._task });
  }, [_task]);
  const { width, height } = Dimensions.get("window");

  const onPress = () => {
    const options = ["Email", "Call", "Schedule", "Assign", "Back"];
    const cancelButtonIndex = 4;
    const title = "Select Action";

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: [],
        title,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            Linking.openURL("mailto:" + task.customer.email);
            // Save
            break;

          case 1:
            Linking.openURL("tel:" + task.customer.phone);
            // Save
            break;

          case 2:
            alert("Schedule");
            // Save
            break;

          case 3:
            SheetManager.show("employee-assign-sheet", {
              payload: {
                task,
              },
            });
            // Save
            break;

          case cancelButtonIndex:
          // Canceled
        }
      },
    );
  };

  const onView = () => {
    SheetManager.show("task-view-sheet", {
      payload: {
        task,
      },
    });
  };

  const Container = ({ children }) =>
    withinMap ? (
      <BlurView
        intensity={100}
        style={[
          Style.cards.showoff,
          {
            width: width * 0.9,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            overflow: "hidden",
          },
        ]}
      >
        {children}
      </BlurView>
    ) : (
      <View
        style={[Style.cards.showoff, Style.elevated, { width: width * 0.9 }]}
      >
        {children}
      </View>
    );

  return (
    <Container>
      {task.isPreTask && (
        <View style={[Style.containers.row, { paddingBottom: 10 }]}>
          <MaterialCommunityIcons
            name="tape-measure"
            size={24}
            color={theme["color-primary-500"]}
          />
          <Text
            style={[Style.text.semibold, Style.text.lg, Style.text.primary]}
          >
            {" "}
            PRETASK{" "}
          </Text>
          <MaterialCommunityIcons
            name="tape-measure"
            size={24}
            color={theme["color-primary-500"]}
          />
        </View>
      )}
      <View style={[Style.containers.row]}>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[Style.text.bold, Style.text.dark, Style.text.xl]}
          >
            {task?.customer?.businessName}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              Style.text.semibold,
              Style.text.dark,
              Style.text.sm,
              { marginTop: 4 },
            ]}
          >
            {task.todo}
          </Text>
        </View>
        {task.status == "P" && (
          <View
            style={[
              Style.button.round,
              task.assignedComplete ? Style.background.primary : {},
              { height: 40, width: 40, borderRadius: 20 },
            ]}
          >
            <Text
              style={[
                Style.text.bold,
                task.assignedComplete ? Style.text.basic : Style.text.dark,
              ]}
            >
              {task.onDutyNum} / {task.duteedNo}
            </Text>
          </View>
        )}
        {task.status == "C" && (
          <View
            style={[
              Style.button.round,
              task.assignedComplete ? Style.background.primary : {},
              { height: 40, width: 40, borderRadius: 20 },
            ]}
          >
            <Octicons
              name="checklist"
              size={20}
              color={theme["color-basic-100"]}
            />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }} />
      <View
        style={[
          Style.containers.row,
          { marginTop: 45, marginBottom: 15, justifyContent: "space-evenly" },
        ]}
      >
        {task.requireCheckIn && (
          <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
            <MaterialCommunityIcons
              name="map-marker-check-outline"
              size={26}
              color={theme["color-primary-500"]}
            />
          </View>
        )}
        {task.requireProof && (
          <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
            <Feather
              name="camera"
              size={22}
              color={theme["color-primary-500"]}
            />
          </View>
        )}
        {task.requireApproval && (
          <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
            <Feather
              name="pen-tool"
              size={22}
              color={theme["color-primary-500"]}
            />
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View style={[Style.containers.row, { paddingHorizontal: 10 }]}>
          <MaterialCommunityIcons
            name="map-marker-path"
            size={26}
            color={theme["color-primary-500"]}
          />
          <Text
            style={[Style.text.semibold, Style.text.dark, { marginLeft: 4 }]}
          >
            {task.address?.city}, {task.address?.state}
          </Text>
        </View>
      </View>
      {task?.status == "P" && (
        <TouchableOpacity
          onPress={onPress}
          style={[Style.button.container, { height: 45 }]}
        >
          <Text style={[Style.button.text, Style.text.semibold]}>Actions</Text>
        </TouchableOpacity>
      )}
      {task?.status == "C" && (
        <TouchableOpacity
          onPress={onView}
          style={[Style.button.container, { height: 45 }]}
        >
          <Text style={[Style.button.text, Style.text.semibold]}>View</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}
