import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from 'react-redux'
import { current } from "@reduxjs/toolkit";

const RequireAuth = ({ allowedRoles }) => {

    const location = useLocation();
    const { user } = useSelector((state) => state.auth)
    const currentUrl = window.location.pathname
    
    useEffect(() => {
        localStorage.setItem('errorURL', JSON.stringify(currentUrl));
      }, [currentUrl]);

    return (
        user?.roles?.find(role => allowedRoles?.includes(role))
            ? <Outlet />
            : user
                ? <Navigate to="/forbidden" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;