import {Link} from 'react-router-dom'
import logoImg from '../assets/logo.png'

function LandingPage(){
    return (
        <div>

        
        <div className='landing-container'>
            <section className='banner'>
                <div className='banner-content'>
                    <h2>PLACEHOLDER BANNER</h2>
                </div>
            </section>
            <section className='about'>
              <h3>ABOUT US</h3>
              <p>Jer svaki pas zaslužuje šetnju - GoFetch! omogućuje jednostavno,
                 pouzdano i bezbrižno povezivanje vlasnika i šetača pasa na jednom mjestu. 
                 Sljedeća avantura vašeg psa udaljena je samo jedan klik.
                 </p>
            <div className='about-grid'>
                <div className='about-box'></div> 
                <div className='about-box'></div>
            </div>     
            </section>
        </div>
       </div> 
    )
}

export default LandingPage;