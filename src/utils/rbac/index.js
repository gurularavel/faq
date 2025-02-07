import { useSelector } from "react-redux";
import { permissions } from "./permissions";

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);
  const roles = user?.role_ids || [];
  const hasPermission = (permissionName) => {
    return (
      roles.length > 0 &&
      permissions[permissionName]?.some((role) => roles.includes(role))
    );
  };
  const isAdmin = roles.includes(1);
  const isUser = roles.includes(0);

  return { hasPermission, roles, isAdmin, isUser };
};
