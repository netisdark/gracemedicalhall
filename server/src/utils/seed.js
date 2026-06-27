import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';

dotenv.config();

const medicines = [
  {
    name: 'Paracetamol 500mg',
    company: 'Niko Pharmaceuticals',
    batchNo: 'B-PRC109',
    productionDate: new Date('2025-01-15'),
    expiryDate: new Date('2027-01-15'),
    stock: 120,
    price: 15.0,
    discount: 5
  },
  {
    name: 'Ibuprofen 400mg',
    company: 'Deurali Janata',
    batchNo: 'B-IBU402',
    productionDate: new Date('2025-02-10'),
    expiryDate: new Date('2027-02-10'),
    stock: 80,
    price: 30.0,
    discount: 10
  },
  {
    name: 'Amoxicillin 250mg',
    company: 'Quest Pharmaceuticals',
    batchNo: 'B-AMX771',
    productionDate: new Date('2025-03-01'),
    expiryDate: new Date('2026-09-01'),
    stock: 50,
    price: 80.0,
    discount: 0
  },
  {
    name: 'Cetirizine 10mg',
    company: 'Lomus Pharmaceuticals',
    batchNo: 'B-CET889',
    productionDate: new Date('2025-04-12'),
    expiryDate: new Date('2026-07-20'), // Expiring soon (less than 30 days)
    stock: 6, // Low stock & expiring soon
    price: 10.0,
    discount: 2
  },
  {
    name: 'Metformin 500mg',
    company: 'Magnus Pharma',
    batchNo: 'B-MET231',
    productionDate: new Date('2024-11-05'),
    expiryDate: new Date('2026-11-05'),
    stock: 200,
    price: 25.0,
    discount: 8
  },
  {
    name: 'Pantoprazole 40mg',
    company: 'Asian Pharmaceuticals',
    batchNo: 'B-PAN104',
    productionDate: new Date('2025-05-18'),
    expiryDate: new Date('2027-05-18'),
    stock: 150,
    price: 45.0,
    discount: 5
  },
  {
    name: 'Atorvastatin 10mg',
    company: 'National Healthcare',
    batchNo: 'B-ATO905',
    productionDate: new Date('2024-08-01'),
    expiryDate: new Date('2026-05-01'), // Already expired
    stock: 45,
    price: 90.0,
    discount: 12
  },
  {
    name: 'Amlodipine 5mg',
    company: 'Deurali Janata',
    batchNo: 'B-AML330',
    productionDate: new Date('2025-01-20'),
    expiryDate: new Date('2027-01-20'),
    stock: 8, // Low stock
    price: 20.0,
    discount: 0
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grace_medical_hall';
    await mongoose.connect(mongoUri);
    console.log('Seeding MongoDB database...');

    // Users seed
    await User.deleteMany({});
    console.log('Cleared old users');

    const admin = new User({
      username: 'admin',
      password: 'adminpassword123',
      role: 'admin'
    });
    await admin.save();
    console.log('Seeded admin user: "admin" / "adminpassword123"');

    const staff = new User({
      username: 'staff',
      password: 'staffpassword123',
      role: 'staff'
    });
    await staff.save();
    console.log('Seeded staff user: "staff" / "staffpassword123"');

    // Medicines seed
    await Medicine.deleteMany({});
    console.log('Cleared old medicines');

    await Medicine.insertMany(medicines);
    console.log(`Successfully seeded ${medicines.length} medicines.`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
