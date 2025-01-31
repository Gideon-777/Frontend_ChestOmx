import { useParams, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { makeStyles, fade } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import HumanVideo from '../../assets/video/human_-_37515 (Original).mp4';
import Footer from '../includes/Footer';
import {
    Table,
    Typography,
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    TableContainer,
    TableFooter,
    TablePagination,
    IconButton,
    Button,
    Input,
} from '@material-ui/core';
import { Clear, Search } from '@material-ui/icons';
import RefreshIcon from '@mui/icons-material/Refresh';
import { hostname, port } from '../../utils/config';
import  { Redirect } from 'react-router-dom'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import LaunchIcon from '@mui/icons-material/Launch';
import DownloadIcon from '@mui/icons-material/Download';

const useStyles = makeStyles((theme) => {
    return ({
        drawer: {
            width: 240,
        },
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            // padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            // ...theme.mixins.toolbar,
            justifyContent: "flex-end"
        },
        dashboardButton: {
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

        tableContainer: {
            marginTop: 10,
            width: '85%',
            // height: '85%',
            borderWidth: 1,
            borderColor: '#aaa',
            borderStyle: 'solid',
        },
        tableFilterArea: {
            marginTop: 15,
            marginBottom: 15,
            display: 'flex',
            justifyContent: 'flex-end'
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginLeft: 'auto',
            width: '200px',
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        deleteIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: '#00d8f5',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
        },
        tableRecord: {
            cursor: 'pointer',
            // For Table Row Hover State bg color
            // '&:hover': {
            //     background: '#ccc',
            // }
        },
        tableCellText: {
            fontSize: 16,
            fontWeight: 700,
            color: '#000',
        },
        autoRefreshCheckbox: {
            opacity: 0.8,
            color: '#fff',
        },
        deleteForeverIcon: {
            color: 'red',
            cursor: 'pointer'
        },
        dialogButtonsWrapper: {
            width: '80%',
            height: '100px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: '10px',
            alignItems: 'center'
        },
        deleteButton: {
            background: 'red',
            color: 'white',
            width: '100px',
            height: '40px'
        },
        cancelButton: {
            background: 'blue',
            color: 'white',
            width: '100px',
            height: '40px'
        },
        deleteDialog: {
            padding: '10px',
        },
        editModal: {
            width: '500px',
            height: '600px',
            backgroundColor: '#fff',
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
    
        },
        editRecordWrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '95%',
            height: '90%',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        editRecordRow: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between'
        },
        saveButton: {
            background: '#203a43',
            color: 'white',
            width: '80%',
            height: '40px'
        },
    })
});

const DeleteDialog = (props) => {
    const { onClose, selectedValue, open } = props;
    const classes = useStyles();
  
    const handleClose = () => {console.log('closing');}
  
    return (
      <Dialog classes={classes.deleteDialog} 
      PaperProps={{
        style: {
            padding: '10px',
            margin: '10px'
        }
      }}
      onClose={handleClose} open={open}
      >
        <DialogTitle style={{color: 'black', fontSize: '24pt', fontWeight: '800'}}>Delete Record</DialogTitle>
        <h5 style={{color: 'black', marginLeft: '10%', marginRight: '10%'}}>Are you sure you want to delete Patient: <b>{props.patientId}</b> with uniqueId: <b>{props.uniqueId}</b>??</h5>
        <div className={classes.dialogButtonsWrapper}>
            <Button
                className={classes.deleteButton}
                onClick={() => {
                    console.log('deleted', props.patientId, props.uniqueId);
                    const data = {
                        'patient_id': props.patientId,
                        'unique_id': props.uniqueId,
                    }
                    axios.post(`${hostname}:${port}/api/delete_record`, data,
                    { headers: { 
                        'authorization': `Bearer ${localStorage.getItem('token')}` 
                    }})
                    .then(res => {
                        console.log('res', res);
                        toast.success(res.message);
                        props.onClose();
                    })
                    .catch(err => {
                        console.log('err', err);
                        toast.error(err.message || 'Something went wrong!');
                    })
                    .finally(() => {
                        props.onClose();
                    });                    
                }}
            >Delete</Button>
            <Button
                className={classes.cancelButton}
                onClick={() => {
                    console.log('cancelled');
                    props.onClose();
                }}
            >Cancel</Button>

        </div>
      </Dialog>
    );
  }


function TableRecord(props) {
    const { record, history, tableRecord,columns } = props;
    const classes = useStyles();
    return (
        <TableRow
            className={tableRecord}
           
        >   
        {columns.map(column => (
  <TableCell  key={column.id} {...(column.onClick && { onClick: () => column.onClick(record) })}>
  {column.renderer ? column.renderer(record) : column.accessor(record) }
</TableCell>
        ))}
            <TableCell
                onClick={() => {
                    const link = document.createElement('a');
                    link.href = `${hostname}:${port}/api/report_pdf_download/${record.patientId}/${record.uniqueId}/${record.accessKey}`;
                    link.download = `${record.patientId}_${record.uniqueId}`;
                    console.log(link.href, 'link.href');
                    link.click();
                }}
            >
                <DownloadIcon/>
            </TableCell>
            <TableCell
                style={{
                    //display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <EditIcon 
                    className={classes.editIcon}
                    onClick={() => {
                        props.onEditClick();
                    }}
                />
                <DeleteForeverIcon
                    className={classes.deleteForeverIcon}
                    onClick={(e) => {
                        console.log('Deleting....')
                        props.onDeleteClick();
                    }}
                    />
            </TableCell>
        </TableRow>
    );
}

function ColumnSelector(props) {
    const {visibleColumns,setVisibleColumns,columnsList} = props;
    return (
        <Select
        style={{marginLeft: 'auto',marginRight:'20px'}}
        labelId="column-selector-label"
        id="column-selector"
        multiple
        value={visibleColumns}
        onChange={(ev) => setVisibleColumns(ev.target.value)}
        input={<Input />}
        renderValue={(selected) => <>{selected.length} columns selected</>}
      >
        {columnsList.map(({id,name}) => (
          <MenuItem key={id} value={id} disabled={['uniqueId','patientId','prediction'].includes(id)}>
            <Checkbox checked={visibleColumns.includes(id)} />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    )
}

export default function PredictionList(props) {

    const { model } = useParams();
    const history = useHistory();

    const [fetchedRecords, setFetchedRecords] = useState([]);
    const [activated, setActivated] = useState(false);
    const classes = useStyles();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [textFilter, setTextFilter] = useState('');
    const [ notLoggedIn, setNotLoggedIn ] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePatientId, setDeletePatientId] = useState('');
    const [deleteUniqueId, setDeleteUniqueId] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState({});
    const defaultVisibleColumns = ['uniqueId','patientId','name','desc','status','models','prediction'];
    const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

    const columns = [{
        id: 'uniqueId',
        title: 'UniqueID',
        accessor: (data) => data.uniqueId,
        isVisible: () => false,
        renderer: (data) => (
            <div>
           <span> {data.uniqueId.substring(0,16)}</span>
           <span> {data.uniqueId.substring(16)}</span>
            </div>
        )
    },
{
    id: 'patientId',
    title: 'PatientID',
    accessor: (data) => data.patientId,
    isVisible: () => true,
},
{
    id: 'name',
    title: 'PatientName',
    accessor: (data) => data.patientName,
    isVisible: () => true,
},
{
    id: 'dob',
    title: 'PatientDOB',
    accessor: (data) => data.patientBirthDate,
},
{
    id: 'sex',
    title: 'PatientSex',
    renderer: (record) => (
        <> {record.patientSex === 'F'? 'Female': (record.patientSex === 'M'? 'Male': record.patientSex)}</>
    ),
},
{
    id: 'institution',
    title: 'Institution',
    accessor: (data) => data.institutionName,
},
{
    id: 'desc',
    title: 'SeriesDesc',
    accessor: (data) => data.seriesDesc,
},
{
    id: 'recvat',
    title: 'ReceivedAt',
    accessor: (data) => data.receivedAt,
},
{
    id: 'predictedAt',
    title: 'PredictedAt',
    accessor: (data) => data.predictedAt,
    cellSize: 'medium'
},
{
    id: 'status',
    title: 'PredictionStatus',
    accessor: (data) => data.predictionStatus,
    cellSize: 'medium'
},
{
    id: 'models',
    title: 'Models',
    accessor: (data) => data.models,
    cellSize: 'medium'
},
{
    id: 'prediction',
    title: 'Prediction',
    renderer: () => ( <LaunchIcon />),
    onClick:(record) => {
        if(record.accessId !== undefined) {
            history.push(`/prediction/${record.patientId}/${record.uniqueId}/${record.accessId}`)
        } 
    },
    cellSize: 'medium'
}

]

    const handleError = (err) => {
        if (err.response.data.message === 'No token provided' || err.response.data.message === 'Invalid token provided.' || err.response.data.message === 'Token expired.') {
            // props.history.push('/login');
            console.log(err.response.data, 'err response');
            setNotLoggedIn(true);
        }
        if(err.response.data.message === "User not found") {
            history.push('/activate');
        }   
        toast.error(err.message || 'Something went wrong!');

    }
    
    const getData = async () => {
        console.log("calling get data")
        try {
            const fetchedRecords = await axios.get(`${hostname}:${port}/api/records`, { headers: { 
                'authorization': `Bearer ${localStorage.getItem('token')}` 
            }});
            setFetchedRecords(fetchedRecords.data);
        } catch (err) {
           handleError(err);
        }
    }

    useEffect(() => {
        getData();
    }, [activated]);

    useEffect(() => {
        onPageLoad();
    }, []);

    // console.log(props.history, 'history');

    const onPageLoad = async () => {
        try {
            await axios.get(`${hostname}:${port}/api/is_activated`,{ headers: { 
                authorization: 'Bearer ' + localStorage.getItem('token') 
            }});
            setActivated(true);
        } catch (err) {
            handleError(err);
        }

    }

    const changeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value));
        setPage(0);
    }
    const changePage = (event, newPage) => {
        setPage(parseInt(newPage, 10));
    }
    const handleSearchChange = (event) => {
        setTextFilter(event.target.value);
    }

    // filter if any of the column matches the textFilter
    const filteredRecords = fetchedRecords.filter((record) => {
        for(let key in record) {
            if(record[key].toString().toLowerCase().includes(textFilter.toLowerCase())) {
                return true;
            }
        }
        return false;
    });

    const filteredColumns = columns.filter((c) => visibleColumns.includes(c.id));

    const handleAutoRefresh = (e) => {
        console.log("event.target.checked", e.target.checked)
        if (e.target.checked) {
            console.log("enable auto refresh")
            const ri = setInterval(function() {
                getData();
            }, 1000 * 5)
            setRefreshInterval(ri)
        } else {
            console.log("disable auto refresh", refreshInterval)
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        }
    }

    if(notLoggedIn){
        return <Redirect to='/login'  />
    }
    
    return (
    <>
        <div className="content-wrapper" style={{position: 'relative'}}>
            {/* <video id="human_video" playsInline loop autoPlay>
                <source
                    src={HumanVideo}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
             </video>  */
             }
            <div className="container-fluid"> 
                <div className="row">
                    <div className="col-12">
                        <div className="card card-page" style={{marginLeft: '10px'}}>
                            <div className={classes.search}>
                                <div className={classes.searchIcon}>
                                    <Search />
                                </div>
                                <Input
                                    placeholder="Search…"
                                    fullWidth={true}
                                    classes={{
                                        root: classes.inputRoot,
                                        input: classes.inputInput,
                                    }}
                                    inputProps={{ 'aria-label': 'search' }}
                                    onChange={handleSearchChange}
                                    value={textFilter}
                                    endAdornment={
                                        <IconButton
                                            className={classes.deleteIcon}
                                            onClick={() => {
                                                setTextFilter('')
                                            }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    }
                                />
                            </div>
                            <div style={{display:'flex',marginTop:'10px',marginBottom:'10px'}}>
                            <Button style={{color: '#00d8f5'}}
                                    onClick={() => {
                                        getData();
                                    }}
                                >
                                    <RefreshIcon />
                                </Button>
                                <Tooltip title={<div style={{fontSize: "14px", color: '#00d8f5'}}>Enable auto refresh every 5 seconds</div>}>
                                    <Checkbox color='#00d8f5' style={{color: '#00d8f5'}} onChange={handleAutoRefresh} defaultChecked={false} />
                                </Tooltip>
                                <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} columnsList={columns.map(c => ({name:c.title,id:c.id}))}/>
                            </div>
                            <TableContainer>
                                <Table stickyHeader className='table-design'>
                                    <TableHead className='record-table-head'>
                                        <TableRow>
                                            {filteredColumns.map(column => (
                                                 <TableCell size={column.cellSize || 'small'} key={column.id}>
                                                 <Typography className={classes.tableCellText}>{column.title}</Typography>
                                             </TableCell>  
                                            ))}
                                            <TableCell size="medium">
                                                <Typography className={classes.tableCellText}>Report</Typography>
                                            </TableCell>
                                            <TableCell size="small">
                                                <Typography className={classes.tableCellText}>Actions</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRecords.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(record => (
                                            <TableRecord
                                                record={record}
                                                tableRecord={classes.tableRecord}
                                                history={history}
                                                model={model}
                                                columns={filteredColumns}
                                                onDeleteClick={() => {
                                                    setDeleteDialogOpen(true);
                                                    setDeletePatientId(record.patientId);
                                                    setDeleteUniqueId(record.uniqueId);
                                                }}
                                                onEditClick={() => {
                                                    setEditRecord(record);
                                                    setEditModalOpen(true);
                                                }}
                                            />
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                                colSpan={4}
                                                count={filteredRecords.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                SelectProps={{
                                                    inputProps: { 'aria-label': 'rows per page' },
                                                    native: true,
                                                }}
                                                onChangePage={changePage}
                                                onChangeRowsPerPage={changeRowsPerPage}
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                            <DeleteDialog
                                open={deleteDialogOpen}
                                patientId={deletePatientId}
                                uniqueId={deleteUniqueId}
                                onClose={() => {
                                    setDeleteDialogOpen(false);
                                    getData();
                                }}
                                />
                            <Modal
                                open={editModalOpen}
                                onClose={() => {
                                    setEditModalOpen(false);
                                    setEditRecord({});
                                }}
                            >
                                <div className={classes.editModal}>
                                    <div className={classes.editRecordWrapper}>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>PatientID</p>
                                        <TextField 
                                            value={editRecord.patientId}
                                            disabled={true}
                                            
                                        />
                                        </div>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>PatientName</p>
                                        <TextField 
                                            value={editRecord.patientName}
                                            onChange={(e) => {
                                                console.log(e, e.target.value, editRecord, 'patientName');
                                                setEditRecord({...editRecord, patientName: e.target.value});
                                            }}
                                        />
                                        </div>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>PatientDob</p>
                                        <TextField 
                                            value={editRecord.patientBirthDate}
                                            onChange={(e) => {
                                                setEditRecord({...editRecord, patientBirthDate: e.target.value});
                                            }}
                                        />
                                        </div>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>PatientSex</p>
                                        <TextField 
                                            value={editRecord.patientSex}
                                            onChange={(e) => {
                                                setEditRecord({...editRecord, patientSex: e.target.value});
                                            }}
                                        />
                                        </div>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>Institution Name</p>
                                        <TextField 
                                            value={editRecord.institutionName}
                                            onChange={(e) => {
                                                setEditRecord({...editRecord, institutionName: e.target.value});
                                            }}
                                        />
                                        </div>
                                        <div className={classes.editRecordRow}>
                                        <p style={{color: 'black'}}>Series Desc</p>
                                        <TextField 
                                            value={editRecord.seriesDesc}
                                            onChange={(e) => {
                                                setEditRecord({...editRecord, seriesDesc: e.target.value});
                                            }}
                                        />
                                        </div>
                                        <Button 
                                        className={classes.saveButton}
                                        variant="contained"
                                        onClick={() => {
                                            console.log('saving!!!');
                                            const data = {
                                                'patient_id': editRecord.patientId,
                                                'unique_id': editRecord.uniqueId,
                                                'patient_name': editRecord.patientName,
                                                'patient_dob': editRecord.patientBirthDate,
                                                'patient_sex': editRecord.patientSex,
                                                'institution_name': editRecord.institutionName,
                                                'series_desc': editRecord.seriesDesc
                                            };
                                            axios.post(`${hostname}:${port}/api/edit_record`, data,
                                            { headers: { 
                                                'authorization': `Bearer ${localStorage.getItem('token')}` 
                                            }})
                                            .then(res => {
                                                console.log('res', res);
                                                toast.success(res.data.message);
                                            })
                                            .catch(err => {
                                                console.log('err', err);
                                               
                                                
                                                handleError(err);
                                            })
                                            .finally(() => {
                                                setEditModalOpen(false);
                                                getData();
                                            }); 
                                        }}
                                    >Save</Button>
                                    </div>
                                  
                                </div>

                            </Modal>
                        </div>
                    </div>
                </div>
                <div className="overlay toggle-menu" />
            </div>
        </div>
        <Footer />
    </>
);
}