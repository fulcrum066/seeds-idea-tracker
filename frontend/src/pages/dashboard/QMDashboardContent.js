import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { Box } from "@mui/system";
import Grid from "@mui/material/Grid";
import ImagesFour from "../../components/Content/ImagesFour";
import PageOverview from "../../components/Content/PageOverview";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SettingsIcon from "@mui/icons-material/Settings";
import { Icon } from "@iconify/react";

const useStyles = makeStyles((theme) => ({
  media: {
    height: "256px",
  },
  mediaLarge: {
    minHeight: "256px",
    height: "100%",
  },
  maxHW: {
    height: "100%",
    width: "100%",
  },
  iconWrapper: {
    backgroundColor: theme.palette.secondary.main,
  },
  emptyCardContainer: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
  },
  emptyCard: {
    [theme.breakpoints.up("md")]: {
      height: 64,
      opacity: 0,
    },
  },
  imagesColumn: {
    order: 12,
    [theme.breakpoints.up("md")]: {
      order: 0,
    },
  },
}));

export default function QMDashboardContent() {
  const classes = useStyles();

  return (
    <section>
      <Container maxWidth="lg">
        <Box m={3}>
          <Grid container spacing={8}>
            <ImagesFour
              classes={classes}
              imageLinks={[
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                "https://images.unsplash.com/photo-1508780709619-79562169bc64?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
                "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
              ]}
            />

            <Grid item xs={12} md={6}>
              <Box display="flex" height="100%">
                <Box my="auto">
                  <PageOverview
                    title={"Welcome to the Dashboard"}
                    title2={""}
                    subtitle={"Explore your Micromax needs."}
                    classes={classes}
                    icons={[
                      <SummarizeIcon />,
                      <ManageSearchIcon />,
                      <Icon icon="cib:sap" className={`text-4xl`} />,
                      <SettingsIcon />,
                    ]}
                    iconLinks={[
                      "/dashboard/cia",
                      "/dashboard/cia/manage",
                      "/dashboard/sap",
                      "/dashboard/settings",
                    ]}
                    iconTitles={[
                      "Raise a CIA",
                      "Manage CIAs",
                      "F6",
                      "Account Settings",
                    ]}
                    iconSubtitles={[
                      "Raise a Continuous Improvement Action for any non-compliance, non-conformance or for identified improvements.",
                      "View, active, completed, download and re-assign CIAs here.",
                      "Query the SAP database.",
                      "Update account information here.",
                    ]}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </section>
  );
}
