import POWER from '../../assets/photos/strength.jpeg'
import YOGA from '../../assets/photos/yoga.jpeg'
import SPINNING from '../../assets/photos/spinning.jpeg'
import BOX from '../../assets/photos/boxing.jpeg'

const classesByDay = {
    Monday: [
        { name: 'Power', time: '8:00 AM - 9:00 AM', trainer: 'Greg', img:POWER },
        { name: 'Spinning', time: '1:00 PM - 2:00 PM', trainer: 'Anya', img:SPINNING },
        { name: 'Yoga', time: '4:00 PM - 5:00 PM', trainer: 'Clara', img:YOGA },
        { name: 'Box', time: '6:00 PM - 7:00 PM', trainer: 'Leo', img:BOX },
        { name: 'Power', time: '7:00 PM - 8:00 PM', trainer: 'Greg', img:POWER },
      ],
      Tuesday: [
        { name: 'Spinning', time: '7:00 AM - 8:00 AM', trainer: 'Anya', img:SPINNING },
        { name: 'Yoga', time: '1:00 PM - 2:00 PM', trainer: 'Clara', img:YOGA },
        { name: 'Box', time: '6:00 PM - 7:00 PM', trainer: 'Mariana', img:POWER }
      ],
      Wednesday: [
        { name: 'Yoga', time: '7:00 AM - 8:00 AM', trainer: 'Clara', img:YOGA },
        { name: 'Power', time: '6:00 PM - 7:00 PM', trainer: 'Greg', img:POWER },
      ],
      Thursday: [
        { name: 'Power', time: '6:00 PM - 7:00 PM', trainer: 'Greg', img:POWER },
        { name: 'Box', time: '7:00 PM - 8:00 PM', trainer: 'Leo', img:BOX },
      ],
      Friday: [
        { name: 'Spinning', time: '7:00 AM - 8:00 AM', trainer: 'Anya', img:SPINNING },
        { name: 'Spinning', time: '3:00 PM - 4:00 PM', trainer: 'Anya', img:SPINNING },
        { name: 'Power', time: '5:00 PM - 6:00 PM', trainer: 'Greg', img:POWER },
        { name: 'Box', time: '6:00 PM - 7:00 PM', trainer: 'Mariana', img:BOX },
        { name: 'Box', time: '7:00 PM - 8:00 PM', trainer: 'Leo', img:BOX },
      ],
      Saturday: [
        { name: 'Yoga', time: '7:00 AM - 8:00 AM', trainer: 'Clara', img:YOGA },
        { name: 'Power', time: '3:00 PM - 4:00 PM', trainer: 'Greg', img:POWER },
      ],
      Sunday: [
        { name: 'Yoga', time: '9:00 AM - 10:00 AM', trainer: 'Clara', img:YOGA },
        { name: 'Spinning', time: '3:00 PM - 4:00 PM', trainer: 'Anya', img:SPINNING },
      ]
  };

export default classesByDay;