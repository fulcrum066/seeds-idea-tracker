import * as React from "react";
import { makeStyles } from "@mui/styles";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link as MuiLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  iconWrapper: {
    minWidth: 40,
  },
}));

const NavBarLinks = ({ content, length }) => {
  const classes = useStyles();

  return (
    <>
      <ListItem
        button
        component={MuiLink}
        to={content.route[length]}
        key={length}
        className="navBarListItem"
      >
        <ListItemIcon className={classes.iconWrapper}>
          {content.icon[length]}
        </ListItemIcon>
        <ListItemText primary={content.name[length]} />
      </ListItem>
    </>
  );
};

export default NavBarLinks;
