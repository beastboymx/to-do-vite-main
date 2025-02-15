import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouterProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouterProps> = ({ children }) => {
  const token = localStorage.getItem("Token");

  return token ? children : <Navigate to={"/"} />;
};

export default PrivateRoute;
