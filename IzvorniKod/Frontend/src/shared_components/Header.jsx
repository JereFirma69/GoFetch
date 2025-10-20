import {Link} from 'react-router-dom'

function Header(){
    return (
        <header className='header'>
            <div className='logo'>
                <span role='img' aria-label='paw'></span> GoFetch!
            </div>
            <nav>
                <Link to='/signup' className='nav-btn'>Sign Up</Link>
                <Link to='/login' className='nav-btn'>Log In</Link>
            </nav>
        </header>
    )
}

export default Header;