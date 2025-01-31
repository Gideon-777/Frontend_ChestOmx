import * as React from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import { ColorPicker } from 'material-ui-color';
import axios from 'axios';
import Button from '@mui/material/Button';
import { PNG } from 'pngjs/browser';
import Slider from '@material-ui/core/Slider';
import request from 'request';
import { hostname, port } from '../../utils/config';
import styles from './Prediction2D.style';
import MetricsModal from '../Metrics';
import CTSSTable from '../CTSS';
import { Grid, Typography } from '@mui/material';
import  { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify';
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

const Windowing = (props) => {
    let wlRef = React.createRef();
    let wwRef = React.createRef();
    return (
        <div style={styles.windowOptions}>
            <div style={styles.windowOptionsRow}>
                <TextField
                    sx={{ width: '100%' }}
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
                    sx={{ width: '100%' }}
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
                {/* <button type="button"  className="btn btn-primary" data-toggle="modal" data-target="#split-img-modal">
                Launch demo modal
            </button> */}
                <Button sx={{ width: '100%', margin: '0 13px', backgroundColor: "#203a43", color: "white" }}
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
    const [visible, setVisible] = React.useState(props.visible);
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
    const [selectedViewModel, setSelectedViewModel] = React.useState(props.models[0]);
    const [labelsColorsVals, setLabelsColorsVals] = React.useState({});
    const [labelToVals, setLabelToVals] = React.useState({});
    const [showSplit, setShowSplit] = React.useState(false);




    const planes = [
        'axial',
        'coronal',
        'sagittal'
    ];
    const [switchLabelsState, setSwitchLabelsState] = React.useState({});
    const [labelsColors, setLabelsColors] = React.useState({});
    const [labelsOpacity, setLabelsOpacity] = React.useState(0.4);
    const size = 512;
    let imgRef = null;
    let imgRef1 = null;
    let imgRef2 = null;
    let imgRef3 = null;

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
        let overlaidImageData;
        if (plane === 'axial' || numLoaded < numImages) {
            overlaidImageData = new Uint8Array(imgSize[0] * imgSize[1] * 4);
        } else if (plane === 'coronal') {
            overlaidImageData = new Uint8Array(numImages * imgSize[1] * 4);
        } else {
            overlaidImageData = new Uint8Array(numImages * imgSize[0] * 4);
        }

        const updateLabels = (overlaidImageData, labelIndex, imgIndex) => {
            for (let model of props.models) {
                let labelVal = labelsImages[model][labelIndex];

                if (labelVal < 1 || !(labelVal in labelToVals[model]) || switchLabelsState[model][labelToVals[model][labelVal]] === false) {
                    continue;
                }
                let color = labelsColors[model][labelToVals[model][labelVal]];
                overlaidImageData[imgIndex] = overlaidImageData[imgIndex] * (1. - labelsOpacity) + color[0] * labelsOpacity;
                overlaidImageData[imgIndex + 1] = overlaidImageData[imgIndex + 1] * (1. - labelsOpacity) + color[1] * labelsOpacity;
                overlaidImageData[imgIndex + 2] = overlaidImageData[imgIndex + 2] * (1. - labelsOpacity) + color[2] * labelsOpacity;
            }
            return overlaidImageData;
        }
        if (numLoaded < numImages) {

            for (let i = 0; i < imgSize[0] * imgSize[1]; i++) {
                let index = i * 4;
                const offset = selectedImage * imgSize[0] * imgSize[1] * 4;
                let val = imageData[index + 2] + imageData[index + 1] * 256;
                val = window(val, windowVals[0], windowVals[1]);
                overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                overlaidImageData[index + 3] = 255;
                overlaidImageData = updateLabels(overlaidImageData, offset + index, index);
            }
            let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], imgSize[0]);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.putImageData(img, 0, 0);
            let src = canvas.toDataURL('image/jpeg', 0.99);
            imgRef.src = src;

        }
        else {
            if (plane === 'axial' || showSplit) {
                const offset = selectedImage * imgSize[0] * imgSize[1] * 4;
                for (let i = 0; i < imgSize[0] * imgSize[0]; i++) {
                    let index = i * 4;
                    let val = imageData[offset + index + 2] + imageData[offset + index + 1] * 256;
                    val = window(val, windowVals[0], windowVals[1]);
                    overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                    overlaidImageData[index + 3] = 255;
                    overlaidImageData = updateLabels(overlaidImageData, offset + index, index);
                }
                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[1], imgSize[0]);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                if (showSplit)
                    imgRef1.src = canvas.toDataURL('image/jpeg', 0.99);
                else
                    imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
            if (plane === 'coronal' || showSplit) {
                for (let i = 0; i < numImages; i++) {
                    for (let j = 0; j < imgSize[1]; j++) {
                        let offset = (i * imgSize[0] * imgSize[1] + j + imgSize[0] * selectedImage) * 4;
                        let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                        val = window(val, windowVals[0], windowVals[1]);
                        let index = (i * imgSize[1] + j) * 4;
                        overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                        overlaidImageData[index + 3] = 255;
                        overlaidImageData = updateLabels(overlaidImageData, offset, index);
                    }
                }

                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[0], numImages);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                if (showSplit)
                    imgRef2.src = canvas.toDataURL('image/jpeg', 0.99);
                else
                    imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
                // imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
            if (plane === 'sagittal' || showSplit) {
                for (let i = 0; i < numImages; i++) {
                    for (let j = 0; j < imgSize[0]; j++) {
                        let offset = (i * imgSize[0] * imgSize[1] + j * imgSize[1] + selectedImage) * 4;
                        let val = imageData[offset + 2] + imageData[offset + 1] * 256;
                        val = window(val, windowVals[0], windowVals[1]);
                        let index = (i * imgSize[0] + j) * 4;
                        overlaidImageData[index] = overlaidImageData[index + 1] = overlaidImageData[index + 2] = val; // * (1. - lobesOpacity);
                        overlaidImageData[index + 3] = 255;
                        overlaidImageData = updateLabels(overlaidImageData, offset, index);
                    }
                }
                let img = new ImageData(new Uint8ClampedArray(overlaidImageData), imgSize[0], numImages);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.putImageData(img, 0, 0);
                if (showSplit)
                    imgRef3.src = canvas.toDataURL('image/jpeg', 0.99);
                else
                    imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
                // imgRef.src = canvas.toDataURL('image/jpeg', 0.99);
            }
        }

        setLoaded(true);
    }

    React.useEffect(() => {
        let labelsState = {};
        let labelToVals = {};
        for (let model of Object.keys(props.labelsColors)) {
            labelsState[model] = {};
            labelsColorsVals[model] = {};
            labelToVals[model] = {};
            for (let label of Object.keys(props.labelsColors[model])) {
                // labelsState[model][label] = true;
                labelsState[model][label] = false;
                labelToVals[model][props.labels[model][label]] = label;
            }
        }
        setLabelsColors(props.labelsColors);
        setSwitchLabelsState(labelsState);
        setLabelToVals(labelToVals);
        setLoaded(true);
    }, []);


    React.useEffect(() => {

        const asyncFetch = async () => {
            if (!labelsLoaded) {
                for (let i = 0; i < props.labelsImages.length; i++) {
                    request({
                        url: props.labelsImages[i].image_url,
                        encoding: null
                    }, function (err, res, body) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            new PNG().parse(body, function (err, data) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    setLabelsImages(labelsImages => ({
                                        ...labelsImages,
                                        [props.labelsImages[i].name]: data.data
                                    }));
                                }
                            });
                        }
                        if (i === props.labelsImages.length - 1) {
                            setLabelsLoaded(true);
                        }
                    });
                }

            }
            else {
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
        }
        if (numLoaded % 50 == 0)
            asyncFetch();
    }, [numLoaded, labelsLoaded]);

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
        const asyncDraw = async () => {
            if (numLoaded >= props.images.length) {

                drawOverlays(imageData3D, props.imgSize, props.images.length, selectedImage);
                setFetched(true);
            }
            else if (imagesFetchedList[selectedImage]) {
                drawOverlays(imagesFetchedList[selectedImage], props.imgSize, props.images.length, selectedImage);
                setFetched(true);
            }
        }
        asyncDraw();
    }, [switchLabelsState, labelsColors, labelsOpacity, windowVals, fetched, selectedImage]);


    return (

        <div>

            <div className="modal fade" id="split-img-modal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle" style={{ color: "black" }}>Split View</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className='img-box' style={{ background: "#000000" }}>
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
                                            >
                                                <div style={styles.planesWrapper}>
                                                    <Snackbar
                                                        open={unloadableMessage}
                                                        autoHideDuration={6000}
                                                        message="Cannot show coronal|saggital until all images are loaded"
                                                        sx={{ bottom: { xs: 90, sm: 0 } }}
                                                    />
                                                </div>
                                                <img id="myImg" ref={node => { imgRef1 = node }} width={700} height={700} />

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
                                                    <div style={{ color: '#fff' }}>{Math.round(numLoaded / props.images.length * 100)} %</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='img-box' style={{ background: "#000000" }}>
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
                                            >
                                                <div style={styles.planesWrapper}>
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
                                                <img id="myImg" ref={node => { imgRef2 = node }} width={700} height={700} />

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
                                                    <div style={{ color: '#fff' }}>{Math.round(numLoaded / props.images.length * 100)} %</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className='img-box' style={{ background: "#000000" }}>
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
                                            >
                                                <div style={styles.planesWrapper}>
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
                                                <img id="myImg" ref={node => { imgRef3 = node }} width={700} height={700} />

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
                                                    <div style={{ color: '#fff' }}>{Math.round(numLoaded / props.images.length * 100)} %</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='img-box' style={{ background: "#000000" }}>
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
                                            >
                                                <div style={styles.planesWrapper}>
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
                                                    <div style={{ color: '#fff' }}>{Math.round(numLoaded / props.images.length * 100)} %</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="prediction-pane" style={styles.wrapper}>
                {loaded && <div className="side-pane" style={styles.displayOptions}>
                    <div
                        style={styles.lobesVisibility}
                    >
                        <Grid container sx={{
                            paddingBottom: "10px",
                            alignItems: "center",
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: "10px",
                            width: "100%", textAlign: "center",
                            justifyContent: 'center'
                        }}>
                            <Typography sx={{
                                color: "#000000",
                                fontWeight: "semibold",
                                fontSize: "18px"
                            }}><h4>Label</h4></Typography>
                        </Grid>
                        {
                            Object.entries(props.labels[selectedViewModel]).map((labelAndVal, index) => {
                                const label = labelAndVal[0];
                                return (
                                    <div style={
                                        styles.lobeOption
                                    }>
                                        <h6 style={
                                            styles.lobeOptionText(colorArrayToHexString(labelsColors[selectedViewModel][label]))
                                        }>
                                            {label}
                                        </h6>
                                        <VisibilityEye
                                            style={{ flexGrow: 1 }}
                                            key={label}
                                            name={label}
                                            visible={
                                                switchLabelsState[selectedViewModel][label]
                                            }
                                            onVisibilityChange={
                                                (label, val) => {
                                                    setSwitchLabelsState(prevState => {
                                                        return {
                                                            ...prevState,
                                                            [selectedViewModel]: {
                                                                ...prevState[selectedViewModel],
                                                                [label]: val
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        />
                                        <ColorPicker
                                            style={{ flexGrow: 1 }}
                                            name={label + 'Color'}
                                            value={colorArrayToHexString(labelsColors[selectedViewModel][label])}
                                            hideTextfield={true}
                                            deferred={true}
                                            onChange={
                                                (color) => {
                                                    setLabelsColors(prevState => {
                                                        return {
                                                            ...prevState,
                                                            [selectedViewModel]: {
                                                                ...prevState[selectedViewModel],
                                                                [label]: color.rgb
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        />
                                    </div>
                                );
                            })
                        }

                        <Select
                            fullWidth
                            labelStyle={{ color: '#fff' }}
                            className={styles.modelViewSelect}
                            value={selectedViewModel}
                            onChange={(e) => {
                                setSelectedViewModel(e.target.value);
                                setModelDownload(e.target.value);
                            }}
                        >
                            {
                                Object.keys(labelsColors).map((model, i) => {
                                    return (
                                        <MenuItem key={i} value={model}>
                                            {model}
                                        </MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </div>

                    <Grid container sx={{
                        paddingBottom: "10px",
                        alignItems: "center",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "10px",
                        width: "100%", textAlign: "center",
                        justifyContent: 'center',
                        marginTop: "20px"
                    }}>
                        
                        <Typography sx={{
                            color: "#000000",
                            fontWeight: "semibold",
                            fontSize: "18px"
                        }}><h4>Window</h4></Typography>
                    </Grid>

                    <Windowing
                        onChangeWindow={
                            (wl, ww) => {
                                setWindowVals([wl, ww]);
                            }
                        }
                    />

                    <Grid container sx={{
                        paddingBottom: "10px",
                        alignItems: "center",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "10px",
                        width: "100%", textAlign: "center",
                        justifyContent: 'center',
                        marginTop: "20px"
                    }}>
                        
                        <Typography sx={{
                            color: "#000000",
                            fontWeight: "semibold",
                            fontSize: "18px"
                        }}><h4>Score</h4></Typography>

                
                    </Grid>

                    <div style={styles.buttonsWrapper}>

                        {/* (props.models.indexOf('lobes') > -1 && props.models.indexOf('infiltration') > -1)  */}

                        {true ?
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
                    </div>

                    <Grid container sx={{
                        paddingBottom: "10px",
                        alignItems: "center",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "10px",
                        width: "100%", textAlign: "center",                        
                        justifyContent: 'center',
                        marginTop: "20px"
                    }}>
                        
                        <Typography sx={{
                            color: "#000000",
                            fontWeight: "semibold",
                            fontSize: "18px"
                        }}><h4>Inference</h4></Typography>
                    </Grid>

                    <div style={styles.buttonsWrapper}>
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
                    </div>

                    <Grid container sx={{
                        paddingBottom: "10px",
                        alignItems: "center",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "10px",
                        width: "100%", textAlign: "center",
                        justifyContent: 'center',
                        marginTop: "20px"
                    }}>                    
                        <Typography sx={{
                            color: "#000000",
                            fontWeight: "semibold",
                            fontSize: "18px"
                        }}><h4>Report</h4></Typography>                      
                    </Grid>

                    <div style={styles.buttonsWrapper}>
                        <div style={styles.canvasDownloadWrapper}>
                        
                            {/* <Button
                            style={styles.buttonStyle}
                            href={`http://${hostname}:${port}/api/report/${props.patientId}/${props.uniqueId}/${props.accessKey}`}
                            >
                            Show Report
                           </Button> */}


                           <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `${hostname}:${port}/api/report/${props.patientId}/${props.uniqueId}/${props.accessKey}`;
                                link.target = "_blank";
                                link.rel = "noopener noreferrer";
                                //link.download = `${props.patientId}_${modelDownload}`;
                                console.log(link.href, 'link.href');
                                link.click();
                            }}
                            >
                            Show Report 
                        </Button>

                           <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `${hostname}:${port}/api/report_download/${props.patientId}/${props.uniqueId}/${props.accessKey}`;
                                link.download = `${props.patientId}_${modelDownload}`;
                                console.log(link.href, 'link.href');
                                link.click();
                            }}
                            >
                            Download Report <SaveAltIcon style={{ marginLeft: '10px' }} />
                        </Button>
                        <Button
                            style={styles.buttonStyle}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `${hostname}:${port}/api/report_pdf_download/${props.patientId}/${props.uniqueId}/${props.accessKey}`;
                                link.download = `${props.patientId}_${modelDownload}`;
                                console.log(link.href, 'link.href');
                                link.click();
                            }}
                            >
                            Download Report (PDF) <SaveAltIcon style={{ marginLeft: '10px' }} />
                        </Button>


                        </div>
                    </div>










                    <Grid container sx={{
                        paddingBottom: "10px",
                        alignItems: "center",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "10px",
                        width: "100%", textAlign: "center",
                        justifyContent: 'center',
                        marginTop: "20px"
                    }}>
                        <Typography sx={{
                            color: "#000000",
                            fontWeight: "semibold",
                            fontSize: "18px"
                        }}><h4>Download</h4></Typography>

                       
                    </Grid>

                    <div style={styles.buttonsWrapper}>
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

                            <Button
                                style={styles.buttonStyle}
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `${hostname}:${port}/nii/${props.patientId}/${props.uniqueId}/${props.accessKey}/${modelDownload}`;
                                    // link.download = `${props.patientId}_${modelDownload}.nii.gz`;
                                    link.click();
                                }
                                }>
                                Download NII<SaveAltIcon style={{ marginLeft: '10px' }} />
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `${hostname}:${port}/dcm/${props.patientId}/${props.uniqueId}/${props.accessKey}/${modelDownload}`;
                                    link.download = `${props.patientId}_${modelDownload}.zip`;
                                    link.click();
                                }
                                }>
                                Download DCM (zip)<SaveAltIcon style={{ marginLeft: '10px' }} />
                            </Button>


                        </div>
                    </div>



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
                    >
                        <div style={styles.planesWrapper}>
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
                        <img id="myImg" ref={node => { imgRef = node }} width={700} height={700} style={plane == "axial" ? { objectFit: "none" } : { objectFit: "unset" }} />

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
                            <div style={{ color: '#fff' }}>{Math.round(numLoaded / props.images.length * 100)} %</div>
                        </div>
                    </div>

                </div>
                {loaded &&
                    // <div style={styles.labelsDownloadWrapper}>
                    //     <Select
                    //         style={styles.downloadModelSelect}
                    //         fullWidth
                    //         value={modelDownload}
                    //         onChange={(e) => {
                    //             setModelDownload(e.target.value);
                    //         }}
                    //     >
                    //         { 
                    //             props.models.map((model, index) => {
                    //                 return (
                    //                     <MenuItem
                    //                         key={index}
                    //                         value={model}
                    //                     >
                    //                         {model}
                    //                     </MenuItem>
                    //                 );
                    //             })
                    //         }
                    //     </Select>
                    //    <div style={styles.downloadButtonsWrapper}>
                    // <Button
                    //     style={styles.buttonStyle}
                    //     onClick={() => {
                    //         const link = document.createElement('a');
                    //         link.href = `http://${hostname}:${port}/nii/${props.patientId}/${props.uniqueId}/${props.accessKey}/${modelDownload}`;
                    //         // link.download = `${props.patientId}_${modelDownload}.nii.gz`;
                    //         console.log(link.href, 'link.href');
                    //         link.click();
                    //     }
                    //     }>
                    //     Download NII<SaveAltIcon style={{ marginLeft: '10px' }} />
                    // </Button>
                    // <Button
                    //     style={styles.buttonStyle}
                    //     onClick={() => {
                    //         const link = document.createElement('a');
                    //         link.href = `http://${hostname}:${port}/dcm/${props.patientId}/${props.uniqueId}/${props.accessKey}/${modelDownload}`;
                    //         link.download = `${props.patientId}_${modelDownload}.zip`;
                    //         link.click();
                    //     }
                    //     }>
                    //     Download DCM (zip)<SaveAltIcon style={{ marginLeft: '10px' }} />
                    // </Button>
                    //     </div>
                    // </div> 
                    <div></div>
                }

            </div>

        </div>
    );
}

export default function Prediction2D(props) {
    const [fetched, setFetched] = React.useState(false);
    const [data, setData] = React.useState({});
    const [ notLoggedIn, setNotLoggedIn ] = React.useState(false);

    const handleError = (err) => {
        if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
            // props.history.push('/login');
            console.log(err.response.data, 'err response');
            setNotLoggedIn(true);
        }
        if(err.response.data.message === "User not found") {
            // history.push('/activate');
        }   
        // toast.error(err.message || 'Something went wrong!');

    }

    

    React.useEffect(() => {
        const fetchData = async () => {
            axios.get(`${hostname}:4002/api/view_model?patient_id=${props.patientId}&unique_id=${props.uniqueId}&access_key=${props.accessKey}`,
            { headers: { 
                'authorization': `Bearer ${localStorage.getItem('token')}` 
            }}
            ).then(res => {

                let data = res.data;
                data['images'] = data['images'].map(item => {
                    return {
                        image_url: `${hostname}:${port}/${item}`,
                    }
                });
                data['labels_images'] = data['labels_images'].map(item => {
                    return {
                        image_url: `${hostname}:${port}/${item.url}`,
                        name: item.name,
                    }
                });
                console.log(data, 'before delete');
                for(let model of Object.keys(data['ignore'])){
                    console.log(model, data['ignore'][model]);
                    for(let label of data['ignore'][model]){
                        if(model in data['labels'] && label in data['labels'][model]){
                        delete data['labels'][model][label];
                        delete data['labels_colors'][model][label];
                        }
                    }
                }
                console.log(data, 'after delete');
                setData(data);
                setFetched(true);
            })
            .catch(err => {
                handleError(err);
            });
        }
        if (!fetched)
            fetchData();
    }, [fetched]);

    
    if(notLoggedIn){
        return <Redirect to='/login'  />
    }

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
                        labelsImages={data['labels_images']}
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
}
