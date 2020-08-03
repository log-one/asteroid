import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

import { getCurrentUser, validateJwt } from "../services/authService";

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  const [user, setUser] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [isTokenValidated, setIsTokenValidated] = useState(false);

  useEffect(() => {
    async function isValid() {
      const valid = await validateJwt();
      if (valid) {
        console.log("validJWT", isTokenValidated);
        setUser(getCurrentUser());
        setIsAuth(true);
        setIsTokenValidated(true);
      } else {
        setIsAuth(false);
        setIsTokenValidated(true);
      }
    }

    if (getCurrentUser() !== user) isValid();
  });

  if (!isTokenValidated) {
    return (
      <div>
        {console.log("RENDERING PROTECTED ROUTE false")}
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <Route
      path={path}
      {...rest}
      render={(props) => {
        return isAuth ? (
          <Component userName={user.trim().toLowerCase()} {...props} />
        ) : (
          <Redirect to="/" />
        );
      }}
    />
  );
};

export default ProtectedRoute;
