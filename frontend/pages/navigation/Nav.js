import React from "react";
import { makeStyles } from "@mui/styles";
import Navigation from "../../components/Navigation/Navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import { FaPaperPlane } from "react-icons/fa";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { FaEye, FaSearch } from "react-icons/fa";
import CallToActionIcon from "@mui/icons-material/CallToAction";
import DoneIcon from "@mui/icons-material/Done";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.hint,
  },
}));

export default function Nav({ main }) {
  //------------------ATTRIBUTES/VARIABLES------------------

  const classes = useStyles();

  const { user } = useSelector((state) => state.auth);

  // --------------------------useEffects----------------------------

  //------------------FUNCTIONS------------------

  //------------

  //----------------FOR AVATAR DROP DOWN MENU----------------
  function getLink() {
    var link = {
      brand: { image: "/images/logo.png", width: 110 },
      "brand-mobile": { image: "/images/logo.png", width: 110 },
      name: [],
      route: [],
      icon: [],
      settings: ["Raise CIA", "Manage CIA", "Settings", "Logout"],
      settingsLink: [
        "/dashboard/cia",
        "/dashboard/cia/manage",
        "/dashboard/settings",
        "/logout",
      ],
      notifications: [],
      notificationsLink: [],
      notificationsIcon: [],
      //avatar: 'https://media.istockphoto.com/photos/businessman-silhouette-as-avatar-or-default-profile-picture-picture-id476085198?b=1&k=20&m=476085198&s=612x612&w=0&h=Ov2YWXw93vRJNKFtkoFjnVzjy_22VcLLXZIcAO25As4=',
    };

    //----------------------------------------------------------------------------------------------------------
    if (user.roles.includes("employee")) {
      link.name = ["Dashboard", "Settings", "Logout"];

      link.route = ["/dashboard", "/dashboard/settings", "/logout"];

      link.icon = [
        <DashboardIcon className={classes.icon} />,
        <SettingsIcon className={classes.icon} />,
        <ExitToAppIcon className={classes.icon} />,
      ];
    } //----------------------------------------------------------------------------------------------------------
    else if (user.roles.includes("qm")) {
      link.name = ["Dashboard", "Settings", "Logout"];

      link.route = ["/dashboard", "/dashboard/settings", "/logout"];

      link.icon = [
        <DashboardIcon className={classes.icon} />,
        <SettingsIcon className={classes.icon} />,
        <ExitToAppIcon className={classes.icon} />,
      ];

      link.notificationsIcon = [
        <FaPaperPlane />,
        <FaEye />,
        <FaSearch />,
        <CallToActionIcon />,
        <DoneIcon />,
        <VerifiedUserIcon />,
        <VisibilityIcon />,
      ];
    } //----------------------------------------------------------------------------------------------------------

    return link;
  }

  return (
    <React.Fragment>
      <Navigation content={getLink()} bucketMain={main} />
    </React.Fragment>
  );
}
