import React, { useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { makeStyles } from '@material-ui/styles';
import {
  Divider,
  Drawer,
  List,
  ListItem,
  Button,
  Typography,
  useTheme,
  IconButton,
  Grid,
} from '@material-ui/core';
import {
  ExitToApp,
  People,
  Dashboard,
} from '@material-ui/icons';
import logo from '../../assets/PMXLogo.png';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import ScoreIcon from '@mui/icons-material/Score';
import CTSSMap from '../CTSSMap';

const useStyles = makeStyles((theme) => {
  
  return ({
    drawer: {
      width: 240,
    },
    root: {
      //   backgroundColor: theme.palette.white,
      display: 'flex',
      flexDirection: 'column',
      // height: '100%',
      //   padding: theme.spacing(2)
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      // padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      // ...theme.mixins.toolbar,
      justifyContent: "flex-end"
    },
    button: {
      width: '100%',
      height: 50,
    },
    pageTitle: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: 500,
      width: '100%',
    },
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modelsListItem: {
      display: 'flex',
      flexDirection: 'column'
    },
    modelList: {
      minWidth: '85%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: 2
    },
    imageWrapper: {
      minHeight: 200,
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
  })
});

export default function Sidebar(props) {

  const theme = useTheme();
  
  const pages = [
    {
      title: 'NewPrediction',
      type: 'link',
      href: '/prediction/new',
      icon: < AddIcon/>
    },
    {
      title: 'Predictiosssssns',
      type: 'link',
      href: '/prediction/records',
      icon: <ViewListIcon />
    },
    {
      title: 'CTSSMap',
      type: 'modal',
      icon: <ScoreIcon />
    },
    {
      title: 'Logout',
      type: 'link',
      href: '/login',
      icon: <ExitToApp />
    },

  ];


  const classes = useStyles();
  const { open, variant, handleSideBar, className, ...rest } = props;

  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={() => handleSideBar(false)}
      open={open}
      variant={'persistent'}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={() => handleSideBar(false)}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <div className={classes.imageWrapper}>
      </div>
      <Divider />
      <div
        {...rest}
        className={clsx(classes.root, className)}
      >
        <List>
            {pages.map((page, index) => {
              if(page.type === 'link') {
                return(
              <Link to={page.href}>
                <ListItem
                    className={classes.modelsListItem}
                    button
                    key={index}
                    component={'p'}
                >
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                    >
                        <Grid item>
                            {page.icon}
                        </Grid>
                        <Grid item>
                            <Typography
                                className={classes.pageTitle}
                                variant="h6"
                            >
                                {page.title}
                            </Typography>
                        </Grid>
                    </Grid>
                </ListItem>
                </Link>);
              }
              else if(page.type === 'modal') {
                return (
                  <ListItem
                      className={classes.modelsListItem}
                      button
                      key={index}
                      component={'a'}
                      onClick={() => setModalOpen(true)}
                  >
                      <Grid
                          container
                          direction="row"
                          justify="flex-start"
                          alignItems="center"
                      >
                          <Grid item>
                              {page.icon}
                          </Grid>
                          <Grid item>
                              <Typography
                                  className={classes.pageTitle}
                                  variant="h6"
                              >
                                  {page.title}
                              </Typography>
                          </Grid>
                      </Grid>
                  </ListItem>);
              }
            })}
        </List>
      </div >
      <CTSSMap 
      open={modalOpen} 
      onClose={(reason) => {
        console.log("clicked close!!", reason);
        setModalOpen(false);
       }}
      />
    </Drawer >
  );
}        

