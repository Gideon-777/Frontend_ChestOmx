import React, { useState } from 'react';
import { Link , useHistory } from 'react-router-dom';
import { auth } from '../../utils/firebase_init';
import { toast } from 'react-toastify';
import ParticlesComponent from '../includes/Particles';
const ResetPassword = () => {
    const history = useHistory();
    const [email , setEmail] = useState("");

    const onResetPassword = async () => {
        try {
            const res = await auth.sendPasswordResetEmail(email);
            
            toast.success("Password reset link send to you email!");
            history.push("/login");
        } catch (error) {
            toast.error(error.message || "Invalid input data");
        }
    }
    return ( 
    <div id="wrapper">
      <ParticlesComponent />
    <div className="height-100v d-flex align-items-center justify-content-center">
      <div className="card card-authentication1 mb-0">
        <div className="card-body">
          <div className="card-content p-2">
            <div className="card-title text-uppercase pb-2">Reset Password</div>
            <p className="pb-2">Please enter your email address. You will receive a link to create a new password via email.</p>
            <form>
              <div className="form-group">
                <label htmlFor="exampleInputEmailAddress" className>Email Address</label>
                <div className="position-relative has-icon-right">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} id="exampleInputEmailAddress" className="form-control input-shadow" placeholder="Email Address" />
                  <div className="form-control-position">
                    <i className="icon-envelope-open" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={onResetPassword} className="btn btn-light btn-block mt-3">Reset Password</button>
            </form>
          </div>
        </div>
        <div className="card-footer text-center py-3">
          <p className="text-warning mb-0">Return to the <Link style={{ color: "blue" }} to="/login"> Sign In</Link></p>
        </div>
      </div>
    </div>
  </div>
    )
}

export default ResetPassword;
