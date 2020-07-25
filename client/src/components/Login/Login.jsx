import React, { useState } from "react";
import * as authService from "../../services/authService";
import Input from "../Input/Input";
import Joi from "joi-browser";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = ({ history }) => {
  //TBF convert to single data state
  //add state variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  //TBF: username must start w letter and contain only letters and numbers, add REGEX for password complexity.
  const schema = {
    username: Joi.string().required().min(1).max(15).label("Username"),
    password: Joi.string().required().min(8).max(50).label("Password"),
  };

  const validateSubmit = () => {
    const { error } = Joi.validate({ username, password }, schema);

    let errors = {};

    if (error)
      error.details.forEach((error) => {
        errors[error.path[0]] = error.message;
      });
    else errors = null;

    return errors;
  };

  const validateProperty = (inputValue, inputName) => {
    const obj = { [inputName]: inputValue };
    const subSchema = { [inputName]: schema[inputName] };
    let errorMessages = { ...errors };
    const { error } = Joi.validate(obj, subSchema);

    if (inputName === "username") setUsername(inputValue);
    if (inputName === "password") setPassword(inputValue);

    if (error) {
      errorMessages[error.details[0].path[0]] = error.details[0].message;
    } else {
      delete errorMessages[inputName];
    }
    setErrors(errorMessages);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateSubmit();
    setErrors(errors);

    if (errors) return;

    await doSubmit();
  };

  const doSubmit = async () => {
    console.log("posting to server...");
    try {
      await authService.login({ name: username, password });
      history.replace("/app");
      //  window.location.reload(false);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const newErrors = { ...errors };
        newErrors.username = ex.response.data;
        setErrors(newErrors);
      }
    }
  };

  //describe the view
  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Login</h1>
        <Input
          name="username"
          placeholder="username"
          type="text"
          validateProperty={validateProperty}
          errors={errors}
        />
        <Input
          name="password"
          placeholder="password"
          type="password"
          validateProperty={validateProperty}
          errors={errors}
        />

        <button
          onClick={async (event) => await handleSubmit(event)}
          className="button mt-20"
          type="submit"
          // disabled={validateSubmit}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
