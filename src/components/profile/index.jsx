import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import { toast } from 'react-toastify';
import { db, auth, storage } from '../../utils/firebase_init';
import Footer from '../includes/Footer';
import { hostname, port } from '../../utils/config.js';
import axios from 'axios';
import profileImg from '../../assets/profile/user.jpg';

const Profile = () => {
  const [data, setData] = useState({
    email: "",
    name: "",
    phone: "",
    institution: "",
    country: "",
    profession: "",
    id: "",
    image: ""
  });

  useEffect(() => {
    onPageLoad();
  }, []);

  const onPageLoad = async () => {
    // db.collection("users").onSnapshot(snapshot => {
    //   snapshot.forEach(item => {
    //     if (item.data().uid == auth.currentUser.uid) {
    //       setData({ ...item.data(), id: item.id });
    //     }
    //   })
    // });
    const profileDataURL = `${hostname}:${port}/api/user`;
    axios.get(profileDataURL,
      { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } })
    .then(res => {
      console.log('res', res);
      setData(res.data);
    })
    .catch(err => {
      console.log('err', err);
      toast.error(err.message);
    })
  }

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const onUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // const update_doc = await db.collection("users").doc(data.id).update({ ...data });
      const updateProfileDataURL = `${hostname}:${port}/api/user`;
      axios.post(updateProfileDataURL, data,
        { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => {
          console.log('res', res);
          toast.success(res.data.message);
        })
        .catch(err => {
          console.log('err', err)
          toast.error(err.message);
        })
      // toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  }

  const onImageUpload = (e) => {
    // setData({...data , ["image"]: e.target.files[0] });
    const img = e.target.files[0];
    const uploadTask = storage.ref(`/images/${e.target.files[0].name}`).put(e.target.files[0])
    uploadTask.on('state_changed',
      (snapShot) => {
      }, (err) => {
        console.log(err)
      }, () => {
        storage.ref('images').child(img.name).getDownloadURL()
          .then(fireBaseUrl => {
            setData({ ...data, ["image"]: fireBaseUrl });

            //  setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
          })
      })
  }
  return (
    <>
      <div className="content-wrapper">
        <div className="container-fluid">
          <div className="row mt-3 mb-3 fixHeight">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">

                  <ul className="nav nav-tabs nav-tabs-primary top-icon nav-justified">
                    <li className="nav-item">
                      <a data-target="#edit" data-toggle="pill" className="nav-link"><i className="icon-note" /> <span className="hidden-xs">Profile</span></a>
                    </li>
                  </ul>
                  <div className="edit_image">
                    {/* <img src={data.image || "https://via.placeholder.com/110x110"} alt="profile-image" className="profile" style={{ borderRadius: "50%", height: "200px", width: "200px" }} /> */}
                    {/* <img src={profileImg} alt="profile-image" className="profile" style={{ borderRadius: "50%", height: "200px", width: "200px" }} /> */}
                  </div>
                  <div className="tab-content p-3">
                    <div className="tab-pane active" id="edit">
                      <form onSubmit={onUpdateProfile}>
                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Name</label>
                          <div className="col-lg-9">
                            <input name="name" value={data.name} onChange={onChange} className="form-control" type="text" />
                          </div>
                        </div>
                        {/* <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Change profile</label>
                          <div className="col-lg-9">
                            <input onChange={e => onImageUpload(e)} className="form-control" type="file" />
                          </div>
                        </div> */}

                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Phone</label>
                          <div id="profile" className="col-lg-9">
                            <input name="phone" value={data.phone} onChange={onChange} className="form-control" type="number" />
                            {/* <PhoneInput
                            inputClass='field_wrap'
                            country={'us'}
                            value={data.phone}
                            onChange={phone => setData({...data, ["phone"]: phone})}
                            /> */}
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Country</label>
                          <div className="col-lg-9">
                            <input name="country" value={data.country} onChange={onChange} className="form-control" type="text" />
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Institution</label>
                          <div className="col-lg-9">
                            <input name="institution" value={data.institution} onChange={onChange} className="form-control" type="text" />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label">Profession</label>
                          <div className="col-lg-9">
                            <input name="profession" value={data.profession} onChange={onChange} className="form-control" type="text" />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label form-control-label" />
                          <div className="col-lg-9">
                            <input type="submit" className="custom-blue-btn btn" defaultValue="Save Changes" />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*start overlay*/}
          <div className="overlay toggle-menu" />
          {/*end overlay*/}
          <Footer />

        </div>
        {/* End container-fluid*/}
      </div>
    </>
  )
}

export default Profile;
