import * as React from 'react';
import Slider from '@mui/material/Slider';
import {useParams} from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import axios from 'axios';
import { hostname, port } from '../utils/config';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const styles = {

    modal: {
        width: '60%',
        maxWidth: '900px',
        height: '60%',
        maxHeight: '900px',
        background: '#00d8f5',
        opacity: 1,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        margin: '0',
        padding: '20px',
        top: '50%',
        left: '50%',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
    },
    wrapper: {
        width: '90%',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        width: '100%',
    },
    ctssMapTable: {
        // minWidth: '200px',
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
    },
    ctssMapTableRow: {
    },
    ctssMapTableCell: {
        // padding: '5px',
        textAlign: 'center',
        fontSize: '17px',
        color: 'white',
        padding: '10px'
    },
    header: {
        textAlign: 'center',
        fontSize: '30px',
        fontWeight: 'bold',
        marginBottom: '50px',
        color: "#000"
    },

    header1: {
        textAlign: 'center',
        fontSize: '25px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: "#808080"
    }
}
export default function CTSSMap(props) {
    const [ctss, setCtss] = React.useState({
        // '1': [0, 5],
        // '2': [5, 10]
    });
    const [ctssKey, setCtssKey] = React.useState(1);
    const [sliderVal, setSliderVal] = React.useState(0);
    const [minSliderVal, setMinSliderVal] = React.useState(0);
    const [edit, setEdit] = React.useState(false);
    const [currentCtss, setCurrentCtss] = React.useState({});
    const [setDisabled, setSetDisabled] = React.useState(false);
    const [saveDisabled, setSaveDisabled] = React.useState(true);
    console.log(ctss);
    console.log('modal opened!!');

    React.useEffect(() => {

        console.log('use effect!!!');

        axios.get(`${hostname}:4002/api/ctss_map`,
        { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } }
        ).then(res => {
            console.log('res', res);
            setCurrentCtss(res.data.ctss);
        }).catch(err => {
            if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
                // props.history.push('/login');
                console.log(err.response.data, 'err response');

            }
            if (err.response.data.message === 'User not activated' || err.response.data.message === 'User not found') {
                // props.history.push('/activate');
                console.log(err.response.data, 'err response');

            }
            console.log('err', err);
        });
           
    }, [edit]);


    return (
    <Modal
        open={props.open}
        onClose={(_, reason) => {
            setEdit(false);
            setSetDisabled(false);
            setSaveDisabled(true);
            setCtss([]);
            props.onClose(reason)
        }}
    >
        
            <div className="test" style={styles.modal}>
            <div class="closebutton" style={{
                height: "30px",
                width: "100%",
                "text-align": "right"
            }}
            onClick={props.onClose}
            >
                <IconButton aria-label="close">
                    <CloseIcon />
                </IconButton>
            </div>
            { edit ? // if edit mode
                <div style={styles.wrapper}>
                <table style={styles.ctssMapTable} className="table-design">
                    <thead>
                        <tr style={styles.ctssMapTableRow}>
                            <th style={styles.ctssMapTableCell}>Score</th>
                            <th style={styles.ctssMapTableCell}>Range</th>
                        </tr>
                    </thead>
                    {
                        Object.keys(ctss).map((key, index) => {
                            return (
                                <tr key={index} style={styles.ctssMapTableRow}>
                                    <td style={styles.ctssMapTableCell}>{key}</td>
                                    <td style={styles.ctssMapTableCell}>{ctss[key].join(' - ')}</td>
                                </tr>
                            );
                        })
                    }
                </table>
                <div style={styles.sliderWrapper}>
                    <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={sliderVal}
                        onChange={(event, value) => {
                            if(value > minSliderVal) {
                                setSliderVal(value);
                            }
                        }}
                    />
                    <p style={{color: 'blue', paddingLeft: '20px', paddingRight: '5px'}}>{sliderVal}</p>
                    <Button
                        disabled={setDisabled}
                        onClick={() => {
                            if(sliderVal === 100){
                                setSaveDisabled(false);
                                setSetDisabled(true);
                            }
                            setMinSliderVal(sliderVal);
                            setCtss(ctss => {
                                return {
                                    ...ctss,
                                    [String(ctssKey)]: [minSliderVal, sliderVal]
                                }
                            });
                            setCtssKey(ctssKey => {
                                return ctssKey + 1;
                            });
                        }}
                    >
                        Set
                    </Button>
                </div>
                <div style={styles.buttonsWrapper}>
                    <Button
                    disabled={saveDisabled}
                        style={{marginRight: '10px'}}
                        onClick={() => {
                            axios.post(`${hostname}:4002/api/ctss_map`,
                            { ctss },
                            { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } }
                            ).then(res => {
                                console.log('res', res);
                                setEdit(false);
                                // setCurrentCtss(res.data.ctss);
                            }
                            ).catch(err => {
                                console.log('err', err);
                            }
                            );
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        style={styles.resetButton}
                        onClick={() => {
                            setCtss({});
                            setSaveDisabled(true);
                            setSetDisabled(false);
                            setMinSliderVal(0);
                            setSliderVal(0);
                            setCtssKey(1);
                        }}
                    >
                        Reset
                    </Button>
                </div>
                </div>
            :
                <div style={styles.wrapper}>
                    {props.newLogin && <p style={styles.header1}>Severity score setting for first time login</p>}
                    <h4 className='bottom-line' style={styles.header}>CTSS Map</h4>
                    <table style={styles.ctssMapTable} className="table-design">
                        <thead>
                            <tr style={styles.ctssMapTableRow}>
                                <th style={styles.ctssMapTableCell}>Score</th>
                                <th style={styles.ctssMapTableCell}>Range</th>
                            </tr>
                        </thead>
                        {
                            Object.keys(currentCtss).map((key, index) => {
                                return (
                                    <tr key={index} style={styles.ctssMapTableRow}>
                                        <td style={styles.ctssMapTableCell}>{key}</td>
                                        <td style={styles.ctssMapTableCell}>{currentCtss[key].join(' - ')}</td>
                                    </tr>
                                );
                            }
                            )
                        }
                    </table>
                    <Button
                        className='custom-btn'
                        onClick={() => {
                            setEdit(true);
                        }
                        }
                    >
                        Edit
                    </Button>
                </div>
            }
            </div>
    </Modal>
    );
}