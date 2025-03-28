import * as React from "react";
import { makeStyles } from "@mui/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as MuiLink, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import NavBarLinks from "./NavBarLinks";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.dark,
  },
  toolbar: {
    minHeight: 70,
  },
  menuButton: {
    display: "none",
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("md")]: {
      display: "inline-flex",
    },
  },
  linkBrand: {
    lineHeight: 1,
    marginRight: "auto",
  },
  iconWrapper: {
    minWidth: 40,
  },
  icon: {
    color: theme.palette.text.hint,
  },
  drawerRoot: {
    width: 270,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  drawerContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(3),
    width: 270,
  },
  profile: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  content: {
    flexGrow: 1,
    //backgroundImage: "url(/images/bg/pattern1.png)",
    backgroundColor: "Snow",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  bottom: {
    bottom: 0,
    display: "flex",
    flexDirection: "column-reverse",
    height: "100%",
  },
  mainSpacing: {
    padding: theme.spacing(3),
  },
}));

export default function Navigation(props) {
  const classes = useStyles();
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const content = {
    brand: { image: "/images/logo.png", width: 110 },
    "brand-mobile": { image: "/images/logo.png", width: 110 },
    name: [],
    route: [],
    icon: [],
    settings: [],
    settingsLink: [],
    notifications: [],
    notificationsLink: [],
    notificationsIcon: [],
    avatar:
      "https://media.istockphoto.com/photos/businessman-silhouette-as-avatar-or-default-profile-picture-picture-id476085198?b=1&k=20&m=476085198&s=612x612&w=0&h=Ov2YWXw93vRJNKFtkoFjnVzjy_22VcLLXZIcAO25As4=",
    ...props.content,
  };

  let brand = content["brand"].text || "";
  let brandMobile = content["brand-mobile"].text || "";

  if (content["brand"].image) {
    brand = (
      <img src={content["brand"].image} alt="" width={content["brand"].width} />
    );
  }

  if (content["brand-mobile"].image) {
    brandMobile = (
      <img
        src={content["brand-mobile"].image}
        alt=""
        width={content["brand-mobile"].width}
      />
    );
  }

  const buckets = {
    main: Array.isArray(props.bucketMain) ? props.bucketMain : [],
  };

  const [state, setState] = React.useState({ open: false });

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, open });
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          <Link
            href="/dashboard"
            color="inherit"
            underline="none"
            variant="h5"
            className={classes.linkBrand}
          >
            {brand}
          </Link>

          {/* <IconButton color="inherit" className={classes.profile}>
                        <Badge badgeContent={0} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton> */}

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 0 }}
                color="inherit"
                className={classes.profile}
              >
                <Avatar
                  alt=""
                  src={content["avatar"]}
                  sx={{ width: 50, height: 50 }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {content.settings.map((setting, index) => (
                <MuiLink to={content.settingsLink[index]} key={index}>
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                </MuiLink>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer className={classes.drawerRoot} variant="permanent">
        <Toolbar className={classes.toolbar} />
        <div className={classes.drawerContainer}>
          <List>
            {content.name.map((name, length) => (
              <NavBarLinks
                content={content}
                length={length}
                key={length}
                className="navBarListItem"
              />
            ))}
          </List>
        </div>
      </Drawer>

      <Drawer anchor="left" open={state.open} onClose={toggleDrawer(false)}>
        <div className={classes.drawerContainer}>
          <Box
            mb={1}
            ml={2}
            pb={2}
            border={1}
            borderTop={0}
            borderLeft={0}
            borderRight={0}
            borderColor="background.emphasis"
          >
            <Link
              href="#"
              color="primary"
              underline="none"
              variant="h5"
              className={classes.linkBrand}
            >
              {brandMobile}
            </Link>
          </Box>
          <List>
            {content.name.map((name, length) => (
              <NavBarLinks content={content} length={length} key={length} />
            ))}
          </List>
        </div>
      </Drawer>

      <Grid container style={{ height: "100vh" }} spacing={0}>
        <main className={classes.content}>
          <Toolbar className={classes.toolbar} />
          <div className={classes.mainSpacing}>
            {buckets["main"].map((component, length) => (
              <React.Fragment key={length}>{component}</React.Fragment>
            ))}
          </div>
          {/* <Chatbox /> */}
        </main>
      </Grid>
    </div>
  );
}
