import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { FormatPhoneNumber } from "../Formatters";
import Api from "../Api";

const blurhash = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function PreTaskCreateSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const skeletonItems = new Array(10).fill(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [businessName, setBusinessName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const canContinueCustomer = React.useMemo(() => {
    return (
      firstName != "" && lastName != "" && phoneNumber != "" && email != ""
    );
  }, [businessName, firstName, lastName, phoneNumber, email]);

  const [addressLine1, setAddressLine1] = React.useState("");
  const [addressLine2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [zipcode, setZipcode] = React.useState("");

  const canContinueAddress = React.useMemo(() => {
    return addressLine1 != "" && city != "" && state != "" && zipcode != "";
  }, [addressLine1, city, state, zipcode]);

  const [todoNote, setTodoNote] = React.useState("");
  const [requireCheckIn, setRequireCheckIn] = React.useState(false);
  const [requireProof, setRequireProof] = React.useState(false);
  const [requireApproval, setRequireApproval] = React.useState(false);

  const canContinueTodo = React.useMemo(() => {
    return todoNote != "";
  }, [todoNote]);

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      let res = await Api.post("/retro/pretask/create", {
        businessName,
        firstName,
        lastName,
        phone: phoneNumber,
        email,
        addressLine1,
        addressLine2,
        city,
        state,
        zipcode,
        todoNote,
        requireProof,
        requireCheckIn,
        requireApproval,
      });

      if (res.isError) throw "e";

      SheetManager.hide("pretask-create-sheet");
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    Keyboard.dismiss();
  }, [requireProof, requireCheckIn, requireApproval]);

  return (
    <ActionSheet
      id={sheetId}
      keyboardHandlerEnabled={true}
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
            Create a Pre Task
          </Text>
          <Text style={[Style.text.dark, Style.text.semibold, { padding: 15 }]}>
            Creating a Pre-Task is simple. A few things will be required:
            Customer Information, Address, a quick Todo note, and a couple
            checkboxes stating your requirements.
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
            Customer
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
                  name="business-outline"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("businessName")}
                value={businessName}
                onChangeText={(val) => setBusinessName(val)}
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
            Address
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
                <Feather
                  name="map-pin"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                autoComplete="address-line1"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("addressLine1")}
                inputMode="text"
                keyboardType="default"
                value={addressLine1}
                onChangeText={(val) => setAddressLine1(val)}
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
                  name="map"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                autoComplete="address-line2"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("addressLine2")}
                inputMode="text"
                keyboardType="default"
                value={addressLine2}
                onChangeText={(val) => setAddressLine2(val)}
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
                <MaterialCommunityIcons
                  name="city-variant-outline"
                  color={theme["color-basic-700"]}
                  size={20}
                />
              </View>
              <TextInput
                autoComplete="postal-address-locality"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("city")}
                inputMode="text"
                keyboardType="default"
                value={city}
                onChangeText={(val) => setCity(val)}
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
                <MaterialCommunityIcons
                  name="map-marker-account-outline"
                  color={theme["color-basic-700"]}
                  size={22}
                />
              </View>
              <TextInput
                autoComplete="postal-address-region"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("state")}
                inputMode="text"
                keyboardType="default"
                value={state}
                onChangeText={(val) => setState(val)}
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
                <MaterialCommunityIcons
                  name="map-marker-radius-outline"
                  color={theme["color-basic-700"]}
                  size={22}
                />
              </View>
              <TextInput
                autoComplete="postal-address"
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("zipcode")}
                inputMode="text"
                keyboardType="default"
                value={zipcode}
                onChangeText={(val) => setZipcode(val)}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setActiveStep(3)}
            disabled={!canContinueAddress}
            style={[
              Style.button.container,
              canContinueAddress ? {} : Style.button.disabled,
              { width: width * 0.9, marginTop: 40 },
            ]}
          >
            <Text style={[Style.button.text, Style.text.semibold]}>
              Continue 3/4
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {activeStep == 3 && (
        <View style={[Style.containers.column, { marginTop: 10 }]}>
          <Text style={[Style.text.dark, Style.text.xl, Style.text.semibold]}>
            Todo
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
                Style.input.multiline,
                {
                  height: 200,
                  width: width - 20,
                },
              ]}
            >
              <TextInput
                multiline={true}
                numberOfLines={10}
                enterKeyHint="next"
                style={[Style.input.text]}
                placeholder={i18n.t("todoNotes")}
                inputMode="text"
                keyboardType="default"
                value={todoNote}
                onChangeText={(val) => setTodoNote(val)}
              />
            </View>
          </View>
          <View
            style={{
              paddingVertical: 15,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Feather
              name="map-pin"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                {i18n.t("requireCheckIn")}
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={
                requireCheckIn ? theme["color-primary-400"] : "#f4f3f4"
              }
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setRequireCheckIn(!requireCheckIn)}
              value={requireCheckIn}
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
            <Feather name="camera" size={20} color={theme["color-basic-700"]} />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                {i18n.t("requireProof")}
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={requireProof ? theme["color-primary-400"] : "#f4f3f4"}
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setRequireProof(!requireProof)}
              value={requireProof}
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
            <Feather
              name="pen-tool"
              size={20}
              color={theme["color-basic-700"]}
            />
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={[Style.text.md, Style.text.semibold, Style.text.dark]}
              >
                {i18n.t("requireApproval")}
              </Text>
            </View>
            <Switch
              trackColor={{
                false: theme["color-basic-200"],
                true: theme["color-primary-200"],
              }}
              thumbColor={
                requireApproval ? theme["color-primary-400"] : "#f4f3f4"
              }
              ios_backgroundColor={theme["color-basic-200"]}
              onValueChange={() => setRequireApproval(!requireApproval)}
              value={requireApproval}
            />
          </View>
          {!isLoading && (
            <TouchableOpacity
              onPress={onSubmit}
              disabled={!canContinueTodo}
              style={[
                Style.button.container,
                canContinueTodo ? {} : Style.button.disabled,
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

export { PreTaskCreateSheet };
export default PreTaskCreateSheet;
