import * as React from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Prediction3D from '../includes/Prediction3D.jsx';
import Prediction2D from './Prediction2D.jsx';
import Footer from '../includes/Footer'

export default function Prediction(props) {
  const { patientId, uniqueId, accessKey } = useParams();
  const [show3D, setShow3D] = React.useState(false);

  return (
    <div className="content-wrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card card-2d-wrap">
              <div>
                <Button onClick={() => setShow3D(false)}>2D</Button>
                <Button onClick={() => setShow3D(true)}>3D</Button>
              </div>
              {
                show3D ?
                  <Prediction3D
                    patientId={patientId}
                    uniqueId={uniqueId}
                    accessKey={accessKey}
                  /> :
                  <Prediction2D
                    patientId={patientId}
                    uniqueId={uniqueId}
                    accessKey={accessKey}
                  />
              }
            </div>
          </div>
        </div>
        <div className="overlay toggle-menu" />
      </div>
      <Footer />

    </div>

  );

}
