import React from "react";
import { Slot } from "expo-router";
import { SessionProvider, TeamProvider } from "../utils/ctx";
import { StatusBar } from "react-native";
import "../utils/Sheets";
import { SheetProvider } from "react-native-actions-sheet";
import { HoldMenuProvider } from "react-native-hold-menu";
import { LocalizationProvider } from "../locales/provider.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as SplashScreen from "expo-splash-screen";

export default function Root() {
  return (
    <>
      <SessionProvider>
        <StatusBar barStyle="dark-content" />
        <LocalizationProvider>
          <ActionSheetProvider>
            <HoldMenuProvider
              iconComponent={MaterialCommunityIcons}
              theme="light"
            >
              <SheetProvider>
                <Slot />
              </SheetProvider>
            </HoldMenuProvider>
          </ActionSheetProvider>
        </LocalizationProvider>
      </SessionProvider>
    </>
  );
}
