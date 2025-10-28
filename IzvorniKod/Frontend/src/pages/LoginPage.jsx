import {Link} from 'react-router-dom'
import {FcGoogle} from "react-icons/fc";
import logoImg from '../assets/logo.png'

function LoginPage(){
    return (
        <div className='authorisation-container'>
            <div className="gf-title">
                <h2>GoFetch!</h2>
               <img className='logo-img' src={logoImg} alt="Logo"></img>
            </div>
            <button className='google-btn'><FcGoogle className="google-icon"/> Continue with Google</button>
            <p>or</p>
            <input type='email' placeholder='E-mail' />
            <input type='password' placeholder='Password'/>
            <button className='primary-btn'>Log In</button>
            <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
        </div>
    )
}
export default LoginPage;