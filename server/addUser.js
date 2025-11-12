const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const User = require('./models/User');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!\n');
    
    // Get user details
    console.log('📝 Enter user details:\n');
    
    const name = await question('Full Name: ');
    const email = await question('Email: ');
    const phone = await question('Phone (10 digits): ');
    const password = await question('Password: ');
    const membership = await question('Membership (None/Basic/Pro/Premium): ') || 'None';
    
    // Validate
    if (!name || !email || !password) {
      console.log('\n❌ Name, email, and password are required!');
      process.exit(1);
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      const overwrite = await question('Do you want to update this user? (yes/no): ');
      
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled.');
        process.exit(0);
      }
      
      // Update existing user
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.phone = phone;
      existingUser.membership = membership;
      await existingUser.save();
      
      console.log('\n✅ User updated successfully!');
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Membership: ${existingUser.membership}`);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        membership,
        status: 'Active',
        role: 'user'
      });
      
      await user.save();
      
      console.log('\n✅ User created successfully!');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Membership: ${user.membership}`);
    }
    
    console.log('\n📊 Total users in database:', await User.countDocuments());
    
    rl.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
addUser();
