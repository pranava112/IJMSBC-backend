import Contact from './models/Contact.js';
import Manuscript from './models/Manuscript.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Create uploads folder if not exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// JWT middleware (not used in submission route anymore)
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==== Contact Routes ====

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, address, message } = req.body;
  if (!name || !email || !phone || !address || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newContact = new Contact({ name, email, phone, address, message });
    await newContact.save();
    res.status(201).json({ message: 'Contact submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.get('/api/contact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

app.put('/api/contact/:id', async (req, res) => {
  const { name, email, phone, address, message } = req.body;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, message },
      { new: true }
    );
    if (!updatedContact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact updated successfully', contact: updatedContact });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ==== Auth Routes ====

// app.post('/api/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ error: 'User already exists' });

//     const hash = await bcrypt.hash(password, 10);
//     await User.create({ name, email, password: hash });
//     res.status(201).json({ message: 'Registered successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '2h' }
//     );
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });


// ✅ Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ✅ Get All Users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Get One User by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ✅ Update User
router.put('/:id', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ✅ Delete User
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// ==== Manuscript Routes ====

app.post('/api/submit', upload.single('file'), async (req, res) => {
  try {
    const { name, email, title, abstract } = req.body;

    if (!name || !email || !title || !abstract) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const filePath = req.file.path;

    const manuscript = new Manuscript({ name, email, title, abstract, filePath });
    await manuscript.save();

    res.status(201).json({ message: 'Submission successful' });
  } catch (err) {
    console.error('Error in /api/submit:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

app.get('/api/manuscripts', async (req, res) => {
  try {
    const manuscripts = await Manuscript.find();
    res.json(manuscripts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

app.delete('/api/manuscripts/:id', async (req, res) => {
  try {
    const manuscript = await Manuscript.findByIdAndDelete(req.params.id);
    if (!manuscript) return res.status(404).json({ error: 'Manuscript not found' });

    if (manuscript.filePath && fs.existsSync(manuscript.filePath)) {
      fs.unlinkSync(manuscript.filePath);
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete manuscript' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
