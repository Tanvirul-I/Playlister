import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import api from "./auth-request-api";

const AuthContext = createContext();

function AuthContextProvider(props) {
  const [authState, setAuthState] = useState({
    user: null,
    loggedIn: false,
  });
  const history = useHistory();

  const setLoggedInState = useCallback((user, loggedIn) => {
    setAuthState({
      user: user ?? null,
      loggedIn: Boolean(loggedIn),
    });
  }, []);

  const getLoggedIn = useCallback(async () => {
    const response = await api.getLoggedIn();
    if (response.status === 200) {
      setLoggedInState(response.data.user, response.data.loggedIn);
    }
  }, [setLoggedInState]);

  const registerUser = useCallback(
    async (username, firstName, lastName, email, password, passwordVerify) => {
      const response = await api.registerUser(
        username,
        firstName,
        lastName,
        email,
        password,
        passwordVerify,
      );

      if (response.status === 200) {
        setLoggedInState(response.data.user, response.data.loggedIn);
        history.push("/");
      }
    },
    [history, setLoggedInState],
  );

  const loginUser = useCallback(
    async (email, password, rememberMe = false) => {
      try {
        const response = await api.loginUser(email, password, rememberMe);
        if (response.status === 200) {
          setLoggedInState(response.data.user, true);
          history.push("/");
          return response.data;
        }

        throw response;
      } catch (error) {
        throw error;
      }
    },
    [history, setLoggedInState],
  );

  const logoutUser = useCallback(async () => {
    const response = await api.logoutUser();
    if (response.status === 200) {
      setLoggedInState(null, false);
      history.push("/");
    }
  }, [history, setLoggedInState]);

  const continueAsGuest = useCallback(
    async (globalStore) => {
      try {
        const response = await api.continueAsGuest();
        if (response.status === 200) {
          const guestUser = response.data.user
            ? response.data.user
            : {
                firstName: "Guest",
                lastName: "User",
                email: "",
                username: "guest",
                isGuest: true,
              };

          setLoggedInState(guestUser, true);

          if (globalStore) {
            if (typeof globalStore.setSortLoc === "function") {
              globalStore.setSortLoc("groups");
            }

            if (typeof globalStore.loadCommunityLists === "function") {
              globalStore.loadCommunityLists();
            } else if (typeof globalStore.loadIdNamePairs === "function") {
              globalStore.loadIdNamePairs();
            }
          }

          history.push("/");
          return guestUser;
        }
      } catch (error) {
        console.log(error);
        const errorMessageText =
          error?.data?.errorMessage || "Failed to start guest session.";
        if (globalStore && typeof globalStore.showErrorModal === "function") {
          globalStore.showErrorModal(errorMessageText);
        }
        return null;
      }

      return null;
    },
    [history, setLoggedInState],
  );

  const getUserInitials = useCallback(() => {
    if (!authState.user) {
      return "";
    }

    const { firstName = "", lastName = "" } = authState.user;
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }, [authState.user]);

  const auth = useMemo(
    () => ({
      user: authState.user,
      loggedIn: authState.loggedIn,
      getLoggedIn,
      registerUser,
      loginUser,
      logoutUser,
      continueAsGuest,
      getUserInitials,
    }),
    [
      authState.loggedIn,
      authState.user,
      getLoggedIn,
      registerUser,
      loginUser,
      logoutUser,
      continueAsGuest,
      getUserInitials,
    ],
  );

  useEffect(() => {
    getLoggedIn();
  }, [getLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        auth,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
export { AuthContextProvider };
