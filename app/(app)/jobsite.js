import React from "react";
import { useSession } from "../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import LayoutContainer from "../../utils/components/Layout";
import Style, { theme } from "../../utils/Styles";
import { Feather, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalization } from "../../locales/provider";
import * as Linking from "expo-linking";
import Api from "../../utils/Api";
import Task from "../../models/Task";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Commasize } from "../../utils/Formatters";
import * as ImagePicker from "expo-image-picker";
import Signature from "react-native-signature-canvas";
import { useFocusEffect } from "expo-router";

export default function JobScreen() {
  // const scheme = Platform.select({
  //   ios: "maps://0,0?q=",
  //   android: "geo:0,0?q=",
  // });
  // const latLng = `${lat},${lng}`;
  // const label = "Custom Label";
  // const url = Platform.select({
  //   ios: `${scheme}${label}@${latLng}`,
  //   android: `${scheme}${latLng}(${label})`,
  // });
  const style = `
      body {
        margin-top: 10px;
      }
      .m-signature-pad--footer {display: none; margin: 0px;}
      .m-signature-pad {padding: 4px; border: 2px solid ${theme["color-primary-500"]}; border-radius: 10px; height: 400px; box-shadow: none;}
      .m-signature-pad--body {border: none; height: 400px}
      .m-signature-pad--body canvas {border: none; height: 390px; box-shadow: none}`;

  const { session, signOut } = useSession();

  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const skeletonTasks = new Array(4).fill(0);
  const { width, height } = Dimensions.get("window");
  const [task, setTask] = React.useState(null);
  const [introduced, setIntroduced] = React.useState(false);
  const [location, setLocation] = React.useState(null);

  const [checkedIn, setCheckedIn] = React.useState(false);
  const [distanceFromCheckIn, canCheckIn, checkInCoors] = React.useMemo(() => {
    if (!task) return [99999, false, []];
    if (!task.requireCheckIn) return [99999, false, []];

    let coors = [location?.coords?.longitude, location?.coords?.latitude];
    let distance =
      haversine([task.address?.lng, task.address?.lat], coors) / 1609.34;

    let canCheckIn = distance < 0.4;

    return [Commasize(distance.toFixed(2)), canCheckIn, coors];
  }, [location, task]);

  const [selectedProofs, setSelectedProofs] = React.useState([]);
  const [proofTurnedIn, setProofTurnedIn] = React.useState(false);
  const [taskNotes, setTaskNotes] = React.useState("");
  const canContinueProof = React.useMemo(() => {
    if (task?.requireProof) {
      return taskNotes != "" && selectedProofs.length > 0;
    }

    return taskNotes != "";
  }, [taskNotes, selectedProofs, task?.requireProof]);

  const [approved, setApproved] = React.useState(false);
  const approvalRef = React.useRef(null);

  const steps = [
    {
      title: 'Clear Glass Window 1/4"',
      description: "Hellooooooo",
    },
    {
      title: "Installation",
      description: "Hellooooooo",
    },
    {
      title: "Clean Up",
      description: "Hellooooooo",
    },
  ];

  const load = async () => {
    setIsLoading(true);

    setApproved(false);
    setSelectedProofs([]);
    setCheckedIn(false);
    setIntroduced(false);
    setTask(null);

    try {
      let res = await Api.get("/retro/tasks/assigned", {
        auth: session,
      });
      if (res.isError) throw "e";

      if (!res.data.task) {
        setIsLoading(false);
        return;
      }

      setTask(new Task({ ...res.data.task }));
      setCheckedIn(res.data.task.checkedIn);
      setProofTurnedIn(res.data.task.proofTurnedIn);
      setApproved(res.data.task.approved);
      setSelectedProofs(res.data.task.selectedProofs);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onBegin = async () => {
    setIsLoading(true);

    try {
      let res = await Api.post("/retro/tasks/begin", {
        auth: session,
        taskId: task.id,
      });
      console.log(res);
      if (res.isError) throw "e";

      setIntroduced(true);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onCheckIn = async () => {
    setIsLoading(true);

    try {
      let res = await Api.post("/retro/tasks/checkin", {
        auth: session,
        taskId: task.id,
        coor: checkInCoors,
        distanceFromCheckIn,
      });
      if (res.isError) throw "e";

      setCheckedIn(true);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onSubmitProof = async () => {
    setIsLoading(true);

    try {
      let res = await Api.post("/retro/tasks/proof", {
        auth: session,
        taskId: task.id,
        selectedProofs: checkInCoors,
        note: taskNotes,
      });
      if (res.isError) throw "e";

      setProofTurnedIn(true);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      base64: true,
      orderedSelection: true,
    });

    if (!result.canceled) {
      let _proofs = [];
      _proofs = result.assets;
      setSelectedProofs(_proofs);
    }
  };

  const onSubmitApproval = async (_approval) => {
    setIsLoading(true);

    try {
      let res = await Api.post("/retro/tasks/approval", {
        auth: session,
        taskId: task.id,
        approval: _approval,
      });
      if (res.isError) throw "e";

      setApproved(true);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onComplete = async (_approval) => {
    setIsLoading(true);

    try {
      let res = await Api.post("/retro/tasks/complete", {
        auth: session,
        taskId: task.id,
      });
      if (res.isError) throw "e";

      load();
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

  React.useEffect(() => {
    if (!session) return;

    load();
  }, [session]);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    let sub = Location.watchPositionAsync({}, (loc) => {
      setLocation(loc);
    });

    // return () => {
    //   sub?.remove();
    // };
  }, []);

  if (isLoading) {
    return (
      <LayoutContainer>
        <ActivityIndicator size="small" color={theme["color-primary-500"]} />
      </LayoutContainer>
    );
  }

  if (!task)
    return (
      <LayoutContainer>
        <View style={[Style.containers.row]}>
          <Text
            style={[
              Style.text.dark,
              Style.text.semibold,
              Style.text.lg,
              Style.transparency.lg,
            ]}
          >
            No task assigned
          </Text>
        </View>
      </LayoutContainer>
    );

  if (!introduced)
    return (
      <LayoutContainer>
        <View>
          <View
            style={[
              Style.containers.column,
              { height: height * 0.7, marginTop: 10, marginBottom: 20 },
            ]}
          >
            <View
              style={[
                Style.containers.row,
                { width: width * 0.5, justifyContent: "space-evenly" },
              ]}
            >
              <TouchableOpacity
                onPress={() => Linking.openURL("tel:" + task?.customer?.phone)}
                style={[
                  Style.button.round,
                  { width: 50, height: 50, borderRadius: 25 },
                ]}
              >
                <Feather
                  name="phone-call"
                  size={24}
                  color={theme["color-primary-500"]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("mailto:" + task?.customer?.email)
                }
                style={[
                  Style.button.round,
                  { width: 50, height: 50, borderRadius: 25 },
                ]}
              >
                <Feather
                  name="mail"
                  size={24}
                  color={theme["color-primary-500"]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  Style.button.round,
                  { width: 50, height: 50, borderRadius: 25 },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={24}
                  color={theme["color-primary-500"]}
                />
              </TouchableOpacity>
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

            <Text
              style={[
                Style.text.lg,
                Style.text.semibold,
                Style.text.dark,
                { textAlign: "center", marginVertical: 20, padding: 10 },
              ]}
            >
              {task.todo}
            </Text>

            {task.todos.map((step, sidx) => (
              <View
                style={[
                  Style.containers.row,
                  { paddingHorizontal: 20, marginVertical: 15 },
                ]}
                key={"it-" + sidx}
              >
                <Feather
                  name="square"
                  size={24}
                  color={theme["color-basic-700"]}
                />
                <View
                  style={[
                    Style.containers.column,
                    { flex: 1, alignItems: "flex-start", marginHorizontal: 5 },
                  ]}
                >
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.lg,
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              </View>
            ))}

            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={onBegin}
              style={[Style.button.container]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LayoutContainer>
    );

  if (approved)
    return (
      <LayoutContainer>
        <View>
          <View
            style={[
              Style.containers.column,
              { height: height * 0.7, marginTop: 10, marginBottom: 20 },
            ]}
          >
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
                  padding: 10,
                },
              ]}
            >
              <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
                Todo
              </Text>
              <Text
                style={[Style.text.lg, Style.text.semibold, Style.text.dark]}
              >
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
                  padding: 10,
                },
              ]}
            >
              <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
                Checked In
              </Text>
              <Text
                style={[Style.text.lg, Style.text.semibold, Style.text.dark]}
              >
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
                  padding: 10,
                },
              ]}
            >
              <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
                Selected Proofs
              </Text>
              {task.requireProof && (
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
              )}
              {!task.requireProof && (
                <View style={[Style.containers.row, { marginVertical: 8 }]}>
                  <Text
                    style={[
                      Style.button.text,
                      Style.text.dark,
                      Style.text.semibold,
                      {
                        textAlign: "left",
                      },
                    ]}
                  >
                    Proof not required
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
                  padding: 10,
                },
              ]}
            >
              <Text style={[Style.text.sm, Style.text.bold, Style.text.dark]}>
                Approval
              </Text>
              <Text
                style={[Style.text.lg, Style.text.semibold, Style.text.dark]}
              >
                Encrypted Signature
              </Text>
            </View>

            {task.todos.map((step, sidx) => (
              <View
                style={[
                  Style.containers.row,
                  { paddingHorizontal: 20, marginVertical: 15 },
                ]}
                key={"it-" + sidx}
              >
                <Feather
                  name="square"
                  size={24}
                  color={theme["color-basic-700"]}
                />
                <View
                  style={[
                    Style.containers.column,
                    { flex: 1, alignItems: "flex-start", marginHorizontal: 5 },
                  ]}
                >
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.lg,
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              </View>
            ))}

            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={onComplete}
              style={[Style.button.container]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Complete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LayoutContainer>
    );

  return (
    <LayoutContainer>
      {task.requireCheckIn && !checkedIn && (
        <View>
          <View
            style={[
              Style.containers.column,
              { height: height - 220, marginTop: 10, marginBottom: 20 },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={36}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.xxxl,
                Style.text.bold,
                Style.text.dark,
                { textAlign: "center", marginTop: 20 },
              ]}
            >
              Check In Required
            </Text>
            <Text
              style={[
                Style.text.semibold,
                Style.text.dark,
                Style.text.xl,
                { textAlign: "center", padding: 10 },
              ]}
            >
              {task.address?.address}
            </Text>
            <View style={{ flex: 1 }} />
            {!canCheckIn && (
              <View style={[Style.containers.row, { paddingVertical: 20 }]}>
                <Text
                  style={[
                    Style.text.danger,
                    Style.text.semibold,
                    Style.text.lg,
                  ]}
                >
                  Too far from location to Check-In
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={onCheckIn}
              disabled={!canCheckIn}
              style={[
                Style.button.container,
                canCheckIn ? {} : Style.button.disabled,
              ]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Check In {distanceFromCheckIn} mi.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {task.requireProof && !proofTurnedIn && (
        <View>
          <View
            style={[
              Style.containers.column,
              { height: height - 220, marginTop: 10, marginBottom: 20 },
            ]}
          >
            <MaterialCommunityIcons
              name="camera-marker-outline"
              size={36}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.xxxl,
                Style.text.bold,
                Style.text.dark,
                { textAlign: "center", marginTop: 20 },
              ]}
            >
              Task Proof Required
            </Text>
            <Text
              style={[
                Style.text.semibold,
                Style.text.dark,
                Style.text.xl,
                { textAlign: "center", padding: 10 },
              ]}
            >
              {task.todo}
            </Text>
            <View
              style={[
                Style.input.multiline,
                {
                  height: 200,
                  width: width - 20,
                  marginTop: 20,
                },
              ]}
            >
              <TextInput
                multiline={true}
                numberOfLines={10}
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("taskNotes")}
                inputMode="text"
                keyboardType="default"
                value={taskNotes}
                onChangeText={(val) => setTaskNotes(val)}
              />
            </View>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                Style.button.container,
                { marginTop: 20, width: width * 0.95 },
              ]}
            >
              <Feather
                style={[Style.button.prefix]}
                size={22}
                name="image"
                color={theme["color-basic-100"]}
              />
              <Text
                style={[
                  Style.button.text,
                  Style.text.semibold,
                  { flexShrink: 0, flex: 0 },
                ]}
              >
                Select Proof
              </Text>
            </TouchableOpacity>
            <View style={[Style.containers.row, { marginVertical: 8 }]}>
              {selectedProofs.map((proof, pidx) => (
                <View
                  key={"proof-" + pidx}
                  style={[
                    Style.button.round,
                    Style.background.primaryLight,
                    { width: 150, marginHorizontal: 5 },
                  ]}
                >
                  <Text style={[Style.button.text, Style.text.semibold]}>
                    {proof.fileName}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={onSubmitProof}
              disabled={!canContinueProof}
              style={[
                Style.button.container,
                canContinueProof ? {} : Style.button.disabled,
              ]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {task.requireApproval && !approved && (
        <View>
          <View
            style={[
              Style.containers.column,
              { height: height - 220, marginTop: 10, marginBottom: 20 },
            ]}
          >
            <MaterialCommunityIcons
              name="draw-pen"
              size={36}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.xxxl,
                Style.text.bold,
                Style.text.dark,
                { textAlign: "center", marginTop: 20 },
              ]}
            >
              Task Approval Required
            </Text>
            <Text
              numberOfLines={2}
              style={[
                Style.text.semibold,
                Style.text.dark,
                Style.text.lg,
                { textAlign: "center", padding: 10 },
              ]}
            >
              {task.todo}
            </Text>
            <Signature
              ref={approvalRef}
              webStyle={style}
              // handle when you click save button
              onOK={onSubmitApproval}
              backgroundColor="white"
              autoClear={true}
              imageType={"image/svg+xml"}
            />
            <TouchableOpacity
              onPress={approvalRef.current?.readSignature}
              style={[Style.button.container]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LayoutContainer>
  );
}
