import HOODIE_BLACK from '../../assets/photos/shop/hoodie_black.jpg'
import HOODIE_WHITE from '../../assets/photos/shop/hoodie_white.jpg'
import TSHIRT_BLACK from '../../assets/photos/shop/tshirt_black.jpg'
import TSHIRT_WHITE from '../../assets/photos/shop/tshirt_white.jpg'
import TOP_BLACK from '../../assets/photos/shop/top_black.jpg'
import TOP_WHITE from '../../assets/photos/shop/top_white.jpg'
import TOP_PINK from '../../assets/photos/shop/top_pink.jpg'
import LEGGINGS_BLACK from '../../assets/photos/shop/leggings_black.jpeg'
import LEGGINGS_WHITE from '../../assets/photos/shop/leggings_white.jpeg'
import LEGGINGS_PINK from '../../assets/photos/shop/leggings_pink.jpeg'
import BOTTLE_BLACK from '../../assets/photos/shop/bottle_black.jpg'
import BOTTLE_WHITE from '../../assets/photos/shop/bottle_white.jpg'
import GYMSACK_BLACK from '../../assets/photos/shop/gymsack_black.jpg'
import GYMSACK_WHITE from '../../assets/photos/shop/gymsack_white.jpg'

const shopData = [
    {
        id: 1,
        name: 'Hoodie',
        price: '$95',
        colors: ['black','white'],
        checkImg: {
            black: true,
            white: false
        },
        linkImg: {
            black: HOODIE_BLACK,
            white: HOODIE_WHITE
        }
    },

    {
        id: 2,
        name: 'Tshirt',
        price: '$35',
        colors: ['black','white'],
        checkImg: {
            black: false,
            white: true
        },
        linkImg: {
            black: TSHIRT_BLACK,
            white: TSHIRT_WHITE
        }
    },

    {
        id: 3,
        name: 'Sports bra',
        price: '$25',
        colors: ['black','white', 'pink'],
        checkImg: {
            black: false,
            white: true,
            pink: false
        },
        linkImg: {
            black: TOP_BLACK,
            white: TOP_WHITE,
            pink: TOP_PINK
        }
    },

    {
        id: 4,
        name: 'Leggings',
        price: '$30',
        colors: ['black','white', 'pink'],
        checkImg: {
            black: false,
            white: true,
            pink: false
        },
        linkImg: {
            black: LEGGINGS_BLACK,
            white: LEGGINGS_WHITE,
            pink: LEGGINGS_PINK
        }
    },

    {
        id: 5,
        name: 'Bottle',
        price: '$20',
        colors: ['black','white'],
        checkImg: {
            black: true,
            white: false
        },
        linkImg: {
            black: BOTTLE_BLACK,
            white: BOTTLE_WHITE
        }
    },

    {
        id: 6,
        name: 'Gymsack',
        price: '$15',
        colors: ['black','white'],
        checkImg: {
            black: true,
            white: false
        },
        linkImg: {
            black: GYMSACK_BLACK,
            white: GYMSACK_WHITE
        }
    }
]

export default shopData;