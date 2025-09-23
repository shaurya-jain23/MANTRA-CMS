import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../features/user/userSlice";
import { getDefaultRouteForRole } from "../assets/helperFunctions";
import { Loading } from "./index";
import { toast } from "react-hot-toast";

function Protected({ children, authentication = true, allowedRoles = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [loadingLocal, setLoadingLocal] = useState(true);
  const [redirectionTarget, setRedirectionTarget] = useState(null);
  const [toastConfig, setToastConfig] = useState({ show: false, message: "" });
  const [navState, setNavState] = useState(null);

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userData = useSelector(selectUser);

  const lastNavRef = useRef(null);
  const toastShownRef = useRef(false);
  const hasProcessedRef = useRef(false);

  // Effect to determine redirection logic - RUNS ONLY ONCE per mount/key changes
  useEffect(() => {
    // Prevent multiple executions for the same auth state
    if (hasProcessedRef.current) {
      return;
    }

    let target = null;
    let newNavState = null;
    let showToast = false;
    let toastMessage = "";

    // If still loading user data, wait
    if (authentication && isLoggedIn && !userData) {
      setLoadingLocal(true);
      return;
    }

    if (authentication && !isLoggedIn) {
      // Not logged in - redirect to login
      target = "/login";
      newNavState = { from: location };
    } else if (!authentication && isLoggedIn) {
      // Logged in but trying to access public routes (login, signup, etc.)
      showToast = true;
      toastMessage = "You are already logged in!";
      
      if (!userData?.profileComplete) {
        target = "/update-profile";
      } else if (userData?.status === "pending") {
        target = "/pending-approval";
      } else if (userData?.status === "active" && userData?.role) {
        target = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
      } else {
        target = "/update-profile";
      }
    } else if (authentication && isLoggedIn && userData) {
      // User is logged in - check profile and status
      
      if (!userData.profileComplete) {
        if (pathname !== "/update-profile") {
          target = "/update-profile";
          newNavState = { from: location };
          showToast = pathname === "/login" || pathname === "/signup";
          toastMessage = "Please complete your profile to continue";
        }
      } else if (userData.status === "pending") {
        if (pathname !== "/pending-approval") {
          target = "/pending-approval";
          showToast = pathname === "/login" || pathname === "/signup";
          toastMessage = "Your account is pending approval";
        }
      } else if (userData.status === "active") {
        if (pathname === "/pending-approval" || pathname === "/update-profile") {
          target = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
          showToast = true;
          toastMessage = "Welcome back!";
        } else if (allowedRoles.length > 0) {
          if (!userData.role) {
            target = "/update-profile";
            showToast = true;
            toastMessage = "Please update your profile";
          } else if (!allowedRoles.includes(userData.role)) {
            target = "/unauthorized";
          }
        } else if (pathname === "/login" || pathname === "/signup") {
          target = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
          showToast = true;
          toastMessage = "You are already logged in!";
        }
      } else if (userData.status === "disabled") {
        target = "/login";
        showToast = true;
        toastMessage = "Your account has been disabled";
      }
    }

    // Only update state if we have a target different from current path
    if (target && target !== pathname) {
      setRedirectionTarget(target);
      setToastConfig({ show: showToast, message: toastMessage });
      setNavState(newNavState);
      hasProcessedRef.current = true;
    }

    setLoadingLocal(false);
  }, [
    isLoggedIn,
    userData?.status,
    userData?.role,
    userData?.profileComplete,
    authentication,
    allowedRoles?.join(','), // Use stringified version to avoid array reference changes
    pathname, // Only pathname, not the whole location object
  ]);

  // Effect to handle the actual navigation and toast
  useEffect(() => {
    if (!redirectionTarget || redirectionTarget === pathname || lastNavRef.current === redirectionTarget) {
      return;
    }

    // Show toast if needed
    if (toastConfig.show && toastConfig.message && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(toastConfig.message);
      
      setTimeout(() => {
        toastShownRef.current = false;
      }, 3000);
    }

    // Perform navigation
    lastNavRef.current = redirectionTarget;
    console.log(`Redirecting from ${pathname} to ${redirectionTarget}`);

    if (navState) {
      navigate(redirectionTarget, { replace: true, state: navState });
    } else {
      navigate(redirectionTarget, { replace: true });
    }

    // Don't reset states immediately - let the navigation happen first
    setTimeout(() => {
      setRedirectionTarget(null);
      setToastConfig({ show: false, message: "" });
      setNavState(null);
      hasProcessedRef.current = false; // Reset for future navigation
    }, 100);

  }, [redirectionTarget, pathname, navigate]);

  // Show loading while auth state is being determined
  if (loadingLocal || (authentication && isLoggedIn && !userData)) {
    return <Loading isOpen={true} message="Loading the Page..." />;
  }

  // Additional protection for edge cases
  if (authentication && isLoggedIn && userData) {
    if ((pathname === "/login" || pathname === "/signup") && userData) {
      return <Loading isOpen={true} message="Redirecting..." />;
    }

    if (!userData.profileComplete && pathname !== "/update-profile") {
      return <Loading isOpen={true} message="Redirecting to profile setup..." />;
    }

    if (userData.profileComplete && userData.status === "pending" && pathname !== "/pending-approval") {
      return <Loading isOpen={true} message="Waiting for approval..." />;
    }

    if (userData.status === "disabled") {
      return <Loading isOpen={true} message="Account disabled. Redirecting..." />;
    }

    if (allowedRoles.length > 0 && userData.status === "active") {
      if (!userData.role || !allowedRoles.includes(userData.role)) {
        return <Loading isOpen={true} message="Checking permissions..." />;
      }
    }
  }

  return <Outlet />;
}

export default Protected;