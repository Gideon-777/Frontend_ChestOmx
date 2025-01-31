import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import './Wrapper.css';


const useStyles = makeStyles({
    wrapper: {
        // height: '100%',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-between',
        background: 'linear-gradient(to top right, #007991, #203a43)',
        padding: "50px",
    },
});
export default function Wrapper(props) {
    const classes = useStyles();
  
    return (
        <div className={classes.wrapper}>
            {/* <Container fixed> */}
            {props.children}
        {/* </Container> */}
        </div>
    );
  }