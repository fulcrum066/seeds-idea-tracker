import { Link } from "react-router-dom";
import '../../styles/NavBarStyle.css';
import { useState, useEffect } from "react";
import authService from "../../features/auth/authService";

function TopBar() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      if (!token) return;

      try {
        const me = await authService.getMe(token);
        setCurrentUser(me);
        const isAdmin = (currentUser?.roles || []).includes('admin');
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className='top-bar'>
      <table border="0" className="top-bar">
        <tbody>
          <tr>
            <td>
              <Link to="/dashboard" className="nav-button">
                <img alt="icon" src="/dashboard_images/star.png" className="img" />
                <span>Dashboard</span>
              </Link>
            </td>
            <td>
              <Link to="/dashboard/seed" className="nav-button">
                <img alt="icon" src="/dashboard_images/star.png" className="img" />
                <span>Project Boards</span>
              </Link>
            </td>
            <td>
              <Link to="[PLACEHOLDER]" className="nav-button">
                <img alt="icon" src="/dashboard_images/star.png" className="img" />
                <span>Drafts</span>
              </Link>
            </td>
            <td>
              <Link to="[PLACEHOLDER]" className="nav-button">
                <img alt="icon" src="/dashboard_images/Settings.png" className="img" />
                <span>Settings</span>
              </Link>
            </td>
            {/*<td rowspan="2"><div style={{ display: 'flex', alignItems: 'center', paddingLeft: '100px', borderLeft: '2px solid white'}}>Hello John <img src="profile_pic.webp" style={{ width: '50px', height: '50px', marginLeft: '10px'}}/></div></td>*/}
          </tr>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </tbody>
      </table>
      <table border='0' className='top-bar-profile'>
        <tbody>
          <tr>
            <td>
              <div>Hello {currentUser ? currentUser.firstName : "..."}</div>
              <div style={{ fontSize: '8px' }}>{currentUser?.email}</div>
            </td>
            <td>
              <img
                alt="profile picture"
                src="/dashboard_images/profile_pic.png"
                className="pfp"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default TopBar