import React from "react";
import { makeStyles } from "@mui/styles";
import Navigation from "../../components/Navigation/Navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AccountBox from "@mui/icons-material/AccountBox";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import { FaPaperPlane } from "react-icons/fa";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { FaEye, FaSearch } from "react-icons/fa";
import CallToActionIcon from "@mui/icons-material/CallToAction";
import DoneIcon from "@mui/icons-material/Done";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.hint,
  },
}));

export default function Nav({ main }) {
  //------------------ATTRIBUTES/VARIABLES------------------

  const classes = useStyles();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

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
      link.name = [
        "Dashboard",
        "CIAs",
        "F6",
        "Sales Management",
        "Projects",
        "Reporting",
        "Business Calendar",
        "Catalogue",
        "Visitor Management",
        "Settings",
        "Logout",
      ];

      link.route = [
        "/dashboard",
        "/dashboard/cia-dashboard",
        "/dashboard/sap",
        "/dashboard/sales-management",
        "/dashboard/projects",
        "/dashboard/reporting",
        "/dashboard/business-calendar",
        "/dashboard/catalogue",
        "/dashboard/visitors-dashboard",
        "/dashboard/settings",
        "/logout",
      ];

      link.icon = [
        <DashboardIcon className={classes.icon} />,
        <SummarizeIcon className={classes.icon} />,
        // <ManageSearchIcon className={classes.icon} />,
        // <Icon
        //   icon="game-icons:archive-register"
        //   className={`${classes.icon} text-2xl`}
        // />,
        <Icon icon="cib:sap" className={`${classes.icon} text-3xl`} />,
        <Icon
          icon="material-symbols:point-of-sale-sharp"
          className={`${classes.icon} text-3xl`}
        />,
        <Icon
          icon="carbon:report-data"
          className={`${classes.icon} text-2xl`}
        />,
        <Icon
          icon="material-symbols:task"
          className={`${classes.icon} text-2xl`}
        />,
        <Icon
          icon="material-symbols:calendar-add-on-sharp"
          className={`${classes.icon} text-2xl`}
        />,
        <BackupTableIcon className={classes.icon} />,
        <AccountBox className={classes.icon} />,

        <SettingsIcon className={classes.icon} />,
        <ExitToAppIcon className={classes.icon} />,
      ];

      link.notifications = [
        "Review & Classify",
        "Root Cause Analysis",
        "Improvement Action",
        "Improvement Action Verification",
        "Finalize",
        "Re-review",
      ];

      link.notificationsLink = [
        "/dashboard/cias/owned/review-and-classify",
        "/dashboard/cias/owned/root-cause-analysis",
        "/dashboard/cias/owned/improvement-action",
        "/dashboard/cias/owned/improvement-action-verification",
        "/dashboard/cias/owned/finalize",
        "/dashboard/cias/owned/review",
      ];
    } //----------------------------------------------------------------------------------------------------------
    else if (user.roles.includes("qm")) {
      link.name = [
        "Dashboard",
        "CIAs",
        "F6",
        "Sales Management",
        "Projects",
        "Reporting",
        "Business Calendar",
        "Catalogue",
        "Visitor Management",
        "Settings",
        "Logout",
      ];

      link.route = [
        "/dashboard",
        "/dashboard/cia-dashboard",
        "/dashboard/sap",
        "/dashboard/sales-management",
        "/dashboard/projects",
        "/dashboard/reporting",
        "/dashboard/business-calendar",
        "/dashboard/catalogue",
        "/dashboard/visitors-dashboard",
        "/dashboard/settings",
        "/logout",
      ];

      link.icon = [
        <DashboardIcon className={classes.icon} />,
        <SummarizeIcon className={classes.icon} />,
        // <ManageSearchIcon className={classes.icon} />,
        // <Icon
        //   icon="game-icons:archive-register"
        //   className={`${classes.icon} text-2xl`}
        // />,
        <Icon icon="cib:sap" className={`${classes.icon} text-3xl`} />,
        <Icon
          icon="material-symbols:point-of-sale-sharp"
          className={`${classes.icon} text-3xl`}
        />,
        <Icon
          icon="carbon:report-data"
          className={`${classes.icon} text-2xl`}
        />,
        <Icon
          icon="material-symbols:task"
          className={`${classes.icon} text-2xl`}
        />,
        <Icon
          icon="material-symbols:calendar-add-on-sharp"
          className={`${classes.icon} text-2xl`}
        />,
        <BackupTableIcon className={classes.icon} />,
        <AccountBox className={classes.icon} />,
        <SettingsIcon className={classes.icon} />,
        <ExitToAppIcon className={classes.icon} />,
      ];

      link.notifications = [
        "Assign",
        "Review & Classify",
        "Root Cause Analysis",
        "Improvement Action",
        "Improvement Action Verification",
        "Finalize",
        "Re-review",
      ];

      link.notificationsLink = [
        "/dashboard/cias/assign",
        "/dashboard/cias/owned/review-and-classify",
        "/dashboard/cias/owned/root-cause-analysis",
        "/dashboard/cias/owned/improvement-action",
        "/dashboard/cias/owned/improvement-action-verification",
        "/dashboard/cias/owned/finalize",
        "/dashboard/cias/owned/review",
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
