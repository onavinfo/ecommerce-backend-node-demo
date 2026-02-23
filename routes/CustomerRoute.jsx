import { Navigate } from "react-router-dom";
import { getToken } from "../Auth Utility/AuthUtility";

export default function CustomerRoute({ children }) {
  const token = getToken();

  // not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
