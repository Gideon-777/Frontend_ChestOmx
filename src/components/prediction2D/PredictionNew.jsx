import * as React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { LinearProgress } from '@material-ui/core';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import { Typography } from '@mui/material';
import  { Redirect } from 'react-router-dom'
import { hostname, port } from '../../utils/config';
import { useHistory } from "react-router-dom";

import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack';
import { toast } from 'react-toastify';
import {useDropzone} from 'react-dropzone'
// import LinearProgress from '@mui/material/LinearProgress';

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
    },
    inferenceButton: {
        margin: '10px',
        maxWidth: '300px',
        minWidth: '200px',
        width: '100%',
        height: '50px',
        backgroundColor: '#00d8f5',
        alignItems: 'center',
        borderRadius: "50px",
        color: '#000',
        marginTop: "25px",
        marginLeft: "24px",
        fontSize: "15px",
    },
    filetypeButton: (checked) => {
        return {
            flex: 1,
            marginBottom: '10px',
            opacity: 0.8,
            background: checked ? '#203a43' : '#eee',
            color: checked ? 'white' : 'white',
            minWidth: '100px',
            maxWidth: '300px',
            width: '100%',
            zIndex: 9999,
            backgroundColor: '#203a43',
            borderRadius: "50px",
        }
    },
    fileTypesWrapper: {
        minWidth: '400px',
        width: '80%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    planesWrapper: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '50px',
        maxWidth: '300px',
    },
    modelCheckbox: {
        margin: '10px',
        opacity: 0.8,
        /* background: '#eee',
        border: '1px solid #00e',*/
        color: '#fff',
        alignItems: 'center',
        '&.Mui-disabled': {
            color: 'green'
        }
    },
    progres: {
        height: '30px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    modal: {
        width: '300px',
        height: '300px',
        backgroundColor: '#49494b',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        justifyContent: 'space-around',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%',
        border: '1px solid #002233',
        bordeRadius: '5px'

    }
}

const FileUploadProgress = (props) => {
    const [progress, setProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);
    const onDrop = React.useCallback(acceptedFiles => {
        // Do something with the files
        console.log(acceptedFiles);
        onFileSubmit(acceptedFiles);
      }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});


    function onFileSubmit(acceptedFiles) {
        // e.preventDefault();
        setIsUploading(true);
        const req = new XMLHttpRequest();
        req.open(props.method, props.url);
        req.setRequestHeader('authorization', 'Bearer ' + localStorage.getItem('token'));
        req.onload = () => {
            setIsUploading(false);
            setProgress(0);
            props.onComplete(JSON.parse(req.response));
        }
        req.upload.onprogress = (e) => {
            setProgress(Math.round(e.loaded / e.total * 100));
        }
        req.onabortion = () => {
        }
        req.onerror = () => {
            console.log('error');
        }

        const formData = new FormData();
        formData.append('fileType', 'dcm');
        for (let i = 0; i < acceptedFiles.length; i++) {
            formData.append('file', acceptedFiles[i]);
        }
        req.send(formData);
    }

   

      
    return (
        <div className='nii-form' style={{ zIndex: 9999 }}>
            <div className='row'>
                <div className='col-12' style={{ marginTop: "15px",paddingLeft: "50px",paddingRight:'50px' }}>
                    {
                            <div className="wrapper_upload" {...getRootProps()}>
                                <div className="">
                                <label >
                                    <i className="fa fa-download" style={{fontSize: '30px'}}></i>
                                    <input  {...getInputProps()} />
                                    {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some  DICOM Images here, or click to select files</p>
        }
                                </label>
                                </div>
                            </div>
                        // <input type="file" name="file" onChange={props.onChange} ref={fileRefDcm} multiple accept=".dcm" />
                    }

                </div>
                <div className='col-12'>
                    <div className='upld-prog-wrap' style={{ marginTop: "15px" }}>
                        {/* <Button
                            className='nii-btn'
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={styles.inferenceButton}
                            disabled={isUploading}
                        >Upload
                        </Button> */}


                        {isUploading ?
                            <div className='progres-wrap' style={styles.progress}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                />
                                {progress} %
                            </div> : null}
                    </div>

                </div>
            </div>




        </div>
    );
}


const DcmImage = (props) => {
    return (
        <FileUploadProgress
            url={`${hostname}:${port}/api/prediction/upload`}
            fileType={'dcm'}
            method={'POST'}
            onProgress={(e) => console.log(e)}
            onComplete={(e) => {
                if (e.status === true && e.message === 'File successfully uploaded') {
                    props.onUploaded(true, e.id.patient_id, e.id.unique_id);
                }
            }}
        />
    );
}

const Models = (props) => {
    return (
        <div style={styles.models}>
            <h4 className='subslct-heading' style={{color:"#00d8f5",paddingTop: "20px",fontWeight: "600"}}>MODEL SELECTION</h4>
            <FormControl className='chk-wrap'>
                <FormGroup className='chk-grp-wrap check-grp'>
                    {  props.models &&  props.models.length > 0 &&
                        props.models.map((model, index) => {
                            return (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            name='model'
                                            disabled={model.mandatory}
                                            checked={model.mandatory ? true: props.checked}
                                            onChange={props.onChange}
                                            value={model.name}
                                            style={styles.modelCheckbox}
                                        />
                                    }
                                    label={<Typography style={{color: model.mandatory? '#00d8f5': 'white'}}>{model.name}</Typography>}
                                />
                            );
                        })
                    }
                    {
                        ! props.models ||  props.models.length <= 0 &&
                        <Stack spacing={1}>
                            <Skeleton animation="wave" width={"300px"}  />
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                        </Stack>

                        // <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
                        //     <LinearProgress color="secondary" />
                        //     <LinearProgress color="success" />
                        //     <LinearProgress color="inherit" />
                        // </Stack>

                    }
                </FormGroup>
            </FormControl>
        </div>
    );
}

export default function PredictionNew(props) {
    const [imageType, setImageType] = React.useState('dcm');
    const [uploaded, setUploaded] = React.useState(false);
    const [patientId, setPatientId] = React.useState(null);
    const [uniqueId, setUniqueId] = React.useState(null);
    const [inferenceStarted, setInferenceStarted] = React.useState(false);
    const [models, setModels] = React.useState([]);
    const [notLoggedIn, setNotLoggedIn] = React.useState(false);
    const history = useHistory();
   
    React.useEffect(() => {
        axios.get(`${hostname}:${port}/api/is_activated`,
            { headers: { authorization: 'Bearer ' + localStorage.getItem('token') } })
            .then(res => {
                console.log(res, 'res');
                axios.get(`${hostname}:${port}/api/models`,
                    { headers: { authorization: 'Bearer ' + localStorage.getItem('token') } })
                    .then(res => {
                        setModels(res.data.models);
                    }).catch(err => {
                    });
            })
            .catch(err => {
                
                if(err.toJSON().message == 'Network Error'){
                    toast.error("Service not available!");
                    
                }
                if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
                    // props.history.push('/login');
                    console.log(err.response.data, 'err response');
                    // return <Redirect to='/login'  />
                    // history.push('/login');
                    setNotLoggedIn(true);
                }
                if (err.response.data.message === 'User not activated' || err.response.data.message === 'User not found') {
                    // props.history.push('/activate');
                    console.log(err.response.data, 'err response');

                }else{
                    console.log('other error', err);
                }
            });
    }, []);
    // Submit for Inference
    const onSubmitForInference = () => {
        const data = {
            fileType: imageType,
            // models: models.filter((model, index) => {
            //     return document.getElementsByName('model')[index].checked;
            // }).join(','),
            models: models.filter((model, index) => {
                return document.getElementsByName('model')[index].checked;
            }).map((model) => model.name).join(','),
            patientId: patientId,
            uniqueId: uniqueId
        };
        const inferenceURL = `${hostname}:${port}/api/prediction/inference`;
        axios.post(inferenceURL, data,
            { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } }
        ).then((res) => {
            if (res.status === 200) {
                setInferenceStarted(true);
                toast.success(`Inference Started with ${uniqueId.substring(0,16)} ${uniqueId.substring(16)}. Redirecting to records page.`,{
                    onClose: function() {
                        history.push('/prediction/records');
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
                // props.history.push('/login');
                console.log(err.response.data, 'err response');
                // return <Redirect to='/login'  />
                // history.push('/login');
                setNotLoggedIn(true);
            }
            if (err.response.data.message === 'User not activated' || err.response.data.message === 'User not found') {
                // props.history.push('/activate');
                console.log(err.response.data, 'err response');

            }
        });

    }
if(notLoggedIn){
    return <Redirect to='/login'  />
}
    return (
        <>
            {/* <div> */}
                {/* <Button
                    className='nii-btn'
                    style={styles.filetypeButton(imageType === 'nii' ? true : false)}
                    onClick={() => setImageType('nii')}
                >
                    NII Image
                </Button>
                <Button
                    className='nii-btn'
                    style={styles.filetypeButton(imageType === 'dcm' || imageType === 'file'? true : false)}
                    onClick={() => setImageType('dcm')} 
                >
                    DICOM Images
                </Button> */}
                 {/* <MyDropzone/> */}

            {/* </div> */}
            <DcmImage
                    onUploaded={(val, patientId, uniqueId) => {
                        setPatientId(patientId);
                        setUniqueId(uniqueId);
                        setUploaded(val);
                    }}
                />
               
            <Models
                models={models}
            />
            <Button
                className='predict-submit'
                variant="contained"
                color="primary"
                style={styles.inferenceButton}
                disabled={!uploaded}
                onClick={onSubmitForInference}
            >
                Submit for Inference
            </Button>
            <Modal
                open={false}
            >
                <div
                    style={styles.modal}
                >
                    <h1>Inference Started</h1>
                    <Typography>
                        You can check the inference status for uniqueId {uniqueId} in the prediction records page
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        href={'/prediction/records'}
                    >Go to Predictions</Button>
                </div>
            </Modal>

        </>
    );
}