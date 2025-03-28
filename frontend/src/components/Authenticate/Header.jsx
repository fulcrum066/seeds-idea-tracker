import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../../features/auth/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img className="logo" width={120} src="/images/logo.png" alt="" />
        </Link>
      </div>
      <ul>
        {user ? (
          <li>
            <button className="btn" onClick={onLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login">
                <div className="navy medium">
                  <FaSignInAlt />
                  Login
                </div>
              </Link>
            </li>
            <li>
              <Link to="/register">
                <div className="navy medium">
                  <FaUser /> Register
                </div>
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;
