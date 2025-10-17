import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const currentUrl = window.location.pathname;

    useEffect(() => {
        localStorage.setItem("errorURL", JSON.stringify(currentUrl));
    }, [currentUrl]);

    // ---------- Not logged in ----------
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ---------- Pending users ----------
    if (user.roles?.includes("pending")) {
        return <Navigate to="/pending" state={{ from: location }} replace />;
    }

    // ---------- Role-based check ----------
    const ok = user.roles?.some((role) => allowedRoles?.includes(role));

    if (ok) {
        return <Outlet />;
    }

    // ---------- Logged in but not allowed ----------
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
};

export default RequireAuth;
