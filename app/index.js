import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useSession } from "../utils/ctx";

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const { session: auth, isLoading: isLoadingSession } = useSession();

  if (isLoadingSession) {
    return <></>;
  }

  if (auth) {
    return <Redirect href="/(app)/events" />;
  }

  return <Redirect href="/login" />;
}
