import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../features/user/userSlice";
import { getDefaultRouteForRole } from "../assets/helperFunctions";
import { Loading } from "./index";

function Protected({ children, authentication = true, allowedRoles = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [loadingLocal, setLoadingLocal] = useState(true);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userData = useSelector(selectUser);

  const lastNavRef = useRef(null);

  useEffect(() => {
    let target = null;
    let navState = undefined; // optional state for navigate

    if (authentication && !isLoggedIn) {
      target = "/login";
      navState = { from: location };
    } else if (!authentication && isLoggedIn) {
      target = location.state?.from?.pathname || getDefaultRouteForRole(userData?.role);
    } else if (authentication && isLoggedIn) {
      if (!userData?.profileComplete) {
        target = "/update-profile";
      } else if (userData?.status === "pending") {
        if (pathname !== "/pending-approval") target = "/pending-approval";
      } else if (userData?.status === "active") {
        // If user is active but stuck on /pending-approval, send them to default/origin
        if (pathname === "/pending-approval") {
          target = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
        } else if (allowedRoles?.length > 0 && !allowedRoles.includes(userData.role)) {
          target = "/unauthorized";
        }
      } else if (userData?.status === "disabled") {
        target = "/login";
      }
    }

    // Only navigate if we have a target and it's different from current path,
    // and we haven't just navigated to that same target (prevents loops)
    if (target && target !== pathname && lastNavRef.current !== target) {
      // store last nav target immediately to avoid double navs while this effect runs again
      lastNavRef.current = target;
      if (navState) navigate(target, { replace: true, state: navState });
      else navigate(target, { replace: true });
    }

    setLoadingLocal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoggedIn,
    userData?.status,
    userData?.role,
    userData?.profileComplete,
    authentication,
    allowedRoles,
    pathname, // use a primitive to avoid re-running on whole location object
    navigate,
  ]);

  // Show global loader while auth/profile resolution is in progress
  if (loadingLocal || (authentication && (!isLoggedIn || !userData))) {
    return <Loading isOpen={true} message="Loading the Page..." />;
  }

  // 1. Incomplete profile → only allow update-profile
  if (userData && !userData?.profileComplete && pathname !== "/update-profile") {
    return null;
  }

  // 2. Pending users → only allow PendingApproval page
  if (
  userData?.profileComplete &&
  userData?.status === "pending" &&
  pathname !== "/pending-approval"
) {
  return null;
}
  if (userData?.status === "disabled") {
    return null;
  }
  if (
    allowedRoles?.length > 0 &&
    !allowedRoles.includes(userData.role) &&
    userData?.status === "active"
  ) {
    return null;
  }

  return <><Outlet /></>;
}

export default Protected;
