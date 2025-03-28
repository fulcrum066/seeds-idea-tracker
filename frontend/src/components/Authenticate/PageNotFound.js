import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

export default function PageNotFound(props) {
  // console.log(props)
  const content = {
    code: "404",
    header: "Page not found",
    description: "The requested page could not be located.",
    "primary-action": "Go Back",
    ...props.content,
  };
  const currentUrl = window.location.pathname;

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="container">
      <Header />

      <section>
        <br />
        <Container maxWidth="md">
          <Box pt={8} pb={10} textAlign="center">
            <Typography variant="h1">{content["code"]}</Typography>
            <Typography variant="h4" component="h2" gutterBottom={true}>
              {content["header"]}
            </Typography>
            <br></br>
            <Typography variant="subtitle1" color="textSecondary">
              {currentUrl}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {content["description"]}
            </Typography>
            <Box mt={4}>
              <Button variant="contained" color="primary" onClick={goBack}>
                {content["primary-action"]}
              </Button>
            </Box>
          </Box>
        </Container>
      </section>
    </div>
  );
}
