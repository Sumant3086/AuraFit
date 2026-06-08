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
    name: 'Training Hoodie',
    tagline: 'Heavyweight fleece. Relaxed fit. Made for the gym floor and the walk home.',
    price: '₹2,499',
    colors: ['black', 'white'],
    checkImg: { black: true, white: false },
    linkImg: { black: HOODIE_BLACK, white: HOODIE_WHITE },
  },
  {
    id: 2,
    name: 'Performance Tee',
    tagline: 'Structured cotton-blend. Moves without clinging. Holds its shape wash after wash.',
    price: '₹899',
    colors: ['black', 'white'],
    checkImg: { black: false, white: true },
    linkImg: { black: TSHIRT_BLACK, white: TSHIRT_WHITE },
  },
  {
    id: 3,
    name: 'Sports Bra',
    tagline: 'Medium-support construction. Flat-lock seams. Engineered for high-intensity sessions.',
    price: '₹699',
    colors: ['black', 'white', 'pink'],
    checkImg: { black: false, white: true, pink: false },
    linkImg: { black: TOP_BLACK, white: TOP_WHITE, pink: TOP_PINK },
  },
  {
    id: 4,
    name: 'Training Leggings',
    tagline: 'Four-way stretch fabric. Deep waistband. Built to stay in place through every movement.',
    price: '₹799',
    colors: ['black', 'white', 'pink'],
    checkImg: { black: false, white: true, pink: false },
    linkImg: { black: LEGGINGS_BLACK, white: LEGGINGS_WHITE, pink: LEGGINGS_PINK },
  },
  {
    id: 5,
    name: 'Shaker Bottle',
    tagline: '750ml. Leak-proof. Wide-mouth lid. Fits every gym bag without the bulk.',
    price: '₹499',
    colors: ['black', 'white'],
    checkImg: { black: true, white: false },
    linkImg: { black: BOTTLE_BLACK, white: BOTTLE_WHITE },
  },
  {
    id: 6,
    name: 'Gym Sack',
    tagline: 'Durable drawstring pack. Separate shoe compartment. Everything you need for a session.',
    price: '₹399',
    colors: ['black', 'white'],
    checkImg: { black: true, white: false },
    linkImg: { black: GYMSACK_BLACK, white: GYMSACK_WHITE },
  },
]

export default shopData;
