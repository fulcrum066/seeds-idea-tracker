import { Link } from 'react-router-dom';
import { Route } from 'react-router-dom';

import '../../pages/HomePageStyle.css';

function TopBar(){
  return (
  <div className=''>
    <table border="0" className = "top-bar">
      <tbody>
      <tr>
        <td><img src="dashboard_images/star.png" style={{ width: '40px', height: '35px', verticalAlign: 'middle' }}/></td>
        <td><img src="dashboard_images/star.png" style={{ width: '40px', height: '35px' }}/></td>
        <td><img src="dashboard_images/Settings.png" style={{ width: '40px', height: '35px' }}/></td>
        <td><img src="dashboard_images/star.png" style={{ width: '40px', height: '35px' }}/></td>
        {/*<td rowspan="2"><div style={{ display: 'flex', alignItems: 'center', paddingLeft: '100px', borderLeft: '2px solid white'}}>Hello John <img src="profile_pic.webp" style={{ width: '50px', height: '50px', marginLeft: '10px'}}/></div></td>*/}
      </tr>
      <tr>
        <th>Main Menu</th>
        <th>Project Board</th>
        <th>Settings</th>
        <th>Drafts</th>
      </tr>
      </tbody>
    </table>
    <table border = '0' className='top-bar-profile'>
    <tbody>
      <tr>
        <td>Hello John</td>
        <td><img src="dashboard_images/profile_pic.webp" style={{ width: '50px', height: '50px'}}/></td>
      </tr>
    </tbody>
    </table>
  </div>
  )
}

export default TopBar