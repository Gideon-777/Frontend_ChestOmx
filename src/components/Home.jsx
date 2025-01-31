import React, { useState } from 'react';
import {
  Toolbar,
  IconButton,
  AppBar,
  makeStyles,
  Typography
} from '@material-ui/core';
import clsx from "clsx";
import MenuIcon from '@material-ui/icons/Menu';
import Sidebar from './includes/Sidebar';
const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    width: '100%',
    height: '100%',
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    height: 64,
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    // marginLeft: -drawerWidth,
    // display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // height: '100%',
    width: '100%',
    marginTop: 64,
    height: '100%',
    // marginLeft: 10
  },
  contentShift: {
    // transition: theme.transitions.create("margin", {
    //   easing: theme.transitions.easing.easeOut,
    //   duration: theme.transitions.duration.enteringScreen
    // }),
    display: 'flex',
    marginTop: 64,
    marginLeft: drawerWidth + 20,
  },
  title: {
    fontWeight: 600,
    paddingLeft: 20,
    color: 'black',
  }
}));


export default function Home(props) {
  const { children } = props;
  const classes = useStyles();
  const [openSidebar, setOpenSidebar] = useState(false);
  const handleSideBar = (sidebarState) => {
    setOpenSidebar(sidebarState);
  }
  const toggleSideBar = () => {
    handleSideBar(!openSidebar);
  }
  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: openSidebar,
        })}
      >
        <Toolbar>
          <IconButton
            color="white"
            aria-label="open drawer"
            edge="end"
            onClick={toggleSideBar}
            className={clsx(openSidebar && classes.hide)}
          >
            <MenuIcon color='black' />
            <Typography variant="h6" noWrap className={classes.title}>
              ChestOmX
          </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar
             className="hello"
             open={openSidebar}
             handleSideBar={handleSideBar}
             variant={'temporary'}
     
      >
      </Sidebar>


      <div 
      className={clsx(classes.content, {
        [classes.contentShift]: openSidebar,
      })}>
        {children}
      </div>
    </div>

  );
}
