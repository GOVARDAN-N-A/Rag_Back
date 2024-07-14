const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
// const { router } = require('./routes/router');
const User  = require('./models/user');
const Ragpicker = require('./models/ragpickerSchema');
require('dotenv').config();

const app = express();
const upload = multer();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(error => console.error('Error connecting to MongoDB Atlas:', error));

// Signup route
// Example signup route
app.post('/signup', upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, email, password, city, state, country, address, contactNumber, gender } = req.body;

    let profilePicture;
    if (req.file) {
      profilePicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };

    }

    const newUser = new User({
      fullName,
      email,
      password,
      profilePicture,
      city,
      state,
      country,
      address,
      contactNumber,
      gender,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(400).json({ message: 'Error occurred while signing up user' });
  }
});

app.post('/joinRagpicker', upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, email, password, city, state, country, address, contactNumber, gender, upiId, dateOfBirth } = req.body;

    const newRagpicker = new Ragpicker({
      fullName,
      email,
      password,
      profilePicture: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      city,
      state,
      country,
      address,
      contactNumber,
      gender,
      upiId,
      dateOfBirth: new Date(dateOfBirth)
    });

    await newRagpicker.save();
    res.status(201).send('Ragpicker joined successfully');
  } catch (error) {
    console.error('Error joining as a ragpicker:', error);
    res.status(500).send('Internal server error');
  }
});


// module.exports = router;

// Login route
app.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;
  try {
      let user;
      if (userType === 'normal') {
          user = await User.findOne({ email });
      } else if (userType === 'ragpicker') {
          user = await Ragpicker.findOne({ email });
      }

      if (user && user.password === password) {
          res.status(200).json({ message: 'Login successful', userFullName: user.fullName, userEmail: user.email });
      } else {
          res.status(401).json({ message: 'Invalid email or password' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch user profile
app.get('/profile', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 
// Fetch profile picture
app.get('/profile-picture/:userId', async (req, res) => {
  try {
    const user = await Ragpicker.findById(req.params.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }
    res.set('Content-Type', user.profilePicture.contentType);
    res.send(user.profilePicture.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow a user
app.post('/follow/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user; // Assuming user is authenticated
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUser._id);
    await Promise.all([currentUser.save(), userToFollow.save()]);
    res.status(200).json({ message: 'You are now following this user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
app.post('/unfollow/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user; // Assuming user is authenticated
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }
    currentUser.following = currentUser.following.filter(id => id !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== currentUser._id);
    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    res.status(200).json({ message: 'You have unfollowed this user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch ragpickers by city
app.get('/ragpickers', async (req, res) => {
  try {
    const city = req.query.city;
    const ragPickers = await Ragpicker.find({ city: city }).select('fullName city tasksAssigned ratings totalAssignedJobs profilePictureUrl'); // Ensure 'profilePictureUrl' matches your schema
    res.status(200).json(ragPickers);
  } catch (error) {
    console.error('Error fetching rag pickers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

    
// Assign job to ragpicker
app.put('/ragpickers/:id/assign-job', async (req, res) => {
  const ragPickerId = req.params.id;
  try {
    const ragPicker = await Ragpicker.findOneAndUpdate(
      { user: ragPickerId },
      { tasksAssigned: true },
      { new: true }
    ).populate('user', 'fullName ratings totalAssignedJobs');

    if (!ragPicker) {
      return res.status(404).json({ message: 'Rag picker not found' });
    }

    res.status(200).json(ragPicker);
  } catch (error) {
    console.error('Error assigning job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 

// Rate a ragpicker    
app.put('/ragpickers/:id/rate', async (req, res) => {
  const ragPickerId = req.params.id;
  const { rating } = req.body;
  try {
    const ragPicker = await Ragpicker.findByIdAndUpdate(
      ragPickerId,
      { $inc: { ratings: rating } }, // Increment ratings by the given rating value
      { new: true }
    ).populate('user', 'fullName ratings totalAssignedJobs');

    if (!ragPicker) {
      return res.status(404).json({ message: 'Rag picker not found' });
    }

    res.status(200).json(ragPicker);
  } catch (error) {
    console.error('Error rating picker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
