import * as React from 'react';
import Modal from '@mui/material/Modal';
import styles from './prediction2D/Prediction2D.style';

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
                            <p style={{ fontWeight: 800, color: "red" }}>CTSS</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 , color: "red"}}>RUL</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 , color: "red"}}>RML</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 , color: "red"}}>RLL</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 , color: "red"}}>LUL</p>
                        </div>
                        <div style={styles.ctssTd} >
                            <p style={{ fontWeight: 800 , color: "red"}}>LLL</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div style={styles.ctssRow}>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 , color: "red"}}>Inv</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{Math.round(props.ctss.involvement_rul * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{Math.round(props.ctss.involvement_rml * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{Math.round(props.ctss.involvement_rll * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{Math.round(props.ctss.involvement_lul * 10000) / 10000}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{Math.round(props.ctss.involvement_lll * 10000) / 10000}</p>
                        </div>
                    </div>
                    <div style={styles.ctssRow}>
                        <div style={styles.ctssTd}>
                            <p style={{ fontWeight: 800 , color: "red"}}>Score</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{props.ctss.ctss_rul}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{props.ctss.ctss_rml}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{props.ctss.ctss_rll}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{props.ctss.ctss_lul}</p>
                        </div>
                        <div style={styles.ctssTd}>
                            <p style={{ color: "red"}}>{props.ctss.ctss_lll}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default CTSSTable;