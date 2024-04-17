import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { FormatPhoneNumber } from "../Formatters";
import Api from "../Api";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function EmployeeCreateSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const skeletonItems = new Array(10).fill(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [accessCode, setAccessCode] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const canContinueCustomer = React.useMemo(() => {
    return (
      firstName != "" &&
      lastName != "" &&
      phoneNumber != "" &&
      email != "" &&
      accessCode != ""
    );
  }, [accessCode, firstName, lastName, phoneNumber, email]);

  const [canReceiveProduct, setCanReceiveProduct] = React.useState(false);
  const [canViewQuotes, setCanViewQuotes] = React.useState(false);
  const [canViewJobs, setCanViewJobs] = React.useState(false);
  const [canTakeJob, setCanTakeJob] = React.useState(false);

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      let res = await Api.post("/retro/management/employee/create", {
        accessCode,
        firstName,
        lastName,
        phone: phoneNumber,
        email,
        canReceiveProduct,
        canViewQuotes,
        canViewJobs,
        canTakeJob,
      });

      if (res.isError) throw "e";

      SheetManager.hide("employee-create-sheet");
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

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
      {activeStep == 0 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
          <Text style={[Style.text.dark, Style.text.xl, Style.text.semibold]}>
            Create an Employee
          </Text>
          <Text style={[Style.text.dark, Style.text.semibold, { padding: 15 }]}>
            Creating an employee is simple. Come up with the required employee
            information and allowed tasks. You also get to set their login to
            ensure having access to their account at all times.
          </Text>
          <TouchableOpacity
            onPress={() => setActiveStep(1)}
            style={[
              Style.button.container,
              { width: width * 0.9, marginTop: 40 },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              Continue 1/4
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {activeStep == 1 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
          <Text style={[Style.text.dark, Style.text.xl, Style.text.semibold]}>
            Personal
          </Text>
          <View
            style={[
              Style.containers.row,
              {
                width: width,
                justifyContent: "space-evenly",
                marginTop: 20,
              },
            ]}
          >
            <View
              style={[
                Style.input.container,
                {
                  width: width - 20,
                },
              ]}
            >
              <View style={[Style.input.prefix]}>
                <Ionicons
                  name="finger-print-outline"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("accessCode")}
                value={accessCode}
                onChangeText={(val) => setAccessCode(val)}
              />
            </View>
          </View>
          <View
            style={[
              Style.containers.row,
              {
                width: width,
                justifyContent: "space-evenly",
                marginTop: 20,
              },
            ]}
          >
            <View
              style={[
                Style.input.container,
                {
                  width: width * 0.5 - 15,
                },
              ]}
            >
              <View style={[Style.input.prefix]}>
                <Feather
                  name="user"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("firstName")}
                value={firstName}
                onChangeText={(val) => setFirstName(val)}
              />
            </View>
            <View
              style={[
                Style.input.container,
                {
                  width: width * 0.5 - 15,
                },
              ]}
            >
              <View style={[Style.input.prefix]}>
                <Feather
                  name="users"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("lastName")}
                value={lastName}
                onChangeText={(val) => setLastName(val)}
              />
            </View>
          </View>
          <View
            style={[
              Style.containers.row,
              {
                width: width,
                justifyContent: "space-evenly",
                marginVertical: 15,
              },
            ]}
          >
            <View
              style={[
                Style.input.container,
                {
                  width: width * 0.5 - 15,
                },
              ]}
            >
              <View style={[Style.input.prefix]}>
                <Feather
                  name="phone"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                autoComplete="tel"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("phoneNumber")}
                inputMode="tel"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(val) => setPhoneNumber(val)}
                onBlur={() => setPhoneNumber(FormatPhoneNumber(phoneNumber))}
              />
            </View>
            <View
              style={[
                Style.input.container,
                {
                  width: width * 0.5 - 15,
                },
              ]}
            >
              <View style={[Style.input.prefix]}>
                <Feather
                  name="mail"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("email")}
                inputMode="email"
                keyboardType="email-address"
                value={email}
                onChangeText={(val) => setEmail(val)}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setActiveStep(2)}
            disabled={!canContinueCustomer}
            style={[
              Style.button.container,
              canContinueCustomer ? {} : Style.button.disabled,
              { width: width * 0.9, marginTop: 40 },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              Continue 2/4
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {activeStep == 2 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
          <Text style={[Style.text.dark, Style.text.xl, Style.text.semibold]}>
            Permissions
          </Text>
          <View
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <MaterialCommunityIcons
              name="download-box-outline"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                Can receive product
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={
                canReceiveProduct ? theme["color-primary-400"] : "#f4f3f4"
              }
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setCanReceiveProduct(!canReceiveProduct)}
              value={canReceiveProduct}
            />
          </View>
          <View
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <MaterialIcons
              name="request-quote"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                Can view quotes
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={
                canViewQuotes ? theme["color-primary-400"] : "#f4f3f4"
              }
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setCanViewQuotes(!canViewQuotes)}
              value={canViewQuotes}
            />
          </View>
          <View
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <MaterialCommunityIcons
              name="hammer-screwdriver"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                Can view and assign jobs
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={canViewJobs ? theme["color-primary-400"] : "#f4f3f4"}
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setCanViewJobs(!canViewJobs)}
              value={canViewJobs}
            />
          </View>
          <View
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <FontAwesome6
              name="helmet-safety"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                Can take a job
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={canTakeJob ? theme["color-primary-400"] : "#f4f3f4"}
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setCanTakeJob(!canTakeJob)}
              value={canTakeJob}
            />
          </View>
          {!isLoading && (
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isLoading}
              style={[
                Style.button.container,
                !isLoading ? {} : Style.button.disabled,
                { width: width * 0.9, marginTop: 40 },
              ]}
            >
              <Text style={[Style.button.text, Style.text.semibold]}>
                Create
              </Text>
            </TouchableOpacity>
          )}
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme["color-primary-500"]}
            />
          )}
        </View>
      )}
    </ActionSheet>
  );
}

function EmployeeAssignSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const skeletonItems = new Array(10).fill(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const task = payload?.task;
  const [onDeck, setOnDeck] = React.useState([]);
  const [assignedIds, setAssignedIds] = React.useState([]);

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      let res = await Api.post("/retro/tasks/assign", {
        auth: session,
        assignedIds: assignedIds,
        taskId: task.id,
      });

      if (res.isError) throw "e";

      SheetManager.hide("employee-assign-sheet", {});
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const load = async () => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      let res = await Api.get("/retro/employees/technicians", {
        auth: session,
      });

      if (res.isError) throw "e";

      setAssignedIds(
        res.data.employees.filter((e) => e.assigned).map((e) => e.id),
      );
      setOnDeck(res.data.employees);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onAssign = (id) => {
    let _assignedIds = [...assignedIds];
    if (_assignedIds.includes(id)) {
      _assignedIds.splice(_assignedIds.indexOf(id), 1);
    } else {
      _assignedIds.push(id);
    }

    setAssignedIds(_assignedIds);
  };

  React.useEffect(() => {
    if (!session) return;

    load();
  }, [session]);

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
      {activeStep == 0 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
          <Text style={[Style.text.dark, Style.text.xl, Style.text.semibold]}>
            Assign an Employee
          </Text>
          <Text style={[Style.text.dark, Style.text.semibold, { padding: 15 }]}>
            Assign one or multiple employees to this task, if required. You can
            queue this job to be now or for later, either way your technician
            will be able to switch between jobs in their queue.
          </Text>
          <TouchableOpacity
            onPress={() => setActiveStep(1)}
            style={[
              Style.button.container,
              { width: width * 0.9, marginTop: 40 },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              Continue 1/2
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {activeStep == 1 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
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
          <View style={[Style.containers.row, { marginBottom: 20 }]}>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={2}
                style={[
                  Style.text.bold,
                  Style.text.dark,
                  Style.text.xl,
                  { textAlign: "center" },
                ]}
              >
                {task?.customer?.businessName}
              </Text>
              <Text
                style={[
                  Style.text.semibold,
                  Style.text.dark,
                  Style.text.sm,
                  { marginTop: 4, textAlign: "center" },
                ]}
              >
                {task.todo}
              </Text>
            </View>
          </View>

          {onDeck.map((technician) => (
            <View
              key={technician.id}
              style={{
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <MaterialCommunityIcons
                name="account-wrench"
                size={24}
                color={theme["color-basic-700"]}
              />
              <View style={{ flex: 1, marginHorizontal: 20 }}>
                <Text
                  style={[Style.text.md, Style.text.semibold, Style.text.dark]}
                >
                  {technician.fname} {technician.lname}
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: theme["color-basic-200"],
                  true: theme["color-primary-200"],
                }}
                thumbColor={
                  assignedIds.includes(technician.id)
                    ? theme["color-primary-400"]
                    : "#f4f3f4"
                }
                ios_backgroundColor={theme["color-basic-200"]}
                onValueChange={() => onAssign(technician.id)}
                value={assignedIds.includes(technician.id)}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={onSubmit}
            style={[
              Style.button.container,
              { width: width * 0.9, marginTop: 40 },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>Assign</Text>
          </TouchableOpacity>
        </View>
      )}
    </ActionSheet>
  );
}

export { EmployeeCreateSheet, EmployeeAssignSheet };
export default EmployeeCreateSheet;
