import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { login, reset } from "../../features/auth/authSlice";
import Spinner from "../../components/Spinner";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
// import Link from '@mui/material/Link';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Header from "./Header";
import { FaSignInAlt } from "react-icons/fa";
import Cookies from "js-cookie";

function clearCookies() {
  Object.keys(Cookies.get()).forEach((cookieName) => {
    Cookies.remove(cookieName);
  });
  alert("All cookies cleared!");
}

const useStyles = makeStyles((theme) => ({
  tertiaryAction: {
    [theme.breakpoints.up("sm")]: {
      textAlign: "right",
    },
  },
  actions: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
    },
  },
}));

export default function Login(props) {
  //----------------------------CONSTS----------------------------

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const dispatch = useDispatch();

  const classes = useStyles();

  const content = {
    brand: { image: "images/logo.png", width: 200 },
    "02_header": "Login to view the Dashboard",
    "02_primary-action": "Sign in",
    "02_secondary-action": "Don't have an account?",
    "02_tertiary-action": "Forgot password?",
    ...props.content,
  };

  let brand;

  if (content.brand.image) {
    brand = (
      <img src={content.brand.image} alt="" width={content.brand.width} />
    );
  } else {
    brand = content.brand.text || "";
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  //----------------------------USE EFFECT----------------------------

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/dashboard");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  if (isLoading) {
    return <Spinner />;
  }

  //----------------------------MAIN----------------------------

  return (
    <div className="relative h-screen">
      <Header />

      <section>
        <Container maxWidth="xs">
          <Box pt={3} pb={10}>
            <Box mb={3} textAlign="center">
              <section className="heading">
                <h1>
                  <center>
                    <FaSignInAlt />
                    Login
                  </center>
                </h1>
              </section>
              <Typography variant="h5" component="h2">
                {content["02_header"]}
              </Typography>
            </Box>

            <Box>
              <form onSubmit={onSubmit}>
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  sx={{
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                  }}
                >
                  <Grid size={12}>
                    <TextField
                      variant="outlined"
                      className="loginemail"
                      required
                      fullWidth
                      name="email"
                      id="email"
                      value={email}
                      onChange={onChange}
                      label="Email address"
                      autoComplete="email"
                      style={{ backgroundColor: "white" }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      variant="outlined"
                      className="loginpassword"
                      required
                      fullWidth
                      name="password"
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={onChange}
                      autoComplete="current-password"
                      style={{ backgroundColor: "white" }}
                    />
                  </Grid>
                </Grid>

                <Box my={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="loginButton"
                  >
                    {content["02_primary-action"]}
                  </Button>
                </Box>

                <Grid container spacing={2} className={classes.actions}>
                  <Grid item xs={12} sm={6} className={classes.tertiaryAction}>
                    <Link to="/register" variant="body2">
                      {content["02_secondary-action"]}
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Box>
        </Container>
      </section>

      <div className="absolute bottom-10 container">
        <button
          onClick={clearCookies}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Clear All Cookies
        </button>
      </div>
    </div>
  );
}
