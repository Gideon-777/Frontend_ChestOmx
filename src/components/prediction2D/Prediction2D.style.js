
const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%',
        paddingBottom: '50px',
        // background: '#0e0e0e',
    },
    modal: {
        flex: '4',
        background: '#0e0e0e',
        opacity: 1,
        padding: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
    },
    metricsModal: {
        width: '60%',
        maxWidth: '900px',
        height: '60%',
        maxHeight: '900px',
        background: '#fff',
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
    metricsTable: {
        marginTop: '20px',
        marginBottom: '20px',
        width: '100%',
    },
    metricsWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    csvLink: {
        marginTop: '20px',
        background: '#83f',
        color: '#fff',
    },
    root: {
        flexWrap: 'wrap',
        // justifyContent: 'space-around',
        // alignItems: 'center',
        // flexDirection: 'column',
        padding: '10px',
        height: '100%',
    },
    image_grid: {
        width: '100%',
        height: '100%',
        display: 'grid',
        margin: '10px',
        gridRowGap: '10px',
        gridColumnGap: '10px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))'
    },
    image: {
        maxWidth: '360px',
    },
    imageWrapper: {
        background: 'url("/app/assets/loading_spinner.gif") center center no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    buttonVisible: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        alignItems: 'center',
        margin: '10px',
        width: '100%'
    },
    buttonInvisible: {
        display: 'none'
    },
    imageCanvas: {
        maxWidth: '90%'
    },
    canvasWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    displayOptions: {
        flex: '1',
        display: 'flex',
        padding: '10px',
        flexDirection: 'column',
        background: '#ffffffc2',
        height: '74vh',
        overflow: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #00000045',
        borderRadius: '5px',
        marginRight: '20px',
    },
    buttonsWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    modelViewSelect: {
        minWidth: '150px',
        minHeight: '400px',
    },
    modalViewSelectPlane: {
        backgroundColor: "white",
        width: "134px",
        position: "relative",
        left: "-283px",
    },
    lobeOption: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '30px',
        justifyContent: 'space-between',
        margin: '5px',
        minWidth: '40px',
        width: '100%',
        padding: '5px',
        alignItems: 'center'
    },
    lobeOptionText: (color) => {
        return {
            color: color,
            fontSize: '1.2em',
            paddingRight: '5px',
            flexGrow: 4
        }
    },
    windowOptions: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center'
    },
    windowOptionsRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px'
    },
    buttonStyle: {
        marginTop: '15px',
        flex: 1,
        margin: '10px',
        // opacity: 0.5,
        background: '#203a43',
        color: 'white',
        border: '1px solid #203a43',
        '&:hover': {
            opacity: 0.8,
            cursor: 'pointer',
        },
        width: '100%',
        maxWidth: '200px',
        maxHeight: '40px',
    },
    planeButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        minWidth: '200px',
        minHeight: '50px',
        alignItems: 'center',
        width: '70%',
      
    },
    planeButton: (checked) => {
        return {
            flex: 1,
            margin: '10px',
            opacity: 0.8,
            background: checked ? '#00d8f5' : '#fff',
            color: checked ? '#000' : '#000',
            border: checked ? '1px solid #00d8f5' : '1px solid #000',
            '&:hover': {
                opacity: 0.8,
                cursor: 'pointer',
            },
            minWidth: '50px',
        }
    },
    planesWrapper: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '50px',
        maxWidth: '300px',
    },
    canvasDownloadWrapper: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'end',
        alignItems: 'center',
        margin: '0 10px',
        width: '100%'
    },
    slicesSelect: {
        marginTop: '10px',
        maxHeight: '30px',
        marginLeft: '10px',
        width: '100%',
        maxWidth: '200px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sliceRangeSelect: {
        flex: 1,
        minWidth: '100px',
        marginLeft: '20px',
    },
    lobesVisibility: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        maxHeight: '400px',
        padding: '0',
        overflow: 'hidden',
        scrollbarWidth: 'none'
    },
    ctss: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    ctssTable: {
        width: '50%',
        height: '50%',
        background: '#fff',
        opacity: 1,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        margin: '0',
        padding: '0',
        top: '50%',
        left: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
        minHeight: '100px',
        display: 'flex',
        boxShadow: '0 0 10px rgb(0,0,0)'
    },
    ctssRow: {
        maxHeight: '40px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        alignItems: 'center',
        // border: '3px solid #000',
        // borderRadius: '2px',

    },
    ctssTd: {
        // border: '1px solid #000',
        minWidth: '20px',
        maxHeight: '30px',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        width: '66px',
        border: '2px solid #eee',
        borderRight: 'none',
        paddingLeft: '5px',
    },
    metricsRow: {
        // maxHeight: '40px',
        // display: 'flex',
        // flexDirection: 'row',
        // justifyContent: 'stretch',
        // alignItems: 'center',
    },
    metricsTd: {
        width: '80px',
        textAlign: 'center',
        color: "red"
        // maxHeight: '30px',
        // alignItems: 'center',
        // display: 'flex',
        // flexDirection: 'row',
        // border: '2px solid #eee',
        // borderRight: 'none',
        // paddingLeft: '5px',
    },
    scrollButton: {
        height: '100%',
    },
    filetypeButton: (checked) => {
        return {
            flex: 1,
            margin: '10px',
            opacity: 0.8,
            background: checked ? '#00f' : '#eee',
            color: checked ? 'white' : 'black',
            border: '1px solid #00e',
            '&:hover': {
                opacity: 0.8,
                cursor: 'pointer',
            },
            minWidth: '100px',
            maxWidth: '300px',
        }
    },
    progress: {
        height: '30px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    labelsDownloadWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minWidth: '200px',
        maxWidth: '300px',
        border: '1px solid #000',
        borderRadius: '5px',
        padding: '10px',
        height: '100%',
        background: '#fff',
        marginLeft: '20px'
    },
    downloadModelSelect: {
        marginTop: '30px',
    },
    downloadButtonsWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    }

}

export default styles;