import React from 'react';
import Logo from '../../assets/PMXLogo.png';
import { Link } from 'react-router-dom';
import CTSSMap from '../CTSSMap';

const SideNav = () => {
  const [modalOpen, setModalOpen] = React.useState(false);

    return (
        <div id="sidebar-wrapper" data-simplebar data-simplebar-auto-hide="true">
          <div className="brand-logo">
            <Link to="/dashboard">
              <img src={Logo} className="logo-icon" alt="logo icon" />
              {/* <h5 className="logo-text">Lobes</h5> */}
            </Link>
          </div>
          <ul className="sidebar-menu do-nicescrol">
            <li className="sidebar-header">MAIN NAVIGATION</li>
            <li>
              <Link to="/prediction/new">
                <i className="zmdi zmdi-hospital-alt" /> <span>New Prediction</span>
              </Link>
            </li>
            <li>
              <Link to="/prediction/records">
                <i className="zmdi zmdi-grid" /> <span>Predictions</span>
              </Link>
            </li>
            <li>
              <Link
                to='#' 
                 onClick={() => setModalOpen(true)}
                 >
                  <i className="zmdi zmdi-ruler" /><span>CTSS Map</span>
                 </Link>
            </li>
          </ul>
          <CTSSMap 
            open={modalOpen} 
            onClose={(reason) => {
              console.log("clicked close!!", reason);
              setModalOpen(false);
            }}
          />
        </div>
    );
}

export default SideNav;