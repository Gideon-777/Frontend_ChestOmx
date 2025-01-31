
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, Link } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Google from '../../assets/google.png';
import Github from '../../assets/github.png';
import LinkedIn from '../../assets/linkedin.png';
import logo from '../../assets/PMXLogo.png';
import { TextField, Button } from '@material-ui/core';
import axios from 'axios';
import { auth, githubProvider, googleProvider } from '../../utils/firebase_init';
import { hostname } from '../../utils/config';
import ParticlesComponent from '../includes/Particles';
import { toast } from 'react-toastify';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import Footer from '../includes/Footer';
import HumanVideo from '../../assets/video/human_-_37515 (Original).mp4';

const useStyles = makeStyles({
  root: {
    minWidth: 400,
    minHeight: 500,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '20px',
    paddingTop: '20px',
    background: '#203a43'
  },
  root1: {
    minWidth: 400,
    minHeight: 500,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '20px',
    paddingTop: '20px',
    background: 'transparent',
    boxShadow: "fuchsia"
  },
  textField: {
    width: '80%',
    margin: 10,
  },
  form: {
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    width: '82%',
    marginTop: 30,
    backgroundColor: "#203a43"
  },
  noAccount: {
    width: '80%',
    marginTop: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  notRegistered: {
    marginTop: '10px',
    marginBottom: '10px',
  }
});



export default function SimpleCard() {
  const history = useHistory();

  const classes = useStyles();
  const [values, setValues] = React.useState({
    email: '',
    password: '',
  });

  const [error, setError] = React.useState('');

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const SigninWithGithub = () => {
    auth.signInWithPopup(githubProvider).then(result => {
      localStorage.setItem('user_id', result.user.uid);
      result.user.getIdToken().then(token => {
        localStorage.setItem('token', token);
        history.push('/prediction/records');
      });
    }).catch(err => {
      setError(err);
    });
  }

  const { linkedInLogin } = useLinkedIn({
    clientId: '86c3mi7d3rbe29',
    redirectUri: `https://localhost:3000/callback`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
    onSuccess: (code) => {
      auth.signInWithCustomToken(code).then(res => {
        localStorage.setItem('token', res.user.refreshToken);
        localStorage.setItem('user_id', res.user.uid);
        history.push('/dashboard');
      }).catch(err => {
        toast.error(err.message || "Invalid Account details");
      })
      console.log(code);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const SigninWithGoogle = () => {
    auth.signInWithPopup(googleProvider).then(result => {
      localStorage.setItem('user_id', result.user.uid);
      result.user.getIdToken().then(token => {
        localStorage.setItem('token', token);
        history.push('/prediction/records');
      });
    }).catch(err => {
      setError(err);
    });
  }

  const onLoginButtonPressed = async () => {
    try {
      const res = await auth.signInWithEmailAndPassword(values.email, values.password);
      console.log('rest', res);
      // emailVerified
        // localStorage.setItem('token', res.user.refreshToken);


        res.user.getIdToken().then(token => {
          localStorage.setItem('token', token);
          // history.push('/prediction/records');

          localStorage.setItem('user_id', res.user.uid);
          history.push('/dashboard');
        });
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
    }
    // const data = {
    //   username: values.email,
    //   password: values.password
    // }
    // const tokenURL = `${hostname}:4002/api/token`;
    // axios.post(tokenURL, data).then(res => {
    //   if (res.data.token) {
    //     localStorage.setItem('token', res.data.token);
    //     localStorage.setItem('user_id_api', res.data.user_id);
    //     history.push('/prediction/records');
    //   } else {
    //     setError(res.data.message);
    //   }
    // }).catch(err => {
    //   console.log('error in login....', err);
    // });
  }


//   <div className="brand-logo">
//   <Link to="/dashboard">
//     <img src={Logo} className="logo-icon" alt="logo icon" />
//     {/* <h5 className="logo-text">Lobes</h5> */}
//   </Link>
// </div>


  return (
    <>
      {/* <ParticlesComponent /> */}
      <div className='login-sec '>
        <div className='login-head'>
        <Link to="/login">
            <img style={{ borderRadius: "20px" }} src={logo} height={100} width={100} alt="logo icon" />
        </Link>
          <div className='login-heading'>
            <Typography sx={{
              letterSpacing: "0px !important",
              fontSize: "50px",
              color: "black",
              padding: "10px 0 20px",
              fontWeight: "bold",
              textAlign: "center"
            }} component="h4" variant="h4">
              {/* Welcome */}
            </Typography>
            <Typography sx={{
              letterSpacing: "0px !important",
              color: "black",
              fontSize: "28px",
              fontWeight: "600",
              textAlign: "center"
            }} component="h4" variant="h4">
              {/* We are the best website */}
            </Typography>

          </div>



        </div>

        <Grid className='main_wrap' container component="main" sx={{
          background: '#000000',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>

          <CssBaseline />

          <Grid className='logo_wrap'
            item
            xs={12}
            sm={12}
            md={8}
            lg={9}
          >
            {/* <img style={{width: '100%'}} src='http://localhost:3000/static/media/logo.ca6cff4a.jpg'/> */}
            <video id="human_video" playsInline loop autoPlay muted>
              <source
                src={HumanVideo}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

          </Grid>

          <Grid className='login_wrap' item xs={12} sm={12} md={4} lg={3} sx={{ padding: "30px 25px", backgroundColor: "#00d8f5", zIndex: 9999 }} component={Paper} elevation={4} square>
            <Box>

              <Typography sx={{
                letterSpacing: "-2px !important",
                fontSize: "40px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#000"
              }} component="h4" variant="h4">
                Login
              </Typography>
              {/* <Typography sx={{
                letterSpacing: "0px !important",
                fontSize: "18px",
                textAlign: "center"
              }} component="h6" variant="h6">
                Login using a Social Network
              </Typography> */}

              {/* <Grid container sx={{ padding: "30px 0 15px", textAlign: "center" }}>
                <Grid item xs><img onClick={SigninWithGoogle} src={Google} width={70} height={70} alt="google" /></Grid>
                <Grid item xs><img onClick={SigninWithGithub} src={Github} width={60} height={60} alt="github" /></Grid>
                <Grid item xs><img onClick={linkedInLogin} src={LinkedIn} width={60} height={60} alt="linkedIn" /></Grid>
              </Grid> */}
              {/* <Grid container sx={{
                paddingBottom: "10px",
                alignItems: "center",
                display: "flex",
                flexWrap: "nowrap",
                gap: "10px",
                width: "100%", textAlign: "center"
              }}>
                <hr style={{ borderColor: "#4576c3", width: "50%", height: "0px" }} /> */}

                {/* <Typography sx={{
                  fontWeight: "semibold",
                  fontSize: "24px"
                }}> OR </Typography> */}

                {/* <hr style={{
                  borderColor: "#4576c3",
                  width: "50%",
                  height: "0px",
                }} />
              </Grid> */}

              <Box component="form" noValidate
                sx={{
                  mt: 1,
                  paddingTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column"
                }}>

                <TextField
                  className='field_wrap'
                  
                  id="standard-error"
                  label="Username"
                  placeholder="Username"
                  onChange={handleChange('email')}
                  variant='outlined'
                  type="email"
                />
                <TextField
                  className='field_wrap'
                  id="outlined-adornment-password"
                  label="Password"
                  placeholder="********"
                  onChange={handleChange('password')}
                  variant='outlined'
                  type="password"
                />
                {/* { error ? <p className={classes.error}>{error}</p> : null } */}
                <Button
                  id='signin_btn'
                  variant='contained'
                  color='#fff'
                  size='large'
                  onClick={onLoginButtonPressed}
                >
                  Sign In
                </Button>
                <div className={classes.notRegistered} style={{ textAlign: "center", color: "white" }}>Forgot your password <Link style={{
                  color: "#000",
                  textAlign: "center",
                  fontWeight: "600",
                  textDecoration: "none"
                }} to='/reset'>?Click here to reset it</Link></div>
                <p style={{
                  marginBottom: "0",
                  color: "white"
                }}>New Here?</p>
                <div className='' style={{ textAlign: "center", color: "white" }}><Link style={{
                  color: "#000",
                  fontWeight: "bold",
                  textDecoration: "none"
                }} to='/register'>Sign up </Link>and discover ChestOMX</div>
              </Box>
            </Box>
          </Grid>

        </Grid>
        <Footer />
      </div>

    </>
  );


}