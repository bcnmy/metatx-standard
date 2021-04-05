import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import Ethers_Custom_EIP712Sign from './components/Ethers_Custom_EIP712Sign';
import Ethers_Custom_PersonalSign from './components/Ethers_Custom_PersonalSign';
import Ethers_EIP2771_EIP712Sign from './components/Ethers_EIP2771_EIP712Sign';
import Ethers_Forward_EIP712Sign from './components/Ethers_Forward_EIP712Sign';
import Ethers_EIP2771_PersonalSign from './components/Ethers_EIP2771_PersonalSign';
import Web3_Custom_EIP712Sign from './components/Web3_Custom_EIP712Sign';
import Web3_Custom_PersonalSign from './components/Web3_Custom_PersonalSign';
import Web3_EIP2771_EIP712Sign from './components/Web3_EIP2771_EIP712Sign';
import Web3_EIP2771_PersonalSign from './components/Web3_EIP2771_PersonalSign';
import Web3_Custom_EIP712Sign_API from './components/Web3_Custom_EIP712Sign_API';
import Ethers_Custom_EIP712Sign_API from './components/Ethers_Custom_EIP712Sign_API';
import Web3_Custom_PersonalSign_API from './components/Web3_Custom_PersonalSign_API';
import Ethers_Custom_PersonalSign_API from './components/Ethers_Custom_PersonalSign_API';
import Web3_EIP2771_API from './components/Web3_EIP2771_API.js';
import Ethers_EIP2771_API from './components/Ethers_EIP2771_API';
import Ethers_Forward_PersonalSign from './components/Ethers_Forward_PersonalSign';
import Ethers_Forward_AllTokens from './components/Ethers_Forward_AllTokens';
import Gas_Estimation_Exercise from './components/Gas_Estimation_Exercise';

import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 700,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function App() {

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="App">
      <div className={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          className={classes.tabs}
        >
          <Tab label="Web3 + Custom + EIP712 Sign" {...a11yProps(0)} />
          <Tab label="Web3 + Custom + Personal Sign" {...a11yProps(1)} />
          <Tab label="Web3 + EIP2771 + EIP712 Sign" {...a11yProps(2)} />
          <Tab label="Web3 + EIP2771 + Personal Sign" {...a11yProps(3)} />
          <Tab label="Ethers + Custom + EIP712 Sign" {...a11yProps(4)} />
          <Tab label="Ethers + Custom + Personal Sign" {...a11yProps(5)} />
          <Tab label="Ethers + EIP2771 + EIP712 Sign" {...a11yProps(6)} />
          <Tab label="Ethers + EIP2771 + Personal Sign" {...a11yProps(7)} />
          <Tab label="Ethers + Forward + EIP712 Sign" {...a11yProps(8)} /> 
          <Tab label="Web3 + Custom + EIP712 Sign + API" {...a11yProps(9)} />
          <Tab label="Ethers + Custom + EIP712 Sign + API" {...a11yProps(10)} />
          <Tab label="Web3 + Custom + Personal Sign + API" {...a11yProps(11)} />
          <Tab label="Ethers + Custom + Personal Sign + API" {...a11yProps(12)} />
          <Tab label="Web3 + EIP2771 + API" {...a11yProps(13)} />
          <Tab label="Ethers + EIP2771 + API" {...a11yProps(14)} />
          <Tab label="Ethers + Forward + Personal Sign" {...a11yProps(15)} />
          <Tab label="Ethers + Forward + All Tokens" {...a11yProps(16)} />
          <Tab label="Gas + Estimation + Mainnet + Exercise" {...a11yProps(17)} />
          {/*To Be Added
             Ethers + Forward + Personal Sign
             Web3 + Forward + EIP712 Sign
             Web3 + Forward + Personal Sign
             Ethers + Forward Permit Execute + EIP712 Sign              
          */}
        </Tabs>

        <TabPanel value={value} index={0}>
          <Web3_Custom_EIP712Sign />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Web3_Custom_PersonalSign />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Web3_EIP2771_EIP712Sign />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Web3_EIP2771_PersonalSign />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Ethers_Custom_EIP712Sign />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <Ethers_Custom_PersonalSign/>
        </TabPanel>
        <TabPanel value={value} index={6}>
          <Ethers_EIP2771_EIP712Sign />
        </TabPanel>
        <TabPanel value={value} index={7}>
          <Ethers_EIP2771_PersonalSign />
        </TabPanel>
        <TabPanel value={value} index={8}>
          <Ethers_Forward_EIP712Sign />
        </TabPanel>
        <TabPanel value={value} index={9}>
          <Web3_Custom_EIP712Sign_API />
        </TabPanel>
        <TabPanel value={value} index={10}>
          <Ethers_Custom_EIP712Sign_API />
        </TabPanel>
        <TabPanel value={value} index={11}>
          <Web3_Custom_PersonalSign_API />
        </TabPanel>
        <TabPanel value={value} index={12}>
          <Ethers_Custom_PersonalSign_API />
        </TabPanel>
        <TabPanel value={value} index={13}>
          <Web3_EIP2771_API />
        </TabPanel>
        <TabPanel value={value} index={14}>
          <Ethers_EIP2771_API />
        </TabPanel>
        <TabPanel value={value} index={15}>
          <Ethers_Forward_PersonalSign />
        </TabPanel>
        <TabPanel value={value} index={16}>
          <Ethers_Forward_AllTokens />
        </TabPanel>
        <TabPanel value={value} index={17}>
          <Gas_Estimation_Exercise />
        </TabPanel>

      </div>
      <NotificationContainer />
    </div>
  );
}

export default App;
