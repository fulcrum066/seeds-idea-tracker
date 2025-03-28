import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom'

//  <BreadcrumbsActiveLast links={
//     [
//         { heading: "Manage", link: "/" },
//         { heading: "RCA", link: "/" },
//         { heading: "Invite participants", link: "" },
//     ]
// } />  


export default function BreadcrumbsActiveLast({links}) {

    const location = useLocation();

    const hrstyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #d3caca',
        marginBottom: '30px',
    }; 

    return (
        
        <div role="presentation" style={hrstyle}>
            <Breadcrumbs aria-label="breadcrumb" >

                {links.map((li, i, row) => {
                      if (i + 1 === row.length) {
                        return(
                        <Link underline="hover" color="inherit" to={location.pathname} key={i}>
                            {li.heading}
                        </Link>)
                      } else {
                        return(
                        <Link underline="hover" color="inherit" to={li.link} key={i}>
                            {li.heading}
                        </Link>)
                      }
                    
                })
                }

            </Breadcrumbs>

            <br/>
        </div>
    );
}
