import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../Authenticate/Header";

function UpdateAccountPrivileges() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="container">
      <Header />
      Contact Admin to update your account privileges
    </div>
  );
}

export default UpdateAccountPrivileges;
