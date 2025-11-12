import React from 'react'
import './header.css'
import INSTAGRAM from '../../assets/logos/instagram.svg'
import YOUTUBE from '../../assets/logos/youtube.svg'
import SPOTIFY from '../../assets/logos/spotify.svg'

const HeaderSocials = () => {
  return (
    <div className="header-socials">
        <a href="https://www.instagram.com" target="__blank"><img src={INSTAGRAM} alt="instagram" /></a>
        <a href="https://www.youtube.com" target="__blank"><img src={YOUTUBE} alt="youtube" /></a>
        <a href="https://www.spotify.com" target="__blank"><img src={SPOTIFY} alt="spotify" /></a>
    </div>
  )
}

export default HeaderSocials