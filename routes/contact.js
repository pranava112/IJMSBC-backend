// import Contact from '../models/Contact.js';
// import express from 'express';

// const router = express.Router();

// // === CREATE: POST /api/contact ===
// router.post('/', async (req, res) => {
//   const { name, email, phone, address, message } = req.body;

//   if (!name || !email || !phone || !address || !message) {
//     return res.status(400).json({ error: 'All fields are required.' });
//   }

//   try {
//     const newContact = new Contact({ name, email, phone, address, message });
//     await newContact.save();
//     res.status(201).json({ message: 'Contact submitted successfully!', contact: newContact });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // === READ ALL: GET /api/contact ===
// router.get('/', async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({ createdAt: -1 });
//     res.status(200).json(contacts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch contacts' });
//   }
// });

// // === READ ONE: GET /api/contact/:id ===
// router.get('/:id', async (req, res) => {
//   try {
//     const contact = await Contact.findById(req.params.id);
//     if (!contact) return res.status(404).json({ error: 'Contact not found' });
//     res.status(200).json(contact);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error fetching contact' });
//   }
// });

// // === UPDATE: PUT /api/contact/:id ===
// router.put('/:id', async (req, res) => {
//   const { name, email, phone, address, message } = req.body;

//   try {
//     const updatedContact = await Contact.findByIdAndUpdate(
//       req.params.id,
//       { name, email, phone, address, message },
//       { new: true, runValidators: true }
//     );

//     if (!updatedContact) {
//       return res.status(404).json({ error: 'Contact not found' });
//     }

//     res.status(200).json({ message: 'Contact updated successfully', contact: updatedContact });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error updating contact' });
//   }
// });

// // === DELETE: DELETE /api/contact/:id ===
// router.delete('/:id', async (req, res) => {
//   try {
//     const deletedContact = await Contact.findByIdAndDelete(req.params.id);
//     if (!deletedContact) {
//       return res.status(404).json({ error: 'Contact not found' });
//     }

//     res.status(200).json({ message: 'Contact deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error deleting contact' });
//   }
// });

// export default router;

import Contact from '../models/Contact.js';
import express from 'express';

const router = express.Router();

// === CREATE ===
router.post('/', async (req, res) => {
  const { name, email, phone, address, message } = req.body;

  if (!name || !email || !phone || !address || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newContact = new Contact({ name, email, phone, address, message });
    await newContact.save();
    res.status(201).json({ message: 'Contact submitted successfully!', contact: newContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === READ ALL ===
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// === READ ONE ===
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.status(200).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching contact' });
  }
});

// === UPDATE ===
router.put('/:id', async (req, res) => {
  const { name, email, phone, address, message } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, message },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact updated successfully', contact: updatedContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating contact' });
  }
});

// === DELETE ===
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting contact' });
  }
});

export default router;
