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
    opacity: ${({$isOpen}) => ($isOpen ? '1' : '0')};
    top: ${({$isOpen}) => ($isOpen ? '0' : '-100%')};
`
const Dropdown = ({isOpen, toggle}) => {
  return (
    <DropdownContainer $isOpen={isOpen} onClick={toggle}>
        <CgClose className='menu-close' onClick={toggle}/>
        <div className="dropdown-menu">
            <Link to='/' className='dropdown-items' onClick={toggle}>Home</Link>
            <Link to='/classes' className='dropdown-items' onClick={toggle}>Classes</Link>
            <Link to='/pricing' className='dropdown-items' onClick={toggle}>Pricing</Link>
            <Link to='/features' className='dropdown-items' onClick={toggle}>Features</Link>
            <Link to='/shop' className='dropdown-items' onClick={toggle}>Shop</Link>
            <Link to='/contact' className='dropdown-items' onClick={toggle}>Contact</Link>
        </div>
    </DropdownContainer>
  )
}

export default Dropdown