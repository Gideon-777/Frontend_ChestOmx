import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { auth , db } from '../../utils/firebase_init';
import profileImg from '../../assets/profile/user.jpg';

const Header = (props) => {
  const history = useHistory();
  const [data , setData] = useState({});

  const onMenuToggle = () => {
    props.toggleWrapperClass()
  }
  
  useEffect( () => {
    onPageLoad();
    
  },[]);

  const onPageLoad = async () => {
    db.collection("users").onSnapshot(snapshot => {
      snapshot.forEach(item => {
        if(item.data().uid == auth.currentUser.uid){
          setData(item.data());
        }
      })
    });
  }

  const onLogout = () => {
    auth.signOut();
    localStorage.removeItem("user_id")
    history.push("/login");
  }
    return(
        <header className="topbar-nav">
          <nav className="navbar navbar-expand fixed-top">
            <ul className="navbar-nav mr-auto align-items-center">
              <li className="nav-item">
                <a className="nav-link toggle-menu" onClick={onMenuToggle}>
                  <i className="icon-menu menu-icon" />
                </a>
              </li>
            </ul>
            <h3 className='header-title mx-auto text-center'> </h3>
            <ul className="navbar-nav ml-auto align-items-center right-nav-link">
              <li className="nav-item">
                <a className="nav-link dropdown-toggle dropdown-toggle-nocaret" data-toggle="dropdown" href="#">
                  {/* <span className="user-profile"><img src={data.image || "https://via.placeholder.com/110x110"} className="img-circle" alt="user avatar" /></span> */}
                  <span className="user-profile"><img src={profileImg} className="img-circle" alt="user avatar" /></span>
                </a>
                <ul className="dropdown-menu dropdown-menu-right">
                  <li className="dropdown-item user-details">
                    <a>
                      <div className="media">
                        {/* <div className="avatar"><img className="align-self-start mr-3" src="https://via.placeholder.com/110x110" alt="user avatar" /></div> */}
                        <div className="avatar"><img className="align-self-start mr-3" src={profileImg} alt="user avatar" /></div>
                        <div className="media-body">
                          <h6 className="mt-2 user-title">{data?.name}</h6>
                          <p className="user-subtitle">{data?.email}</p>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li className="dropdown-divider" />
                  <li onClick={() => history.push("/profile")} className="dropdown-item"><i className="icon-wallet mr-2" /> Profile</li>
                  <li className="dropdown-divider" />
                  <li onClick={onLogout} className="dropdown-item"><i className="icon-power mr-2" /> Logout</li>
                </ul>
              </li>
            </ul>
          </nav>
        </header>
    );
}

export default Header;