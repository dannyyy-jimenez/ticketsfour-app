import React from "react";
import { useStorageState } from "./useStorageState";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { router } from "expo-router";

const AuthContext = React.createContext(null);

export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props) {
  const [isLoadingOrg, setIsLoadingOrg] = React.useState(true);
  const [[isLoadingAuth, session], setSession] = useStorageState("TCKTSFRSID");
  const [socket, setSocket] = React.useState(null);
  const [defaultOrganization, _setDefaultOrganization] = React.useState("-");
  const [organizerMode, _setOrganizerMode] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [organizations, setOrganizations] = React.useState([]);
  const [activeOrganization, setActiveOrganization] = React.useState("");

  const isGuest = React.useMemo(() => {
    return session == "GUEST";
  }, [session]);
  const auth = React.useMemo(() => {
    if (session == "GUEST") return null;

    return session;
  }, [session]);
  const url = Linking.useURL();

  React.useEffect(() => {
    console.log(url);

    if (!url || typeof url == "undefined" || isLoadingOrg || isLoadingAuth)
      return;

    let parsed = "";
    let params = {};

    try {
      if (url.startsWith("com.ticketsfour.app://")) {
        // Split the deep link by '://' to get the path
        const parts = url.split("://");
        // The last part of the split contains the path (after the '://')
        parsed = parts[1];
      }
      // Check if the deep link uses HTTP/HTTPS scheme
      else if (url.startsWith("http://") || url.startsWith("https://")) {
        // Use URL API to parse the deep link
        let parsedUrl = new URL(url);
        // Extract the pathname from the parsed URL
        const path = parsedUrl.pathname;
        // Remove leading slash if present
        params = parsedUrl.search;
        parsed = path.startsWith("/") ? path.substring(1) : path;
      }
    } catch (e) {
      console.log(e);
      return;
    }

    if (parsed == "events" || parsed == "blogs" || parsed == "settings") {
      if (!auth) {
        setSession("GUEST");
      }
      return router.replace("/(tabs)/" + parsed);
    }

    if (
      (parsed.includes("t/") && parsed != "t/verify") ||
      (parsed.includes("tickets/") && parsed != "tickets/verify")
    ) {
      if (!auth) {
        setSession("GUEST");
      }

      let tbid = parsed.split("/")[1];

      return router.push("/tickets/" + tbid + params);
    }

    if (parsed.includes("venues/scanner")) {
      if (!auth) {
        setSession("GUEST");
      }

      return router.push("/venues/scanner" + params);
    }

    if ((parsed == "login" || parsed == "register") && isGuest) {
      setSession(null);
      setTimeout(() => {
        router.replace("/" + parsed);
      }, 500);
      return;
    }
  }, [url, isLoadingOrg, isLoadingAuth]);

  const setDefaultOrganization = (val) => {
    _setDefaultOrganization(val);

    SecureStore.setItemAsync("DEFORG", val);
  };

  const setOrganizerMode = (val) => {
    _setOrganizerMode(val);

    SecureStore.setItemAsync("ORGMODE", val.toString());
  };

  React.useEffect(() => {
    if (defaultOrganization == "-") return;

    if (!activeOrganization) return setDefaultOrganization("");

    setDefaultOrganization(activeOrganization.i);
  }, [activeOrganization]);

  React.useEffect(() => {
    SecureStore.getItemAsync("ORGMODE").then((val) => {
      if (val == null) return;

      _setOrganizerMode(val == "true");
    });

    SecureStore.getItemAsync("DEFORG").then((val) => {
      if (val == null) {
        setIsLoadingOrg(false);
        return;
      }
      _setDefaultOrganization(val);
      setIsLoadingOrg(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token) => {
          // Perform sign-in logic here
          setSession(token);
        },
        setSocket: (_socket) => {
          setSocket(_socket);
        },
        signOut: () => {
          setSession(null);
          setTimeout(() => {
            router.push("/login");
          }, 500);
        },
        name,
        phoneNumber,
        organizations,
        activeOrganization,
        isGuest,
        session,
        auth,
        socket,
        organizerMode,
        defaultOrganization,
        setName,
        setPhoneNumber,
        setOrganizations,
        setDefaultOrganization,
        setActiveOrganization,
        setOrganizerMode,
        isLoading: isLoadingAuth || isLoadingOrg,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
