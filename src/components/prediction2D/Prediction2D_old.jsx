import * as React from 'react';


// import ImageList from '@mui/material/ImageList';
// import ImageListItem from '@mui/material/ImageListItem';
import Modal from '@mui/material/Modal';

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import { ColorPicker } from 'material-ui-color';

import { useParams } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { PNG } from 'pngjs/browser';

import Slider from '@material-ui/core/Slider';

import request from 'request';

// import { io } from 'socket.io-client';
import { CSVLink } from 'react-csv';

import { hostname, port } from '../../utils/config';

import styles from './Prediction2D.style';

const loadingGif = require('./assets/loading_spinner.gif');

// const PngToy = require('./pngtoy.min.js');

/*
    *  ImageGrid.jsx
    *  This component is used to display a list of images.
    *  It has 2 tabs, axial and coronal.
    *  When the user clicks on an image, it will be displayed in the ImageViewer.
    *  The ImageViewer is a modal component.
*/

const colorArrayToHexString = (colorArray) => {
    return '#' + colorArray.map(x => {
        return ('0' + x.toString(16)).slice(-2);
    }).join('');
}

const colorHexToArray = (colorHex) => {
    return colorHex.substring(1).match(/.{2}/g).map(x => parseInt(x, 16));
}

const Windowing = (props) => {
    let wlRef = React.createRef();
    let wwRef = React.createRef();
    return (
        <div style={styles.windowOptions}>
            <div style={styles.windowOptionsRow}>
                <TextField
                    inputRef={wlRef}
                    id="wl-number"
                    label="WL"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="standard"
                />
            </div>
            <div style={styles.windowOptionsRow}>
                <TextField
                    inputRef={wwRef}
                    id="ww-number"
                    label="WW"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="standard"
                />
            </div>
            <div style={styles.windowOptionsRow}>
                <Button
                    onClick={() => {
                        
                        const wl = parseInt(wlRef.current.value) || 0;
                        const ww = parseInt(wwRef.current.value) || 1000;
                        props.onChangeWindow(wl, ww);
                    }}
                    variant="contained"
                    color="primary">
                    Change Window
                </Button>
            </div>
        </div>
    );
}

const VisibilityEye = (props) => {
    const [visible, setVisible] = React.useState(true);
    if (visible) {
        return <VisibilityIcon
            key={props.key}
            onClick={
                () => {
                    setVisible(false);
                    props.onVisibilityChange(props.name, false);
                }
            } />
    } else {
        return <VisibilityOffIcon
            key={props.key}
            onClick={
                () => {
                    setVisible(true);
                    props.onVisibilityChange(props.name, true);
                }
            } />
    }
}

const CTImage = (props) => {
    const [fetched, setFetched] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [imageData3D, setImageData3D] = React.useState(null);
    const [numLoaded, setNumLoaded] = React.useState(0);
    const [imagesFetchedList, setImagesFetchedList] = React.useState({});
    const [plane, setPlane] = React.useState('axial');
    const [unloadableMessage, setUnloadableMessage] = React.useState(false);
    const [metricsModalOpen, setMetricsModalOpen] = React.useState(false);
    const [ctssModalOpen, setCtssModalOpen] = React.useState(false);
    const [modelDownload, setModelDownload] = React.useState(props.models[0]);
    const [labelsImages, setLabelsImages] = React.useState({});
    const [labelsLoaded, setLabelsLoaded] = React.useState(false);

    const planes = [
        'axial',
        'coronal',
        'sagittal'
    ];

    const labels = Object.keys(props.labels);
    const labelsValues = Object.values(props.labels);

    const valToLabels = Object.fromEntries(labels.map((x, i) => {
        return [labelsValues[i], x];
    }));

    const [switchLabelsState, setSwitchLabelsState] = React.useState({});

    const [labelsColors, setLabelsColors] = React.useState({});

    const [labelsOpacity, setLabelsOpacity] = React.useState(0.4);

    const [imageData, setImageData] = React.useState(null);
    const [maskData, setMaskData] = React.useState(null);


    const size = 512;
    const width = size;

    let canvasRef = null;
    let imgRef = null;

    const [windowVals, setWindowVals] = React.useState([-500, 1400]);

    const window = (val, wl, ww) => {
        val = val - 4096;
        const ll = wl - ww / 2;
        const ul = wl + ww / 2;
        if (val < ll)
            val = ll;
        else if (val > ul)
            val = ul;
        return (val - ll) / (ul - ll) * 255;
    }

    const drawOverlays = (imageData, imgSize, numImages, selectedImage) => {
        
        if (imageData == null)
            return;
        // get new canvas
        let canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // const ctx = canvasRef?.getContext('2d');
        // let width = imgSize;

        var time2 = new Date();
        let overlaidImageData;
        if (plane === 'axial' || numLoaded < numImages) {
            overlaidImageData = new Uint8Array(imgSize[0] * imgSize[1] * 4);
        } else if (plane === 'coronal') {
            
            overlaidImageData = new Uint8Array(numImages * imgSize[1] * 4);
        } else {
            overlaidImageData = new Uint8Array(numImages * imgSize[0] * 4);
        }
        if (numLoaded < numImages) {
            var a = new Date();
            
            for (let i = 0; i < imgSize[0] * imgSize[1]; i++) {
                let index = i * 4;
                let val = imageData[index + 2] + imageData[index + 1] * 256;
                let maskVal = imageData[index];
                let maskVal2 = imageData[index + 3];
                val = window(val, windowVals[0], windowVals[1]);
                overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                overlaidImageData[index + 3] = 255;
                if (maskVal > 0) {
                    overlaidImageData = updateLabels(maskVal, overlaidImageData, index);
                }
                if (maskVal2 > 0 && maskVal2 !== 255) {
                    overlaidImageData = updateLabels2(maskVal2, overlaidImageData, index);
                }
            }
            var b = new Date();
            

            let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], imgSize[0]);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.putImageData(img, 0, 0);
            a = new Date();
            let src = canvas.toDataURL('image/jpeg', 0.99);
            b = new Date();
            
            imgRef.src = src;

        }
        else {

            if (plane === 'axial') {
                
                const offset = selectedImage * imgSize[0] * imgSize[1] * 4;
                for (let i = 0; i < imgSize[0] * imgSize[0]; i++) {
                    let val = imageData[offset + i * 4 + 2] + imageData[offset + i * 4 + 1] * 256;
                    let maskVal = imageData[offset + i * 4];
                    let maskVal2 = imageData[offset + i * 4 + 3];
                    val = window(val, windowVals[0], windowVals[1]);
                    overlaidImageData[i * 4] = overlaidImageData[i * 4 + 1] = overlaidImageData[i * 4 + 2] = val; // * (1. - lobesOpacity);
                    overlaidImageData[i * 4 + 3] = 255;
                    if (maskVal > 0) {
                        overlaidImageData = updateLabels(maskVal, overlaidImageData, i * 4);
                    }
                    if (maskVal2 > 0 && maskVal2 !== 255) {
                        overlaidImageData = updateLabels2(maskVal2, overlaidImageData, i * 4);
                    }
                }
                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], imgSize[0]);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
            else if (plane === 'coronal') {
                
                for (let i = 0; i < numImages; i++) {
                    for (let j = 0; j < imgSize[1]; j++) {
                        let offset = (i * imgSize[0] * imgSize[1] + j + imgSize[0] * selectedImage) * 4;
                        let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                        let maskVal = imageData[offset];
                        let maskVal2 = imageData[offset + 3];
                        val = window(val, windowVals[0], windowVals[1]);
                        let index = (i * imgSize[1] + j) * 4;
                        overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                        overlaidImageData[index + 3] = 255;
                        
                        if (maskVal > 0) {
                            overlaidImageData = updateLabels(maskVal, overlaidImageData, index);
                        }
                        if (maskVal2 > 0 && maskVal2 !== 255) {
                            overlaidImageData = updateLabels2(maskVal2, overlaidImageData, index);
                        }
                    }
                }

                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[0], numImages);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
            else if (plane === 'sagittal') {
                
                for (let i = 0; i < numImages; i++) {
                    for (let j = 0; j < imgSize[0]; j++) {
                        let offset = (i * imgSize[0] * imgSize[1] + j * imgSize[1] + selectedImage) * 4;
                        let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                        let maskVal = imageData[offset];
                        let maskVal2 = imageData[offset + 3];
                        val = window(val, windowVals[0], windowVals[1]);
                        let index = (i * imgSize[0] + j) * 4;
                        overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                        overlaidImageData[index + 3] = 255;
                        if (maskVal > 0) {
                            overlaidImageData = updateLabels(maskVal, overlaidImageData, index);
                        }
                        if (maskVal2 > 0 && maskVal2 !== 255) {
                            overlaidImageData = updateLabels2(maskVal2, overlaidImageData, index);
                        }
                    }
                }
                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[0], numImages);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
        }

        var time3 = new Date();
        
        setLoaded(true);
    }

    React.useEffect(() => {
        setLabelsColors(props.labelsColors);
        const labelState = Object.assign({}, ...labels.map(label => ({ [label]: true })));
        setSwitchLabelsState(labelState);
    }, []);


    React.useEffect(() => {


        const asyncFetch = async () => {
            
            const img = new Image();
            
            if(! labelsLoaded){
                for(let i = 0; i < props.labels.length; i++) {
                    request({
                        url: props.labels[i].image_url,
                        encoding: null
                    }, function(err, res, body) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            new PNG().parse(body, function(err, data) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    setLabelsImages(labelsImages => ({
                                        ...labelsImages,
                                        [props.labels[i].name]: data
                                    }));
                                }
                            });
                        }
                        if(i === props.labels.length - 1){
                            setLabelsLoaded(true);
                        }
                    });
                }
            }

            for (let i = numLoaded; i < Math.min(numLoaded + 50, props.images.length); i++) {
                request({
                    url: props.images[i].image_url,
                    encoding: null
                }, function (err, response, body) {
                    if (err) {
                        console.log(err);
                    } else {
                        new PNG().parse(body, function (err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                setImagesFetchedList(imagesFetchedList => ({
                                    ...imagesFetchedList,
                                    [i]: data.data
                                })
                                );
                                setNumLoaded(numLoaded => numLoaded + 1);
                                if (i === 10) {
                                    setFetched(true);
                                }
                            }
                        });
                    }
                });
            }
        }
        if (numLoaded % 50 == 0)
            asyncFetch();
    }, [numLoaded]);

    React.useEffect(() => {
        if (numLoaded === props.images.length) {
            
            setImageData3D(new Uint8Array(props.imgSize * props.imgSize * props.images.length * 4));
            let newData = new Uint8Array(props.imgSize[0] * props.imgSize[1] * props.images.length * 4);
            for (let j = 0; j < Object.keys(imagesFetchedList).length; j++) {
                
                newData.set(imagesFetchedList[j], j * props.imgSize[0] * props.imgSize[1] * 4);
            }
            
            setImageData3D(newData);
        }
    }, [numLoaded, imagesFetchedList]);

    React.useEffect(() => {
        if (labelsLoaded) {
            
            setImageData3D(new Uint8Array(props.imgSize * props.imgSize * props.images.length * 4));
            let newData = new Uint8Array(props.imgSize[0] * props.imgSize[1] * props.images.length * 4);
            for (let j = 0; j < Object.keys(imagesFetchedList).length; j++) {
                
                newData.set(imagesFetchedList[j], j * props.imgSize[0] * props.imgSize[1] * 4);
            }
            
            setImageData3D(newData);
        }
    }, [labelsLoaded, labelsImages]);

    React.useEffect(() => {
        const asyncDraw = async () => {
            if (numLoaded >= props.images.length) {
                drawOverlays(imageData3D, props.imgSize, props.images.length, selectedImage);
                setFetched(true);
            }
            else if (imagesFetchedList[selectedImage]) {
                drawOverlays(imagesFetchedList[selectedImage], props.imgSize, props.images.length);
                setFetched(true);
            }
        }
        asyncDraw();
    }, [switchLabelsState, labelsColors, labelsOpacity, windowVals, fetched, selectedImage]);
    return (

        <div style={styles.wrapper}>
            {loaded && <div style={styles.displayOptions}>
                <div
                    style={styles.lobesVisibility}

                >
                    {labels.map((label, index) => {
                        return (
                            <div style={
                                styles.lobeOption
                            }>
                                <h6 style={
                                    styles.lobeOptionText(colorArrayToHexString(labelsColors[label]))
                                }>
                                    {label}
                                </h6>
                                <VisibilityEye
                                    style={{ flexGrow: 1 }}
                                    key={label}
                                    name={label}
                                    visible={
                                        switchLabelsState[label]
                                    }
                                    onVisibilityChange={
                                        (label, val) => {
                                            setSwitchLabelsState(prevState => ({
                                                ...prevState,
                                                [label]: val
                                            })
                                            );
                                        }
                                    }
                                />
                                <ColorPicker
                                    style={{ flexGrow: 1 }}
                                    name={label + 'Color'}
                                    value={colorArrayToHexString(labelsColors[label])}
                                    hideTextfield={true}
                                    deferred={true}
                                    onChange={
                                        (color) => {
                                            ;
                                            setLabelsColors(prevState => ({
                                                ...prevState,
                                                [label]: color.rgb
                                            }));
                                        }
                                    }
                                />
                            </div>
                        );
                    })
                    }
                </div>

                <Windowing
                    onChangeWindow={
                        (wl, ww) => {
                            setWindowVals([wl, ww]);
                        }
                    }
                />
                <div style={styles.canvasDownloadWrapper}>
                    <Button
                        style={styles.buttonStyle}
                        onClick={() => {
                            const link = document.createElement('a');
                            link.download = `${props.patientId}_${plane}_${selectedImage}.png`;
                            link.href = imgRef.src;
                            link.click();
                        }
                        }>
                        Download <SaveAltIcon style={{ marginLeft: '10px' }} />
                    </Button>
                </div>
                <div style={styles.canvasDownloadWrapper}>
                    <Button
                        style={styles.buttonStyle}
                        onClick={() => {
                            setMetricsModalOpen(true);
                        }
                        }>
                        Get Metrics
                    </Button>
                </div>
                {(props.models.indexOf('lobes') > -1 && props.models.indexOf('infiltration')) ?
                    <div style={styles.canvasDownloadWrapper}>
                        <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                setCtssModalOpen(true);
                            }
                            }>
                            Get CTSS
                        </Button>
                    </div> : null
                }
                {metricsModalOpen ?
                    <MetricsModal
                        open={metricsModalOpen}
                        models={props.models}
                        uniqueId={props.uniqueId}
                        patientId={props.patientId}
                        onClose={(reason) => {
                            
                            setMetricsModalOpen(false);
                        }}
                    >
                    </MetricsModal> : null
                }
                {ctssModalOpen ?
                    <CTSSTable
                        open={ctssModalOpen}
                        ctss={props.ctss}
                        models={props.models}
                        onClose={(reason) => {
                            
                            setCtssModalOpen(false);
                        }}
                    >
                    </CTSSTable> : null
                }


            </div>
            }

            <div style={
                styles.modal
            }>

                <div
                    style={styles.canvasWrapper}
                    onWheel={(e) => {
                        e.preventDefault();
                        const maxPos = plane === 'axial' ? props.images.length : props.imgSize[0];
                        if (e.deltaY > 0) {
                            setSelectedImage(Math.min(selectedImage + 1, maxPos - 1));
                        }
                        else {
                            setSelectedImage(Math.max(0, selectedImage - 1));
                        }

                    }}
                >   <div style={styles.planesWrapper}>
                        {
                            planes.map((_, index) => {
                                return (
                                    <Button
                                        key={index}
                                        style={
                                            styles.planeButton(plane === planes[index])
                                        }
                                        onClick={() => {
                                            if (numLoaded < props.images.length && index > 0) {
                                                // cannot plot coronal and saggital
                                                setUnloadableMessage(true)

                                            } else {
                                               
                                                setSelectedImage(0);
                                                setPlane(planes[index]);
                                            }
                                        }}
                                    >
                                        {planes[index]}
                                    </Button>
                                );
                            })
                        }
                        <Snackbar
                            open={unloadableMessage}
                            autoHideDuration={6000}
                            message="Cannot show coronal|saggital until all images are loaded"
                            sx={{ bottom: { xs: 90, sm: 0 } }}
                        />
                    </div>
                    <img id="myImg" ref={node => { imgRef = node }} width={700} height={700} />
                    <Slider
                        aria-label="Slice"
                        defaultValue={0}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        value={selectedImage}
                        min={0}
                        max={plane === 'axial' ? props.images.length : props.imgSize[0]}
                        onChange={(e, val) => {
                            setSelectedImage(val);
                        }}
                    />
                    <div>
                        <LinearProgress
                            variant="determinate"
                            value={(numLoaded / props.images.length) * 100}

                        />
                        <div>{Math.round(numLoaded / props.images.length * 100)} %</div>
                    </div>

                </div>
            </div>
            { loaded &&
                <div style={styles.labelsDownloadWrapper}>
                    <Select
                        style={styles.select}
                        value={modelDownload}
                        onChange={(e) => {
                            setModelDownload(e.target.value);
                        }}
                    >
                        { 
                            props.models.map((model, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        value={model}
                                    >
                                        {model}
                                    </MenuItem>
                                );
                            })
                        }
                    </Select>
                    <div>
                        <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `http://${hostname}:${port}/nii/${props.patientId}/${props.uniqueId}/${props.accessKey}/${modelDownload}`;
                                link.download = `${props.patientId}_${modelDownload}.nii.gz`;
                                
                                link.click();
                            }
                            }>
                            Download NII<SaveAltIcon style={{ marginLeft: '10px' }} />
                        </Button>
                        <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.download = `${props.patientId}_${plane}_${selectedImage}.png`;
                                link.href = `${props.uniqueId}/${modelDownload}/${plane}/${selectedImage}.png`;
                                link.click();
                            }
                            }>
                            Download DICOMs (zip)<SaveAltIcon style={{ marginLeft: '10px' }} />
                        </Button>
                    </div>
                </div> 
            }
    </div>
    );
}

const CTSSTable = (props) => {
    return (
        <Modal
            open={props.open}
            onClose={(_, reason) => props.onClose(reason)}
        >
            <div style={styles.ctssTable}>
                <div>
                    <div style={styles.ctssRow}>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 }}>CTSS</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 }}>RUL</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 }}>RML</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 }}>RLL</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 }}>LUL</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 }}>LLL</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div style={styles.ctssRow}>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 }}>Inv</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{Math.round(props.ctss.involvement_rul * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{Math.round(props.ctss.involvement_rml * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{Math.round(props.ctss.involvement_rll * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{Math.round(props.ctss.involvement_lul * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{Math.round(props.ctss.involvement_lll * 10000) / 10000}</p>
                        </div>
                    </div>
                    <div style={styles.ctssRow}>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 }}>Score</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{props.ctss.ctss_rul}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{props.ctss.ctss_rml}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{props.ctss.ctss_rll}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{props.ctss.ctss_lul}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p>{props.ctss.ctss_lll}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

const FileUploadProgress = (props) => {
    const fileRefNii = React.useRef(null);
    const [progress, setProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);

    return (
        <form onSubmit={
            (e) => {
                e.preventDefault();
                setIsUploading(true);
                const req = new XMLHttpRequest();
               
                req.open(props.method, props.url);
                req.onload = () => {
                    setIsUploading(false);
                    setProgress(0);
                    props.onComplete(JSON.parse(req.response));
                }
                req.upload.onprogress = (e) => {
                    setProgress(Math.round(e.loaded / e.total * 100));
                }
                const formData = new FormData();
                formData.append('unique_id', props.uniqueId);
                formData.append('patient_id', props.patientId);
                formData.append('model', props.model);
                formData.append('label_file', fileRefNii.current.files[0]);
                req.send(formData);
            }
        }>
            <input type="file" name="file" onChange={props.onChange} ref={fileRefNii} accept=".nii.gz,.nii" />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                // style={styles.inferenceButton}
                disabled={isUploading}
            >Upload
            </Button>
            {isUploading ?
                <div style={styles.progress}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}

                    />
                    {progress} %
                </div> : null}
        </form>
    );
}

const NiiImage = (props) => {
    return (
        <FileUploadProgress
            url={`http://${hostname}:4002/api/prediction/calc_metrics`}
            fileType={'nii'}
            method={'POST'}
            uniqueId={props.uniqueId}
            patientId={props.patientId}
            model={props.model}
            onProgress={(e) => console.log(e)}
            onComplete={(e) => {
                if (e.status === true && e.message === 'File successfully uploaded') {
                    props.onUploaded(true, e.id.patient_id, e.id.unique_id);
                }
            }}
            style={styles.filetypeButton(props.checked)}
        />
    );
}

const Metrics = props => {
    const metricNames = [
        'Recall',
        'Precision',
        'Dice',
        'Jaccard',
    ];
    const [csvData, setCsvData] = React.useState([]);
    React.useEffect(() => {
        let csvLines = [];
        csvLines.push(['Metrics'].concat(metricNames));
        for (let i = 0; i < props.metrics.length; i++) {
            let metricRow = props.metrics[i];
            let className = Object.keys(metricRow)[0];
            let classMetrics = Object.values(metricRow)[0];
            csvLines.push([className].concat(classMetrics));
        }
        setCsvData(csvLines);
    }, []);
    return (
        <div style={styles.metricsWrapper}>
            <table border="1" style={styles.metricsTable}>
                <thead>
                    <tr style={styles.metricsRow}>
                        <th style={styles.metricsTd}>
                            Metrics
                        </th>
                        {metricNames.map((metric, index) => {
                            return (
                                <th style={styles.metricsTd} key={index}>
                                    {metric}
                                </th>
                            );
                        }
                        )}
                    </tr>
                </thead>
                <tbody>
                    {
                        props.metrics.map((metricRow, index) => {
                            const className = Object.keys(metricRow)[0];
                            const metrics = Object.values(metricRow)[0];
                            return (
                                <tr style={styles.metricsRow}>
                                    <td style={styles.metricsTd}>
                                        {className}
                                    </td>
                                    {metrics.map((metric, index) => {
                                        return (
                                            <td style={styles.metricsTd} key={index}>
                                                {Math.round(100 * metric)}
                                            </td>
                                        );
                                    }
                                    )}
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
            <CSVLink data={csvData} style={styles.csvLink}>Download CSV</CSVLink>
        </div>
    );
}

const MetricsModal = props => {
    const [selectedModel, setSelectedModel] = React.useState(props.models[0]);
    const [loading, setLoading] = React.useState(false);
    const [uploadLabel, setUploadLabel] = React.useState(false);
    const [showMetrics, setShowMetrics] = React.useState(false);
    const [retry, setRetry] = React.useState(0);
    const [calculating, setCalculating] = React.useState(false);
    const [metrics, setMetrics] = React.useState(null);
    React.useEffect(() => {
        setLoading(true);
        setShowMetrics(false);
        setUploadLabel(false);
        setCalculating(false);
        axios.get(`http://${hostname}:4002/api/prediction/metrics?model=${selectedModel}&unique_id=${props.uniqueId}`).then(res => {
            console.log('res', res);
            if (res.data.message === 'Metrics for the model do not exist!') {
                
                setUploadLabel(true);
            }
            else if (res.data.message === 'Metrics Calculated!') {
                setMetrics(res.data.metrics);
                setShowMetrics(true);
            }
            else if (res.data.message === 'Metrics are being calculated!') {
           
                setCalculating(true);
            }
        }).catch(err => {
            console.log('err', err);
        }).finally(() => {
            setLoading(false);
        });
    }, [selectedModel, retry]);
    return (
        <Modal
            open={props.open}
            onClose={(_, reason) => props.onClose(reason)}

        >
            <div
                style={styles.metricsModal}
            >

                <FormControl style={{ margin: '20px' }}>
                    <Select
                        label="Model"
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value);
                        }}
                    >
                        {
                            props.models.map((model, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        value={model}
                                    >
                                        {model}
                                    </MenuItem>
                                );
                            })

                        }
                    </Select>
                </FormControl>
                {loading ? <CircularProgress /> : null}
                {
                    uploadLabel ?
                        <div style={styles.uploadLabe}>
                            <p>Metrics are not calculated for this model</p>
                            <p>Please upload the label file</p>
                            <NiiImage
                                uniqueId={props.uniqueId}
                                patientId={props.patientId}
                                model={selectedModel}
                                onUploaded={() => {
                                    
                                }}
                            />
                        </div> : null
                }
                {
                    calculating ?
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <p>Metrics are currently being calculated, please wait</p>
                        </div>
                        : null
                }
                {
                    showMetrics ? <Metrics metrics={metrics} /> : null
                }
            </div>
        </Modal>
    )

}

export default function Prediction2D(props) {
    const [fetched, setFetched] = React.useState(false);
    const [data, setData] = React.useState({});

    React.useEffect(() => {
        const fetchData = async () => {
            axios.get(`http://${hostname}:4002/api/view_model?patient_id=${props.patientId}&unique_id=${props.uniqueId}&access_key=${props.accessKey}`).then(res => {
            
                let data = res.data;
                data['images'] = data['images'].map(item => {
                    return {
                        image_url: `http://${hostname}:4002/${item}`,
                    }
                });
                setData(data);
                setFetched(true);
            });
        }
        if (!fetched)
            fetchData();
    }, [fetched]);

    return (
        <div style={
            styles.root
        }>
            {
                fetched ?
                    <CTImage
                        open={true}
                        patientId={props.patientId}
                        uniqueId={props.uniqueId}
                        accessKey={props.accessKey}
                        models={data['models']}
                        images={data['images']}
                        labels={data['labels']}
                        ctss={data['ctss']}
                        labelsColors={data['labels_colors']}
                        imgSize={data['img_size']}
                        onClick={(e) => {
                            
                        }}
                    /> : <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <CircularProgress />
                        <p>Loading...</p>
                    </div>

            }
        </div>
    );
    // return <div>hello</div>;
}
