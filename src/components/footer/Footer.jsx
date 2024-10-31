import React from 'react'
import './footer.css'

import LOGO from '../../assets/logos/strike.svg'
import INSTAGRAM from '../../assets/logos/instagram_white.svg'
import YOUTUBE from '../../assets/logos/youtube_white.png'
import SPOTIFY from '../../assets/logos/spotify_white.png'

const Footer = () => {
  return (
    <section id='footer'>
      <div className="footer-container">

      <div className="row1">
        <div className="col1">
          <h3 className='footer-title'><span class="underline">Strike gym</span></h3>
          <ul className='footer-text'>
            <li>Fitness Edge Gym</li>
            <li>Sports Complex</li>
            <li>mon - sun  0:00 - 0:00</li>
          </ul>
        </div>

        <div className="col2">
          <h3 className='footer-title'><span class="underline">Quick links</span></h3>
          <ul className='footer-text'>
            <li><a href="/classes">Classes</a></li>
            <li><a href="/pricing">Membership</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </div>

        <div className="row2">
          <div className="col3">
            <img src={LOGO} alt="Strike" />
            <h3 className='footer-strike-title'>Fitness Edge</h3>
          </div>
        </div>

      <div className="row3">
        <div className="col4">
          <h3 className='footer-title'><span class="underline">Get in touch</span></h3>
          <ul className='footer-text'>
            <li>sumantyadav3086@gmail.com</li>
            <li>+91 9599 617 479</li>
          </ul>
        </div>

        <div className="col5">
          <h3 className='footer-title'><span class="underline">Fitness Edge Socials</span></h3>
          <span></span>
          <ul className='footer-text'>
            <a href="https://www.instagram.com"><li><img src={INSTAGRAM} alt="Instagram" />Instagram</li></a>
            <a href="https://www.youtube.com"><li><img src={YOUTUBE} alt="Youtube" />Youtube</li></a>
            <a href="https://www.spotify.com"><li><img src={SPOTIFY} alt="Spotify" />Spotify</li></a>
          </ul>
        </div>
      </div>

      </div>
    </section>
  )
}

export default Footer