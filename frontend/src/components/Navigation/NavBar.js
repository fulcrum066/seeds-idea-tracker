import { Link } from "react-router-dom";
import './NavBarStyle.css';

function TopBar(){
  return (
  <div className='top-bar'>
    <table border="0" className = "top-bar">
      <tbody>
      <tr>
        <td>
          <Link to="[PLACEHOLDER]"><img alt="icon" src="dashboard_images/star.png" style={{ width: '40px', height: '35px', verticalAlign: 'middle' }}/></Link>
        </td>
        <td>
          <Link to="/dashboard"><img alt="icon" src="dashboard_images/star.png" style={{ width: '40px', height: '35px' }}/></Link>
        </td>
        <td>
          <Link to="[PLACEHOLDER]"><img alt="icon" src="dashboard_images/Settings.png" style={{ width: '40px', height: '35px' }}/></Link>
        </td>
        <td>
          <Link to="[PLACEHOLDER]"><img alt="icon" src="dashboard_images/star.png" style={{ width: '40px', height: '35px' }}/></Link>
        </td>
        {/*<td rowspan="2"><div style={{ display: 'flex', alignItems: 'center', paddingLeft: '100px', borderLeft: '2px solid white'}}>Hello John <img src="profile_pic.webp" style={{ width: '50px', height: '50px', marginLeft: '10px'}}/></div></td>*/}
      </tr>
      <tr>
        <th><Link to="[PLACEHOLDER]" style={{color: 'white'}}>Main Menu</Link></th>
        <th><Link to="/dashboard" style={{color: 'white'}}>Project Boards</Link></th>
        <th><Link to="[PLACEHOLDER]" style={{color: 'white'}}>Settings</Link></th>
        <th><Link to="[PLACEHOLDER]" style={{color: 'white'}}>Drafts</Link></th>
      </tr>
      </tbody>
    </table>
    <table border = '0' className='top-bar-profile'>
    <tbody>
      <tr>
        <td>Hello John</td>
        <td><img alt="profile picture" src="dashboard_images/profile_pic.webp" style={{ width: '50px', height: '50px'}}/></td>
      </tr>
    </tbody>
    </table>
  </div>
  )
}

export default TopBar