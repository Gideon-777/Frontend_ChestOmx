import React, { useEffect } from 'react';
import PredictionNew from './prediction2D/PredictionNew';
import Footer from './includes/Footer';
import CTSSMap from './CTSSMap';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    onPageLoad();
  }, []);

  const onPageLoad = () => {
    // check in local stoage if popup has been shown before
    const user_id = window.localStorage.getItem("user_id");
    const currentValue = window.localStorage.getItem("hasShownCTSSMap_" + user_id);
    if (!currentValue) {
      // if not show the pop and set falg in the localstorage
      setModalOpen(true);
      window.localStorage.setItem("hasShownCTSSMap_" + user_id, true)
    }
  }

  return (
    <>
    <div className="content-wrapper">
      <div className="container-fluid">
        <div className="row justify-content-center fixHeight">
          <div className="col-md-9 blue-bg">
          <h3 className='text-center pt-5 font-weight-bold bottom-line' style={{color: '#00d8f5'}}>NEW INFERENCE JOB</h3>
            <div className="card predict_wrap">
              <PredictionNew />
            </div>
          </div>
        </div>
        <div className="overlay toggle-menu" />
        <Footer />

      </div>
    </div>
    <CTSSMap 
        open={modalOpen} 
        newLogin={true}
        onClose={(reason) => {
          console.log("clicked close!!", reason);
          setModalOpen(false);
        }}
      />
  </>
  )
}