import React from "react";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Landing from "./components/Landing/Landing";
import AppController from "./components/AppController/AppController";

import { getCurrentUser } from "./services/authService";

import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const userName = getCurrentUser();

  return (
    <React.Fragment>
      <Switch>
        <ProtectedRoute path="/app" component={AppController} />
        <Route
          path="/"
          render={(props) =>
            userName ? (
              <AppController userName={userName} {...props} />
            ) : (
              <Landing {...props} />
            )
          }
        />
      </Switch>
      <ToastContainer position="bottom-center" />
    </React.Fragment>
  );
};

export default App;
