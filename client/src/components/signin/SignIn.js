import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link as RouterLink, useHistory } from "react-router-dom";
import Cookies from 'universal-cookie';

import APIKit, { setClientToken } from '../APIKit';

const useStyles = makeStyles((theme) => ({
  paper: {
    // marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


export default function SignIn() {
  const classes = useStyles();

  const cookies = new Cookies();
  const history = useHistory();

  const [formState, setFormState] = useState({
    username: '',
    password: ''
  });

  const submitLoginHandler = async (e) => {
    e.preventDefault();
    
    console.log(formState);

    const onSuccess = ({data}) => {
      // Set Web Token on success
      setClientToken(data.token);
      // set a cookie
      cookies.set('user', data.user);
      history.push('/chats');
    };

    const onFailure = error => {
      console.log(error && error.response);      
    };

    APIKit.post('/login/', formState)
      .then(onSuccess)
      .catch(onFailure);
  }

  const onInputChangeHandler = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form}
              onSubmit={submitLoginHandler}
              noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formState.username}
            autoFocus
            onChange={onInputChangeHandler}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formState.password}
            onChange={onInputChangeHandler}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item>
              <RouterLink to="/register">{"Don't have an account? Sign Up"}</RouterLink>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}