import React from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';
import { Route } from 'react-router-dom';
import SeedsHome from "../seeds/SeedsHome";

import '../HomePageStyle.css'
import TopBar from '../../components/Navigation/NavBar';


function Routes(){
  return(
    <Routes>
        <Route path="../seeds/SeedsHome" element={<SeedsHome/>} />
  </Routes>
  )
}

function Background() {
  return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("dashboard_images/Background.png")',
        backgroundSize: 'cover',
        zIndex: -1,
      }} />
  );
}

function ProjectBoards(){
  return(
    <div style={{marginTop: '100px'}}>
      <Link to="../seeds/SeedsHome" className='project-boards-buttons' id='button-drafts' style={{ textDecoration: 'none' }}>
        <h1>Drafts</h1>
      </Link>
      <button className='project-boards-buttons' id='button-add'><img src='dashboard_images/add.png'style={{ width: '35px', height:'30px', marginRight: '5px'}}/>Join New Project</button>
      <h1 style={{paddingLeft: '50px', marginTop: '25px'}}>Projects: </h1>
      <table className='project-boards'>
        <tr>
          <th>Board 1</th>
          <th>Board 2</th>
        </tr>
        <tr>
          <td>Admin: [PLACEHOLDER]</td>
          <td>Admin: [PLACEHOLDER]</td>
        </tr>
      </table>
    </div>
  )
}

function RecentSeeds(){
  return(
  <div style={{paddingLeft: '50px', marginTop: '140px'}}>
    <h1>Recent Seeds:</h1>
    <div>
      <table border = "0">
        <tr>
          <td><img src="dashboard_images/idea.jpg" style={{ width: '200px', height: '175px', verticalAlign: 'center' }}></img></td>
        </tr>
        <tr>
          <td style={{textAlign: 'center', backgroundColor: 'white', color: 'grey'}}>Idea 1</td>
        </tr>
      </table>
    </div>
  </div>
  )
}

function YourSeedIdeas(){
  return(
    <div style={{paddingLeft: '50px', marginTop: '50px'}}>
      <h1 style = {{ fontFamily: 'B612, sans-serif' }}>Your Seed Ideas: </h1>
      <div style={{ height: '200px', overflowY: 'auto' }}>
        <table border = "0" style={{backgroundColor: 'white'}}>
          <tr>
            <td style = {{textAlign: 'left', backgroundColor: 'white', color: 'Black', fontSize: '25px'}}>Idea 1</td>
          </tr>
          <tr>
            <td style = {{textAlign: 'left', backgroundColor: 'white', color: 'grey'}}>Description</td>
          </tr>
        </table>
      </div>
    </div>
  )
}


function UserHomePage(){
  return (
    <>
      <Background/>
      <TopBar />
      <ProjectBoards/>
      <RecentSeeds/>
    </>
    );  
}

export default UserHomePage;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals