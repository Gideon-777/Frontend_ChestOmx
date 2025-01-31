import * as React from 'react';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '../FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOBJReader from '@kitware/vtk.js/IO/Misc/OBJReader';
import vtkMTLReader from '@kitware/vtk.js/IO/Misc/MTLReader';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';

import axios from 'axios';

import { hostname, port } from '../../utils/config';
import { CircularProgress } from '@mui/material';

const styles = {
    wrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#4a4a4a',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionsWrapper: {
        minWidth: '200px',
        maxWidth: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
    },
    vtkContainer: (loaded) => ({
        width: '80%',
        height: '100%',
        // display: loaded ? 'block' : 'none',

    }),
    options: {
        padding: '20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    option: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '50px',
    },
    segmentName: {
        fontSize: '16pt',
        color: '#fff',
        fontWeight: 'bold',
    },
    modelSelect: {
        background: '#fff',
        padding: '10px',
        margin: '10px',
    }
}


const VisibilityEye = (props) => {
    const [visible, setVisible] = React.useState(props.visible);
    if (visible) {
        return <VisibilityIcon
            style={{ fill: 'white' }}
            key={props.key}
            onClick={
                () => {
                    setVisible(false);
                    props.onVisibilityChange(props.name, false);
                }
            } />
    } else {
        return <VisibilityOffIcon
            color={"white"}
            key={props.key}
            onClick={
                () => {
                    setVisible(true);
                    props.onVisibilityChange(props.name, true);
                }
            } />
    }
}

export default function Prediction3D(props) {
    const vtkContainerRef = React.useRef(null);
    const context = React.useRef(null);
    const [scene, setScene] = React.useState([]);
    const [model, setModel] = React.useState(null);
    const [models, setModels] = React.useState([]);
    const [ignore, setIgnore] = React.useState({});
    const [loaded, setLoaded] = React.useState(false);
    const [fullScreenRenderer, setFullScreenRenderer] = React.useState(null);
    const [modelOptions, setModelOptions] = React.useState({});
    const [objReaders, setObjReaders] = React.useState({});
    const [mtlReaders, setMtlReaders] = React.useState({});

    console.log('modelOptions', modelOptions);

    React.useEffect(() => {
        axios.get(`${hostname}:${port}/api/models?patient_id=${props.patientId}&unique_id=${props.uniqueId}&access_key=${props.accessKey}`)
            .then(res => {

                setModels(res.data.models);
                setModel(res.data.models[0]);
                setIgnore(res.data.ignore);
                setFullScreenRenderer(vtkFullScreenRenderWindow.newInstance({
                    rootContainer: vtkContainerRef.current,
                    background: [0, 0, 0],
                }));
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    React.useEffect(() => {
        console.log('getting models', models);
        if (model === null || fullScreenRenderer === null) return;
        for (let modelI of models) {
            const objPath = `${hostname}:${port}/get_obj_mtl?patient_id=${props.patientId}&unique_id=${props.uniqueId}&access_key=${props.accessKey}&model=${modelI}&file_type=obj`;
            const mtlPath = `${hostname}:${port}/get_obj_mtl?patient_id=${props.patientId}&unique_id=${props.uniqueId}&access_key=${props.accessKey}&model=${modelI}&file_type=mtl`;
            const objReader = vtkOBJReader.newInstance({ splitMode: 'usemtl' });
            const mtlReader = vtkMTLReader.newInstance();
            if (objReaders[modelI] === undefined || mtlReaders[modelI] === undefined) {
                console.log('getting model ', modelI);
                setObjReaders(prev => ({...prev, [modelI]: objReader}));
                setMtlReaders(prev => ({...prev, [modelI]: mtlReader}));
                // get source from path
                mtlReader.setUrl(mtlPath).then(() => {

                    objReader.setUrl(objPath).then(() => {

                        try {
                            const renderer = fullScreenRenderer.getRenderer();
                            const renderWindow = fullScreenRenderer.getRenderWindow();
                            let sceneList = [];
                            let actors = [];
                            let mappers = [];
                            for (let i = 0; i < objReader.getNumberOfOutputPorts(); i++) {
                                const polydata = objReader.getOutputData(i);
                                const name = polydata.get('name').name;
                                console.log('name', name, ignore);
                                // if(modelI in ignore && ignore[modelI].indexOf(name) > -1) continue;
                                const mapper = vtkMapper.newInstance();
                                mapper.setInputData(polydata);
                                const actor = vtkActor.newInstance();
                                actor.setMapper(mapper);
                                // actor.setVisibility(true);
                                
                                mtlReader.applyMaterialToActor(name, actor);
                                renderer.addActor(actor);
                                sceneList.push({ name, actor, mapper, visible: false });
                                actor.getProperty().setOpacity(0.0);
                                actors.push(actor);
                                mappers.push(mapper);
                            }
                            renderer.resetCamera();
                            renderWindow.render();
                            setScene((prevState) => {
                                return [...prevState, ...sceneList];
                            });
                            setModelOptions(modelOptions => {
                                return { ...modelOptions, [modelI]: sceneList };
                            });
                            

                            // setLoaded(true);
                            context.current = {
                                renderWindow,
                                renderer,
                                actors,
                                mappers,
                                // coneSource,
                            };
                        } catch(err) {
                            console.log('err', err);
                        }
                    });

                });
            }
        }
        return () => {

            // setLoaded(false);
            // if (context.current) {
            //     const { actors, mappers } = context.current;
            //     const renderer = fullScreenRenderer.getRenderer();
            //     for(let actor in actors){
            //         renderer.removeActor(actor);
            //     }
            //     // actors.delete();
            //     // mappers.delete();
            //     // fullScreenRenderer.delete();
            //     context.current = null;
            // }
        };


    }, [model, fullScreenRenderer]);

    React.useEffect(() => {
        if(loaded){
            for(let model of models){
                console.log(model, 'model');
                for(let modelOption of modelOptions[model]){
                    modelOption.actor.getProperty().setOpacity(0.0);
                }
            }
            setModelOptions(modelOptions => {
                return {...modelOptions, [model]: modelOptions[model].map(modelOption => {
                    return {...modelOption, visible: false};
                })};
            });
            context.current.renderWindow.render();
        }
    }, [model]);

    React.useEffect(() => {
        if(models.length > 0 && models.filter(model => modelOptions[model] === undefined).length === 0)
            setLoaded(true);
    }, [modelOptions, models]);

    return (
        <div style={styles.wrapper}>
            <div style={styles.optionsWrapper}>
                <FormControl style={{ margin: '20px' }}>
                    <Select
                        style={styles.modelSelect}
                        value={model}
                        onChange={(e) => {
                            setModel(e.target.value);
                        }}
                    >
                        {
                            models.map((model, index) => {
                                return <MenuItem key={index} value={model}>{model}</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
                <div style={styles.options}>
                    {
                        model in modelOptions &&
                        // scene.map(({ name, actor, mapper }) => {
                        modelOptions[model].map(({ name, actor, mapper, visible }) => {
                            return (
                                <div key={name} style={styles.option}>
                                    <label></label>
                                    <p style={styles.segmentName}>{name.toUpperCase()}</p>
                                    <VisibilityEye 
                                    name={name}
                                    // visible={actor.getVisibility()}
                                    visible={visible}
                                    onVisibilityChange={(name, visible) => {
                                        console.log('settg visibility ', visible, name);
                                            // actor.setVisibility(visible);
                                            if(visible)
                                                actor.getProperty().setOpacity(1.0);
                                            else
                                                actor.getProperty().setOpacity(0.0);
                                            setModelOptions(modelOptions => {
                                                return {...modelOptions, [model]: modelOptions[model].map((option) => {
                                                    if(option.name === name) {
                                                        return {...option, visible};
                                                    }
                                                    return option;
                                                })};
                                            });

                                            context.current.renderWindow.render();
                                    }}
                                />
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div id="vtkContainer" ref={vtkContainerRef} style={styles.vtkContainer(loaded)} />  
            {
                !loaded ? <CircularProgress style={{ margin: '20px' }} /> : null
            }
        </div>
    );
}