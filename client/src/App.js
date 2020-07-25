import React from "react";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import AppController from "./components/AppController/AppController";

import { getCurrentUser } from "./services/authService";

import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const userName = getCurrentUser();

  return (
    <React.Fragment>
      {console.log("RENDERING APP")}
      <Switch>
        <Route
          path="/register"
          render={(props) =>
            userName ? (
              <AppController userName={userName} {...props} />
            ) : (
              <Register {...props} />
            )
          }
        />
        <Route
          path="/login"
          render={(props) =>
            userName ? (
              <AppController userName={userName} {...props} />
            ) : (
              <Login {...props} />
            )
          }
        />
        <ProtectedRoute path="/app" component={AppController} />
        <Route
          path="/"
          render={(props) =>
            userName ? (
              <AppController userName={userName} {...props} />
            ) : (
              <Register {...props} />
            )
          }
        />
      </Switch>
      <ToastContainer position="bottom-center" />
    </React.Fragment>
  );
};

export default App;
