import React from 'react'
import './navbar.css'
import { Link } from 'react-router-dom'
import { CgClose } from 'react-icons/cg'
import styled from 'styled-components'

const DropdownContainer = styled.div `
    position: fixed;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: var(--color-bg);
    display: grid;
    align-items: center;
    top: 0;
    left: 0;
    transition: var(--transition);
    opacity: ${({isOpen}) => (isOpen ? '1' : '0')};
    top: ${({isOpen}) => (isOpen ? '0' : '-100%')};
`
const Dropdown = ({isOpen, toggle}) => {
  return (
    <DropdownContainer isOpen = {isOpen} onClick = {toggle}>
        <CgClose className='menu-close' onClick = {toggle}/>
        <div className="dropdown-menu">
            <Link to='/'><a href="/" className='dropdown-items'>Home</a></Link>
            <Link to='/classes'><a href="/" className='dropdown-items'>Classes</a></Link>
            <Link to='/pricing'><a href="/" className='dropdown-items'>Pricing</a></Link>
            <Link to='/shop'><a href="/" className='dropdown-items'>Shop</a></Link>
            <Link to='/contact'><a href="/" className='dropdown-items'>Contact</a></Link>
        </div>
    </DropdownContainer>
  )
}

export default Dropdown