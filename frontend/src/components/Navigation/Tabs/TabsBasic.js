import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableBasic from '../../DataDisplay/TableBasic';

//--------------------------as imports--------------------------

// import Container from '@mui/material/Container';
// import TabsBasic from '../../components/Navigation/Tabs/TabsBasic';

//--------------------------as attributes--------------------------

// const [tabCount, setTabCount] = React.useState(6);

//--------------------------as a function--------------------------

// function createTabs() {

//     const tabInfo = [
//         {
//             label: "Name",
//             content: "."
//         },
//         {
//             label: "Email",
//             content: ".."
//         },
//         {
//             label: "Password",
//             content: "..."
//         },
//     ]

//     const tabs = []

//     for (let i = 0; i < tabCount; i++) {
//         console.log(tabInfo[i]?.label)
//         tabs.push(
//             {
//                 tabLabel: tabInfo[i].label,
//                 tabContent: tabInfo[i].content,
//             }
//         )
//     }

//     return (tabs)
// }

//--------------------------in render--------------------------

{/* <Container maxWidth="md">
    <TabsBasic tabs={createTabs()} />
</Container> */}


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component="div">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function TabsBasic({ tabs }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>

                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>

                    {tabs.map((tab, length) => (
                        <Tab label={tab.tabLabel} {...a11yProps(length)} key={length} /> 
                    ))}

                </Tabs>
                
            </Box>

            {tabs.map((tab, length) => (
                
                <TabPanel value={value} index={length} key={length}>
                    <Box display="flex" width="100%" justifyContent="center" alignItems="center">
                        {tab.tabContent}
                    </Box>
                </TabPanel>
                
            ))}

        </Box>
    );
}
