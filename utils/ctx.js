import React from "react";
import { useStorageState } from "./useStorageState";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";

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
  const [[isLoadingAuth, session], setSession] = useStorageState("GL4SID");
  const [socket, setSocket] = React.useState(null);

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
        },
        session,
        socket,
        isLoading: isLoadingAuth,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
