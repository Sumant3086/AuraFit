import React from "react"
import "./contact.css"
import Footer from "../footer/Footer"
import { FaEnvelope, FaClock, FaChevronUp } from 'react-icons/fa'
import classNames from 'classnames';
import toast from 'react-hot-toast';


const contactData = [
  {
    avatar: '👨‍💼',
    name: 'Rajesh Kumar',
    role: 'Gym Manager',
    description: 'Certified fitness manager with 10+ years of experience. Passionate about helping members achieve their fitness goals. MBA in Sports Management.',
    gender: 'male',
    specialization: 'Management & Operations'
  },
  {
    avatar: '👩‍🏫',
    name: 'Priya Sharma',
    role: 'Senior Fitness Coach',
    description: 'Specialized in weight loss and strength training. ACE certified personal trainer with expertise in nutrition and diet planning.',
    gender: 'female',
    specialization: 'Weight Loss & Nutrition'
  },
  {
    avatar: '👨‍🏫',
    name: 'Vikram Singh',
    role: 'Strength Coach',
    description: 'Expert in muscle building and athletic performance. Former national level athlete with 8 years coaching experience. NSCA certified.',
    gender: 'male',
    specialization: 'Bodybuilding & Athletics'
  },
  {
    avatar: '👩‍⚕️',
    name: 'Sneha Patel',
    role: 'Yoga Instructor',
    description: 'Yoga and functional training specialist. Focuses on holistic fitness and mind-body connection. 500-hour certified yoga teacher.',
    gender: 'female',
    specialization: 'Yoga & Flexibility'
  },
  {
    avatar: '🥊',
    name: 'Arjun Reddy',
    role: 'Boxing Coach',
    description: 'Professional boxing coach with state championship experience. Specializes in combat fitness and conditioning. Former state boxing champion.',
    gender: 'male',
    specialization: 'Boxing & Combat Sports'
  },
  {
    avatar: '🥋',
    name: 'Kavya Menon',
    role: 'Kickboxing Coach',
    description: 'Kickboxing and self-defense expert. Empowering women through martial arts training. Black belt in Taekwondo.',
    gender: 'female',
    specialization: 'Kickboxing & Self-Defense'
  }
]

const Contact = () => {
  return (
  <div className="container">
    <section id="contact">
      <h1 className="contact-title">Reach out to us!</h1>
      <div className="contact-container">
          <div className="contact-london">
            <h2>AuraFit</h2>
            <ul>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:sumantyadav3086@gmail.com" style={{color: '#fff'}}>
                  sumantyadav3086@gmail.com
                </a>
              </li>
              <li>
                <FaClock className="contact-icon" />
                We reply within 24 hours
              </li>
            </ul>
          </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          toast.success("Message received! We'll get back to you within 24 hours.");
          e.target.reset();
        }}>
          <div className="contact-form-bg">
            <div className="contact-form">
              <div className="first-row">
                <div className="name">
                  <p className="input-text">Full name</p>
                  <input type="text" name="fullName" required />
                </div>

                <div className="email">
                  <p className="input-text">Email</p>
                  <input type="email" name="email" required />
                </div>
                <div className="message">
                </div>
              </div>
              <div className="second-row">
                <p className="input-text">Your message</p>
                  <textarea
                    className="message"
                    name="message"
                    id=""
                    rows='8'
                    required
                  ></textarea>
                </div>
              <button type="submit" className="send-btn">Send</button>
            </div>
          </div>
        </form>
      </div>
    </section>

    <section id="team">
      <h1 className="team-title">Meet the team</h1>
      <div className="team-container">
            {
          contactData.map(({avatar, name, role, description, gender}, index) => {

            const className_name = classNames({
              'john': name === 'Rahul',
              'anya': name === 'Priya',
              'greg': name === 'Vikram',
              'clara': name === 'Sneha',
              'leo': name === 'Arjun',
              'mariana': name === 'Kavya'
            });

            return (
                <div key={index} className={`team-card ${gender === 'male' ? 'male' : 'female'} ${className_name}`}>
                  <div className="img-box">
                    <div className="avatar-emoji">{avatar}</div>
                  </div>
                  <h3 className="role">{role}</h3>
                  <div className="content-box">
                    <FaChevronUp className="chevron" />
                    <h2 className="name">{name}</h2>
                    <div className="description-box">
                      <p className='description'>{description}</p>
                    </div>
                    <a href="/">Book a lesson</a>
                  </div>
                </div>
            )
          })
        }
      </div>
    </section>
    <Footer />
</div>
  );
};

export default Contact;
