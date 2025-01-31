
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { useHistory } from 'react-router-dom';
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
} from '@material-ui/core';
import Wrapper from './wrapper/Wrapper.js';
import axios from 'axios';

import { hostname, countries } from '../utils/config.js';

const useStyles = makeStyles({
  root: {
    minWidth: 400,
    minHeight: 500,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  textField: {
    width: '100%',
    maxWidth: '300px',
    // margin: 10,
    marginTop: 20,
  },
  selectField: {
    // width: '80%',
    // margin: 10,
    maxWidth: '300px',
    marginTop: 20,
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
  },
  noAccount: {
    width: '80%',
    marginTop: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  formBody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  formLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingRight: '20px',
  },
  formRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: '20px',
    },
});

export default function Activate() {
  const history = useHistory();

  const classes = useStyles();
  const [values, setValues] = React.useState({
    email: '',
    name: '',
    country: "Korea, South",
    phone: '',
    profession: '',
    institution: '',
  });

  const [error, setError] = React.useState('');


  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };


  return (
    <Wrapper>
      <Card className={classes.root}>
        <form className={classes.form} noValidate autoComplete="off">
            <div className={classes.formBody}>
                <div className={classes.formLeft}>
                    <TextField
                        className={classes.textField}
                        label="Name"
                        placeholder="Name"
                        onChange={handleChange('name')}
                        variant='outlined'
                    />
                    <TextField
                        className={classes.textField}
                        label="Email"
                        placeholder="Email"
                        onChange={handleChange('email')}
                        variant='outlined'
                    />
                    <TextField
                        className={classes.textField}
                        label="Phone"
                        placeholder="Phone"
                        onChange={handleChange('phone')}
                        variant='outlined'
                    />
                </div>
                <div className={classes.formRight}>
                    <FormControl
                        className={classes.selectField}
                        fullWidth
                    >
                        <TextField
                        select
                        labelId="label-country"
                        label="Country"
                        value={values.country}
                        onChange={(e) => {
                            setValues({ ...values, country: e.target.value });
                        }}
                        variant='outlined'
                        >
                        {countries.map((country, index) => (
                            <MenuItem key={index} value={country}>
                            {country}
                            </MenuItem>
                        ))}
                        </TextField>
                    </FormControl>
                    <TextField
                        className={classes.textField}
                        id="standard-error-helper-text"
                        label="Profession (Optional)"
                        placeholder="AI Dev"
                        onChange={handleChange('profession')}
                        variant='outlined'
                    />
                        <TextField
                        className={classes.textField}
                        id="standard-error-helper-text"
                        label="Institution (Optional)"
                        placeholder="Hopkins"
                        onChange={handleChange('institution')}
                        variant='outlined'
                    />
                </div>
            </div>
            <div className={classes.terms}>
                <p>Agree to the <a href="/terms" target="_blank">Terms of Service</a></p>
            </div>
            {error ? <p className={classes.error}>{error}</p> : null}
            <Button
                variant='contained'
                color='secondary'
                size='large'
                className={classes.button}
                onClick={() => {
                
                const data = {
                    user_id: localStorage.getItem('user_id'),
                    username: values.email,
                    email: values.email,
                    name: values.name,
                    country: values.country,
                    phone: values.phone,
                    profession: values.profession,
                    institution: values.institution,
                }
                const tokenURL = `${hostname}:4002/activate_user`;
                
                axios.post(tokenURL, data).then(res => {
                    
                    if (res.data.message === 'User created successfully') {
                        history.push('/prediction/records');
                    } else {
                        setError(res.data.message);
                    }
                }).catch(err => {
                    
                    setError(err);
                });
                }}
            >
                Submit
            </Button>
            </form>
      </Card>
    </Wrapper>
  );
}

// +821034625440