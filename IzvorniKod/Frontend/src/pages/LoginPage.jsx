import {Link} from 'react-router-dom'

function LoginPage(){
    return (
        <div className='authorisation-container'>
            <h2>GoFetch!</h2>
            <button className='google-btn'>Continue with Google</button>
            <p>or</p>
            <input type='email' placeholder='E-mail' />
            <input type='password' placeholder='Password'/>
            <button className='primary-btn'>Log In</button>
            <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
        </div>
    )
}
export default LoginPage;