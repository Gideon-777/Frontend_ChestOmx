
import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import logo from '../../assets/PMXLogo.png';
import { TextField, Button } from '@material-ui/core';
import { auth, githubProvider, googleProvider, db } from '../../utils/firebase_init';
import ParticlesComponent from '../includes/Particles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Google from '../../assets/google.png';
import Github from '../../assets/github.png';
import LinkedIn from '../../assets/linkedin.png';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import Footer from '../includes/Footer';
import HumanVideo from '../../assets/video/human_-_37515 (Original).mp4';
import axios from 'axios';
import { hostname, port } from '../../utils/config';

export default function SignUp() {
  const history = useHistory();
  const [values, setValues] = React.useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    country: "Korea, South",
    phone: '',
    profession: '',
    institution: '',
  });

  const [_, setError] = React.useState('');

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const SignupWithGithub = () => {
    auth.signInWithPopup(githubProvider).then(result => {
      localStorage.setItem('user_id', result.user.uid);
      localStorage.setItem('token', result.credential.accessToken);
      history.push('/activate');
    }).catch(err => {
      setError(err);
    });
  }

  const SignupWithGoogle = () => {
    auth.signInWithPopup(googleProvider).then(result => {
      localStorage.setItem('user_id', result.user.uid);
      localStorage.setItem('token', result.credential.accessToken);
      history.push('/activate');
    }).catch(err => {
      setError(err);
    });
  }

  //  const SignupWithLinkedIn = () => {
  const { linkedInLogin } = useLinkedIn({
    clientId: '86c3mi7d3rbe29',
    redirectUri: `https://localhost:3000/callback`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
    onSuccess: (code) => {
      console.log(code);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // var oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86c3mi7d3rbe29&scope=r_liteprofile&state=123456&redirect_uri=http://localhost:3000/callback`
  // var width = 450,
  //   height = 730,
  //   left = window.screen.width / 2 - width / 2,
  //   top = window.screen.height / 2 - height / 2;

  // window.open(
  //   oauthUrl,
  //   "Linkedin",
  //   "menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=" +
  //     width +
  //     ", height=" +
  //     height +
  //     ", top=" +
  //     top +
  //     ", left=" +
  //     left
  // );

  // }

  const onSignupButtonPressed = async () => {
    try {
      if (values.password !== values.passwordConfirm) {
        toast.error('Passwords do not match');
        // setError('Passwords do not match');
      } else {
        const res = await auth.createUserWithEmailAndPassword(values.email, values.password);
        const user = res.user;
        // await db.collection("users").doc(user.uid).set({
        //   uid: user.uid,
        //   name: values.name,
        //   country: values.country,
        //   phone: values.phone,
        //   profession: values.profession,
        //   institution: values.institution,
        //   email: values.email,
        // });

                      
        const data = {
          user_id: user.uid,
          username: values.email,
          email: values.email,
          name: values.name,
          country: values.country,
          phone: values.phone,
          profession: values.profession,
          institution: values.institution,
      };
      const tokenURL = `${hostname}:${port}/activate_user`;
                 
        axios.post(tokenURL, data).then(res => {
            
            if (res.data.message === 'User created successfully') {
                // history.push('/prediction/records');
                history.push("/login");
                toast.success('User created successfully. You can now login.');
            } else {
                setError(res.data.message);
            }
        }).catch(err => {
            
            setError(err);
        });
        
        
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
    }
  }
  return (
    <>
      {/* <ParticlesComponent /> */}
      <div className='login-sec'>
        <div className='login-head'>
        <Link to="/login"><img style={{ borderRadius: "20px" }} src={logo} height={100} width={200} alt="imagesh" /></Link>
          <div className='login-heading'>
            <Typography sx={{
              letterSpacing: "0px !important",
              fontSize: "60px",
              color: "black",
              padding: "10px 0 20px",
              fontWeight: "bold",
              textAlign: "center"
            }} component="h4" variant="h4">
             
            </Typography>
            <Typography sx={{
              letterSpacing: "0px !important",
              color: "black",
              fontSize: "28px",
              fontWeight: "600",
              textAlign: "center"
            }} component="h4" variant="h4">
            
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
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            {/* <ParticlesComponent /> */}
            <video id="human_video" playsInline loop autoPlay muted>
              <source
                src={HumanVideo}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Grid>

          <Grid className='login_wrap' item xs={12} sm={12} md={4} lg={3} sx={{ padding: "30px 25px", backgroundColor: "#00d8f5", zIndex: 9999 }} component={Paper} elevation={6} square>
            <Box>
              <Typography sx={{
                letterSpacing: "-2px !important",
                fontSize: "40px",
                paddingBottom: "30px",
                fontWeight: "bold",
                color: "#000",
                textAlign: "center"
              }} component="h4" variant="h4">
                Register
              </Typography>
              {/* <Typography sx={{
                letterSpacing: "0px !important",
                fontSize: "18px",
                textAlign: "center"
              }} component="h6" variant="h6">
                Register using a Social Network
              </Typography>

              <Grid container sx={{ padding: "30px 0 15px", textAlign: "center" }}>
                <Grid item xs><img onClick={SignupWithGoogle} src={Google} width={70} height={70} alt="google" /></Grid>
                <Grid item xs><img onClick={SignupWithGithub} src={Github} width={60} height={60} alt="github" /></Grid>
                <Grid item xs><img onClick={linkedInLogin} src={LinkedIn} width={60} height={60} alt="linkedIn" /></Grid>
              </Grid>
              <Grid container sx={{
                paddingBottom: "10px",
                alignItems: "center",
                display: "flex",
                flexWrap: "nowrap",
                gap: "10px",
                width: "100%", textAlign: "center"
              }}>
                <hr style={{ borderColor: "#4576c3", width: "50%", height: "0px" }} />

                <Typography sx={{
                  fontWeight: "semibold",
                  fontSize: "24px"
                }}> OR </Typography>

                <hr style={{
                  borderColor: "#4576c3",
                  width: "50%",
                  height: "0px",
                }} />
              </Grid> */}

              <Box component="form" noValidate
                sx={{
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column"
                }}>

                <Box className='field_row'>
                  <Grid sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    width: "100%",
                    gap: "15px"

                  }}>
                    <Grid sm={6}>
                      <TextField
                        className='field_wrap'
                        id="standard-error"
                        label="Name"
                        placeholder="Name"
                        onChange={handleChange('name')}
                        variant='outlined'
                        type="text"
                      />
                    </Grid>
                    <Grid sm={6}>
                      <TextField
                        className='field_wrap'
                        id="standard-error"
                        label="Country"
                        placeholder="Country"
                        onChange={handleChange('country')}
                        variant='outlined'
                        type="text"

                      />
                    </Grid>

                  </Grid>

                </Box>
                <PhoneInput
                  inputClass='field_wrap'
                  country={'kr'}
                  onChange={phone => setValues({ ...values, ["phone"]: phone })}
                />
                <TextField
                  className='field_wrap'
                  id="standard-error"
                  label="Email"
                  placeholder="Email"
                  onChange={handleChange('email')}
                  variant='outlined'
                  type="email"
                />

                <Box className='field_row'>
                  <Grid sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    width: "100%",
                    gap: "15px"

                  }}>

                    <Grid sm={6}>
                      <TextField
                        className='field_wrap'
                        id="standard-error"
                        label="Institution"
                        placeholder="Institution"
                        onChange={handleChange('institution')}
                        variant='outlined'
                        type="text"
                      />
                    </Grid>
                    <Grid sm={6}>
                      <TextField
                        className='field_wrap'
                        id="standard-error"
                        label="Profession"
                        placeholder="Profession"
                        onChange={handleChange('profession')}
                        variant='outlined'
                        type="text"
                      />
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  className='field_wrap'
                  id="outlined-adornment-password"
                  label="Password"
                  placeholder="********"
                  onChange={handleChange('password')}
                  variant='outlined'
                  type="password"
                />
                <TextField
                  className='field_wrap'
                  id="outlined-adornment-password"
                  label="Confirm Password"
                  placeholder="********"
                  onChange={handleChange('passwordConfirm')}
                  variant='outlined'
                  type="password"

                />
                {/* { error ? <p className={classes.error}>{error}</p> : null } */}
                <Button
                  type="button"
                  id='signin_btn'
                  variant='contained'
                  color='#000'
                  size='large'
                  onClick={onSignupButtonPressed}

                >
                  Sign Up
                </Button>

                <p style={{
                  marginBottom: "0",
                  color: "white"
                }}>One Of Us?</p>
                <div className='' style={{ textAlign: "center", color: "white" }}>
                  If you already have an account, just
                  <Link style={{
                    color: "#000",
                    fontWeight: "bold",
                    textDecoration: "none"
                  }} to='/login'> sign in</Link>
                </div>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </div>
      <Footer />
    </>

  );
}