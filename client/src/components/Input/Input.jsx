import React from "react";
import "./Input.css";

const Input = ({ name, errors, placeholder, validateProperty, type }) => {
  return (
    <div>
      <input
        placeholder={placeholder}
        className="joinInput mt-20"
        type={type}
        onChange={(event) => validateProperty(event.target.value, name)}
      />
      {errors && errors[name] && (
        <div className="input-error">{errors[name]}</div>
      )}
    </div>
  );
};

export default Input;
