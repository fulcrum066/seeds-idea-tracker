function NavBar(){
  return (
  <div className = "container">
    <table border="0" class = "top-bar">
      <tr>
        <td><img src="/Settings.png" style={{ width: '50px', height: '50px', verticalAlign: 'center' }}/></td>
        <td><img src="/star.jpg" style={{ width: '50px', height: '50px' }}/></td>
        <td><img src="/logo192.png" style={{ width: '50px', height: '50px' }}/></td>
        {/*<td rowspan="2"><div style={{ display: 'flex', alignItems: 'center', paddingLeft: '100px', borderLeft: '2px solid white'}}>Hello John <img src="profile_pic.webp" style={{ width: '50px', height: '50px', marginLeft: '10px'}}/></div></td>*/}
      </tr>
      <tr>
        <th>Main Menu</th>
        <th>Project Board</th>
        <th>Settings</th>
      </tr>
    </table>
    <table border = '0' class='top-bar-profile'>
      <tr>
        <td>Hello John</td>
        <td><img src="profile_pic.webp" style={{ width: '50px', height: '50px'}}/></td>
      </tr>
    </table>
  </div>
  )
}