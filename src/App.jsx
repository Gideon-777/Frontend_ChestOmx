import React, { Component, useState } from 'react';

import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Home from './components/Home';
import Prediction from './components/prediction2D/Prediction';
import Login from './components/authentication/Login';
import SignUp from './components/authentication/SignUp';
import Activate from './components/Activate';
import Terms from './components/Terms';
import PredictionRecords from './components/prediction2D/PredictionRecords';
import PredictionNew from './components/prediction2D/PredictionNew';
import Inference from './components/Inference';
import Dashboard from './components/HomeNew';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideNav from './components/includes/SideNav';
import Header from './components/includes/Header';
import Profile from './components/profile';
import { auth } from './utils/firebase_init';
import ResetPassword from './components/authentication/ResetPassword';
import ParticlesComponent from './components/includes/Particles';
import Footer from './components/includes/Footer';
// Load 'opencv.js' assigning the value to the global variable 'cv'

const outerTheme = createTheme({
  palette: {
    primary: {
         main: '#203a43', 
    },
    secondary: {
      main: '#0e00f0',
    },
    white: {
      main: '#ffffff',
    },
    warning: {
      main: '#cc3300',
    }
  },
});

const RouteWithLayout = props => {
  const { layout: Layout, component: Component, ...rest } = props;

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Layout>
          <Component {...matchProps} />
        </Layout>
      )}
    />
  );
};

const RouteWithNavigations = props => {
  const { component: Component, ...rest } = props;

  const [wrapperclass , setWrapperClass] = useState("");

  const toggleWrapperClass = () => {
    const newWrapperClass = wrapperclass ? "" : "toggled"
    setWrapperClass(newWrapperClass)
  }

  return (
    <Route
      {...rest}
      render={matchProps => {
        if(localStorage.getItem("user_id")){
        return (
        <div id="wrapper" className={wrapperclass}>
          <ParticlesComponent />
          <div className="clearfix" />
          <SideNav />
          <Header toggleWrapperClass={toggleWrapperClass} />
          <Component {...matchProps} />
          {/* <Footer /> */}
        </div>
        )
        }else {
          return (
            <Redirect to="/login" />
          )

        }
      }}
    />
  );
};
class App extends Component {
  render() {
    return (
      <ThemeProvider theme={outerTheme}>
        <ToastContainer position="top-center" />
        <BrowserRouter basename="/">
        <RouteWithNavigations path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/reset" component={ResetPassword} />
          <Route path="/register" component={SignUp} />
          <Route path="/terms" component={Terms} />
          <Route path="/activate" component={Activate} />
          <RouteWithNavigations
            path="/prediction/:patientId/:uniqueId/:accessKey"
            component={Prediction}
          />
          <RouteWithNavigations
            path="/prediction/new"

            component={Dashboard}
            //component={PredictionNew}
          />
          <RouteWithNavigations
            path="/profile"
            component={Profile}
          />
          <RouteWithNavigations
            path="/prediction/records"
            component={PredictionRecords}
          />
          <RouteWithLayout
            path="/inference"
            component={Inference}
            layout={Home}
            />
          <Route exact path="/">
            <Redirect to="/login"></Redirect>
          </Route>
        </BrowserRouter>
        
      </ThemeProvider>
    );
  }
}

export default App;
