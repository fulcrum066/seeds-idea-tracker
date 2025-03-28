import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { useTheme } from "@emotion/react";

// import { makeStyles } from '@mui/styles';

// const useStyles = makeStyles((theme) => ({
//   icon: {
//       iconWrapper: theme.palette.secondary,
//   },
// }));

// const classes = useStyles()

{
  /* <PageOverview
title={"Welcome to the Dashboard"}
title2={""}
subtitle={"Track your progress and gain control over your goals."}
classes={classes}
icons={[<Fa />,]}
iconLinks={['/dashboard/',]}
iconTitles={['Dashboard',]}
iconSubtitles={['...',]}
/> */
}

const PageOverview = ({
  title,
  title2,
  subtitle,
  classes,
  icons,
  iconLinks,
  iconTitles,
  iconSubtitles,
}) => {
  return (
    <div>
      <Typography variant="h3" component="h3" gutterBottom={true}>
        <Typography color="text1" variant="h3" component="span">
          {title}
        </Typography>
        <Typography variant="h3" color="text3" component="span">
          {" "}
          {title2}
        </Typography>
      </Typography>
      <Typography variant="subtitle1" color="text2" paragraph={true}>
        {subtitle}
      </Typography>

      <Box mt={6}>
        <Grid container spacing={4}>
          {icons.map((icon, length) => {
            return (
              <Grid item xs={6} md={5} key={length}>
                <Box mb={2}>
                  <Link to={iconLinks[length]}>
                    <Avatar variant="rounded" className={classes.iconWrapper}>
                      {icon}
                    </Avatar>
                  </Link>
                </Box>

                <div>
                  <Link to={iconLinks[length]}>
                    <Typography variant="h6" component="h3" gutterBottom={true}>
                      {iconTitles[length]}
                    </Typography>
                  </Link>
                  <Typography variant="body2" component="p" color="text3">
                    {iconSubtitles[length]}
                  </Typography>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </div>
  );
};

export default PageOverview;
