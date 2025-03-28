import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const Layout = () => {
  const navigate = useNavigate();

  //dispatch
  const dispatch = useDispatch();

  const { user, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && user) {
      console.log(message);
      if (message === "Not authorized") {
        navigate("/logout");
      }
    }

    return () => {
      //dispatch(reset())
    };
  }, [isError, message, dispatch]);

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default Layout;
