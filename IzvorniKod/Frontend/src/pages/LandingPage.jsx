import {Link} from 'react-router-dom'
import logoImg from '../assets/logo.png'
import bannerImg from '../assets/banner.jpg';
import aboutW from '../assets/aboutWalker.jpg';
import aboutO from '../assets/aboutOwner.jpg';
import ChatWidget from '../components/ChatWidget';

function LandingPage(){
    return (
        <div>
        <ChatWidget />
        <div className='landing-container'>
            <section className='banner'
             style={{backgroundImage: `url(${bannerImg})`}}>
                <div className='banner-content'>
                    
                </div>
            </section>
            <section className='about'>
              
              <p className='aboutText'>Jer svaki pas zaslužuje šetnju - PawPal omogućuje jednostavno,
                 pouzdano i bezbrižno povezivanje vlasnika i šetača pasa na jednom mjestu. 
                 Sljedeća avantura vašeg psa udaljena je samo jedan klik.
                 </p>
                 <p className='ulogaText'>Izaberi svoju ulogu i kreni u šetnju!</p>
            <div className='about-grid'>
                <div className='about-box'
                 style={{backgroundImage:`url(${aboutO})`}}>
                    <div className='overlay'>
                        <span>Zadovoljni psi</span>
                    </div>
                </div> 
                <div className='about-box'
                 style={{backgroundImage:`url(${aboutW})`}}>
                    <div className='overlay'>
                        <span>Sigurni šetači</span>
                    </div>
                </div>
            </div>     
            </section>
        </div>
       </div> 
    )
}

export default LandingPage;