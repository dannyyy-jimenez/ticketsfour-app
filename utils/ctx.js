import React from "react";
import { useStorageState } from "./useStorageState";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import Api from "./Api";
import moment from "moment";

const AuthContext = React.createContext(null);
const OfflineContext = React.createContext(null);

const keygen = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function useOfflineProvider() {
  const value = React.useContext(OfflineContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useOfflineProvider must be wrapped in a <OfflineProvider />",
      );
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
  const [name, _setName] = React.useState("");
  const [email, _setEmail] = React.useState("");
  const [phoneNumber, _setPhoneNumber] = React.useState("");
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

  const nav = (uri) => {
    router.replace(uri);
  };

  React.useEffect(() => {
    if (!url || typeof url == "undefined" || isLoadingOrg || isLoadingAuth)
      return;

    let parsed = "";
    let params = {};

    try {
      // if (url.startsWith("com.ticketsfour.app://")) {
      //   // Split the deep link by '://' to get the path
      //   const parts = url.split("://");
      //   // The last part of the split contains the path (after the '://')
      //   parsed = parts[1];
      // }
      // // Check if the deep link uses HTTP/HTTPS scheme
      // else if (url.startsWith("http://") || url.startsWith("https://")) {
      //   // Use URL API to parse the deep link
      //   let parsedUrl = new URL(url);
      //   // Extract the pathname from the parsed URL
      //   const path = parsedUrl.pathname;
      //   // Remove leading slash if present
      //   params = parsedUrl.search;
      //   parsed = path.startsWith("/") ? path.substring(1) : path;
      // }

      let parsedObj = Linking.parse(url);

      if (parsedObj.path != "") {
        parsed = parsedObj.path;
        params = new URLSearchParams(parsedObj.queryParams).toString();
      }
    } catch (e) {
      console.log(e);
      return;
    }

    // if (parsed == "events" || parsed == "blogs" || parsed == "settings") {
    //   if (!auth) {
    //     setSession("GUEST");
    //   }

    //   return router.replace("/(tabs)/" + parsed);
    // }

    // if (!parsed.includes("organization")) {
    //   try {
    //     if (!auth) {
    //       setSession("GUEST");
    //     }

    //     if ((parsed == "login" || parsed == "register") && session) {
    //       setSession(null);
    //     }

    //     setTimeout(() => nav("/" + parsed + "?" + params), 1000);
    //   } catch (e) {}

    //   return;
    // }

    // if (
    //   (parsed.includes("t/") && parsed != "t/verify") ||
    //   (parsed.includes("tickets/") && parsed != "tickets/verify")
    // ) {
    //   if (!auth) {
    //     setSession("GUEST");
    //   }

    //   let tbid = parsed.split("/")[1];

    //   setTimeout(() => nav("/tickets/" + tbid + "?" + params), 1000);
    //   return;
    // }

    // if (parsed.includes("venues/scanner")) {
    //   if (!auth) {
    //     setSession("GUEST");
    //   }

    //   return router.push("/venues/scanner" + params);
    // }

    // if ((parsed == "login" || parsed == "register") && isGuest) {
    //   setSession(null);
    //   setTimeout(() => nav("/" + parsed + "?" + params), 1000);
    //   return;
    // }
  }, [url, isLoadingOrg, isLoadingAuth]);

  const setDefaultOrganization = (val) => {
    _setDefaultOrganization(val);

    SecureStore.setItemAsync("DEFORG", val);
  };

  const setOrganizerMode = (val) => {
    _setOrganizerMode(val);

    SecureStore.setItemAsync("ORGMODE", val.toString());
  };

  const setName = (val) => {
    _setName(val);

    SecureStore.setItemAsync("nomen", val.toString());
  };

  const setPhoneNumber = (val) => {
    _setPhoneNumber(val);

    SecureStore.setItemAsync("numerus", val.toString());
  };

  const setEmail = (val) => {
    _setEmail(val);

    SecureStore.setItemAsync("littera", val.toString());
  };

  React.useEffect(() => {
    if (defaultOrganization == "-") return;

    if (!activeOrganization) return setDefaultOrganization("");

    setDefaultOrganization(activeOrganization.i);
  }, [activeOrganization]);

  React.useEffect(() => {
    SecureStore.getItemAsync("nomen").then((val) => {
      _setName(val || "");
    });
    SecureStore.getItemAsync("numerus").then((val) => {
      _setPhoneNumber(val || "");
    });
    SecureStore.getItemAsync("littera").then((val) => {
      _setEmail(val || "");
    });

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
          setName("");
          setEmail("");
          setPhoneNumber("");
          setTimeout(() => {
            router.push("/login");
          }, 500);
        },
        name,
        phoneNumber,
        email,
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
        setEmail,
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

export function OfflineProvider(props) {
  const { auth } = useSession();
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);
  const [offlineState, setOfflineState] = React.useState(keygen(8));
  const [networkStrength, setNetworkStrength] = React.useState(100);
  const [cellularGeneration, setCellularGeneration] = React.useState(null);
  const [connectionType, setConnectionType] = React.useState(null);
  const [forceOffline, setForceOffline] = React.useState(false);
  const [isConnectionExpensive, setIsConnectionExpensive] =
    React.useState(false);
  const [offlineScanChecksum, setOfflineScanChecksum] = React.useState("");

  const DBName = "TCKTSFR";

  const versioning = "0.0.1";

  const initdb = async () => {
    const db = await SQLite.openDatabaseAsync(DBName);

    // GENESIS IS THE PROMOTERS EVENTS
    //
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS GENESIS (
            oid TEXT,
            id TEXT NOT NULL UNIQUE PRIMARY KEY,
            cover TEXT,
            name TEXT,
            start INTEGER,
            status TEXT,
            active INTEGER
      );`,
    );

    // APOCALYPSE
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS APOCALYPSE (
            eid TEXT,
            id TEXT NOT NULL UNIQUE PRIMARY KEY,
            token TEXT,
            attended INTEGER,
            timeAttended INTEGER,
            offloaded INTEGER
      );`,
    );
  };

  const get = async (query) => {
    const db = await SQLite.openDatabaseAsync(DBName);

    return await db.getAllAsync(query);
  };

  const post = async (query, values) => {
    const db = await SQLite.openDatabaseAsync(DBName);

    return await db.runAsync(query, values);
  };

  const command = async (query) => {
    const db = await SQLite.openDatabaseAsync(DBName);

    return await db.execAsync(query);
  };

  const generateOfflineKey = async () => {
    let checksum = keygen(256);

    await SecureStore.setItemAsync("signum", checksum);

    setOfflineScanChecksum(checksum);

    return checksum;
  };

  const validateOffloadScan = async (eid, scannedCode) => {
    let salted = scannedCode + offlineScanChecksum;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      salted,
    );

    const localres = await get(`
      SELECT *
        FROM APOCALYPSE
        WHERE
        token = '${digest}'
        AND
        eid = '${eid}'
    `);

    if (localres.length == 0) return null;

    return localres[0];
  };

  const invalidateOfflineTickets = async () => {
    const localres = await get(`
      SELECT *
        FROM APOCALYPSE
        WHERE
        offloaded = 1
    `);

    let oid = null;
    let eid = null;

    if (localres.length > 0) {
      oid = localres[0].oid;
      eid = localres[0].eid;
    }

    let ids = localres.map((t) => t.id);

    if (ids.length == 0) return;

    await Api.post("/organizations/events/scan/validate/offline", {
      auth,
      eid,
      oid,
      tids: ids,
    });
  };

  const loadLatestOffline = async () => {};

  // const syncOfflineCart = async () => {
  //   try {
  //     let res = await get(`
  //       SELECT *
  //       FROM CartItem
  //     `);

  //     if (res.length > 0) {
  //       for await (let _cartItem of res) {
  //         let _res = await Api.post("/users/cart/product", {
  //           auth: session,
  //           id: _cartItem.product,
  //           teamId: _cartItem.teamCode,
  //           quantity: _cartItem.quantity,
  //           comment: _cartItem.comment,
  //         });

  //         if (_res.isError) {
  //           continue;
  //         }

  //         command(
  //           `DELETE FROM CartItem WHERE identifier = '${_cartItem.identifier}'`,
  //         );
  //       }

  //       setOfflineState(keygen(8));
  //     }
  //   } catch (e) {
  //     //alert("ERROR SYNCING CART");
  //     console.log(e);
  //   }
  // };

  React.useEffect(() => {
    if (isOfflineMode) return;

    invalidateOfflineTickets();
    // syncOfflineCart();
  }, [isOfflineMode, auth]);

  React.useEffect(() => {
    NetInfo.configure({
      reachabilityTest: async (response) => {
        return response.status === 204;
      },
      reachabilityLongTimeout: 10 * 1000,
      reachabilityRequestTimeout: 1500,
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOfflineMode(
        !state.isInternetReachable ||
          state.details?.cellularGeneration == "2g" ||
          state.details?.cellularGeneration == "3g" ||
          forceOffline,
      );
      setNetworkStrength(state.details.strength);
      setIsConnectionExpensive(state.details.isConnectionExpensive);
      setCellularGeneration(state.details?.cellularGeneration);
      setConnectionType(state.type);
    });
    initdb().then(() => {
      SecureStore.getItemAsync("VER").then(async (_ver) => {
        if (_ver != versioning) {
          try {
            await command(`DROP TABLE GENESIS`);
          } catch (e) {
            alert("BB", e);
          }

          try {
            await initdb();
          } catch (e) {
            alert(e);
          }

          SecureStore.setItemAsync("VER", versioning);
        }

        // remove old events from db
        //
        try {
          let today = moment().startOf("d").valueOf();
          await command(`DELETE FROM GENESIS WHERE start < ${today}`);
        } catch (e) {}

        //loadLatestOffline();
      });
    });

    SecureStore.getItemAsync("signum").then((val) => {
      setOfflineScanChecksum(val || "");
    });

    // To unsubscribe to these update, just use:
    return () => {
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsOfflineMode(
        !state.isInternetReachable ||
          state.details?.cellularGeneration == "2g" ||
          state.details?.cellularGeneration == "3g" ||
          forceOffline,
      );
      setNetworkStrength(state.details.strength);
      setIsConnectionExpensive(state.details.isConnectionExpensive);
      setCellularGeneration(state.details?.cellularGeneration);
      setConnectionType(state.type);
    });
  }, [forceOffline]);

  return (
    <OfflineContext.Provider
      value={{
        isOfflineMode,
        sql: {
          get,
          post,
        },
        invalidateOfflineTickets,
        validateOffloadScan,
        generateOfflineKey,
        forceOffline,
        setForceOffline,
        loadLatestOffline,
        offlineState,
        networkStrength,
        isConnectionExpensive,
        cellularGeneration: cellularGeneration,
        connectionType: connectionType,
      }}
    >
      {props.children}
    </OfflineContext.Provider>
  );
}
