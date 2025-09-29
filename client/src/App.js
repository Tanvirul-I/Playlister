import "./App.css";
import React, { useContext } from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
import AuthContext, { AuthContextProvider } from "./auth";
import { GlobalStoreContextProvider } from "./store";
import {
  AppBanner,
  HomeWrapper,
  LoginScreen,
  RegisterScreen,
} from "./components";
/*
  This is our application's top-level component.
  This is the entry-point for our application. Notice that we
  inject our store into all the components in our application.

  @quthor Tanvirul Islam
*/
const AppContent = () => {
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  const hideBanner = location.pathname === "/" && !auth.loggedIn;

  return (
    <GlobalStoreContextProvider>
      {!hideBanner && <AppBanner />}
      <Switch>
        <Route path="/" exact component={HomeWrapper} />
        <Route path="/login/" exact component={LoginScreen} />
        <Route path="/register/" exact component={RegisterScreen} />
      </Switch>
    </GlobalStoreContextProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  </BrowserRouter>
);

export default App;
