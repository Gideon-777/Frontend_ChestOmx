import * as React from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { CSVLink } from 'react-csv';
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { CircularProgress } from '@material-ui/core';
import styles from './prediction2D/Prediction2D.style';
import { hostname, port } from '../utils/config';

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
                req.setRequestHeader('authorization', 'Bearer ' + localStorage.getItem('token'));
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
            url={`${hostname}:${port}/api/prediction/calc_metrics`}
            fileType={'nii'}
            method={'POST'}
            uniqueId={props.uniqueId}
            patientId={props.patientId}
            model={props.model}
            onProgress={(e) => console.log(e)}
            onComplete={(e) => {
                console.log(e, e.status, e.message);
                if (e.status === true && e.message === 'Calculating metrics!'){
                    console.log('hi');
                    props.onUploaded(true);
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
            <CSVLink filename={`${props.model}_metrics.csv`} data={csvData} style={styles.csvLink}>Download CSV</CSVLink>
            <Button
                onClick={() => {
                    props.onResetClicked();
                }}
            >Reset</Button>
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
    const [reset, setReset] = React.useState(false);
    React.useEffect(() => {
        setLoading(true);
        setShowMetrics(false);
        setUploadLabel(false);
        if(!reset)
        axios.get(`${hostname}:4002/api/prediction/metrics?model=${selectedModel}&unique_id=${props.uniqueId}`).then(res => {
            console.log('res', res);
            if (res.data.message === 'Metrics for the model do not exist!'){
                console.log('metrics not found');
                setUploadLabel(true);
            }
            else if (res.data.message === 'Metrics Calculated!') {
                setMetrics(res.data.metrics);
                setShowMetrics(true);
                setCalculating(false);
            }
            else if (res.data.message === 'Metrics are being calculated!'){
                console.log('metrics are being calculated');
                setTimeout(() => {
                    setRetry(retry + 1);
                }, 100);
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
                                onUploaded={(val) => {
                                    console.log('uploaded');
                                    if(val) {
                                        setCalculating(true);
                                        setLoading(false);
                                        setReset(false);
                                        setTimeout(() => {
                                            setRetry(retry + 1);
                                        }, 100);
                                    }
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
                    showMetrics ? 
                    <Metrics 
                    model={selectedModel}
                    metrics={metrics}
                    onResetClicked={()=> {
                        setShowMetrics(false);
                        setReset(true);
                        setUploadLabel(true);
                    }}
                    
                    /> : null
                }
            </div>
        </Modal>
    )

}

export default MetricsModal;
