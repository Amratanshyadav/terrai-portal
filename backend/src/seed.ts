import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import Mongoose Models
import { User } from './models/User';
import { Worker } from './models/Worker';
import { Payment } from './models/Payment';
import { VehicleLog } from './models/VehicleLog';
import { FuelLog } from './models/FuelLog';

// Load environmental parameters
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mines-management';

async function seedDatabase() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully. Cleaning collection contents...');

    // 1. Clean collections to prevent unique index conflicts
    await User.deleteMany({});
    await Worker.deleteMany({});
    await Payment.deleteMany({});
    await VehicleLog.deleteMany({});
    await FuelLog.deleteMany({});
    console.log('Collections cleared.');

    // 2. Create Users
    console.log('Seeding security accounts (Users)...');
    const users = await User.create([
      {
        email: 'admin@shrikrishna.com',
        passwordHash: 'Admin123!', // Hashed via pre-save hook in User model
        firstName: 'Marcus',
        role: 'Admin',
        verified: true,
      },
      {
        email: 'manager@shrikrishna.com',
        passwordHash: 'Manager123!',
        firstName: 'Sarah',
        role: 'Manager',
        verified: true,
      }
    ]);
    console.log(`Seeded ${users.length} user accounts.`);

    // 3. Create Workers (first name only)
    console.log('Seeding employee profiles (Workers)...');
    const workers = await Worker.create([
      {
        firstName: 'Rajesh',
        phone: '+91 98765 43210',
        post: 'Site Supervisor',
        salary: 45000,
        joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      },
      {
        firstName: 'Amit',
        phone: '+91 98123 45678',
        post: 'Heavy Excavator Driver',
        salary: 32000,
        joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        firstName: 'Vijay',
        phone: '+91 99223 34455',
        post: 'Dumper Operator',
        salary: 28000,
        joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      {
        firstName: 'Sunil',
        phone: '+91 97788 99001',
        post: 'Accountant / Clerk',
        salary: 35000,
        joinedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      }
    ]);
    console.log(`Seeded ${workers.length} employee profiles.`);

    // 4. Create Payments
    console.log('Seeding employee payments ledger...');
    const payments = await Payment.create([
      {
        workerId: workers[0]._id,
        amount: 45000,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        description: 'April 2026 Salary',
      },
      {
        workerId: workers[1]._id,
        amount: 32000,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        description: 'April 2026 Salary',
      },
      {
        workerId: workers[2]._id,
        amount: 15000,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        description: 'Advance Payment (Medical)',
      },
      {
        workerId: workers[3]._id,
        amount: 35000,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        description: 'April 2026 Salary',
      }
    ]);
    console.log(`Seeded ${payments.length} payment records.`);

    // 5. Create Vehicle Logs (incoming/outgoing logs)
    console.log('Seeding vehicle movement logs...');
    const vehicleLogs = await VehicleLog.create([
      {
        vehicleNumber: 'HR-55-A-4321',
        driverName: 'Sanjay Dutt',
        checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        checkOutTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: 'Out',
      },
      {
        vehicleNumber: 'DL-03-CB-9876',
        driverName: 'Ramesh Yadav',
        checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'In',
      },
      {
        vehicleNumber: 'MH-12-PQ-5555',
        driverName: 'Manpreet Singh',
        checkInTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        status: 'In',
      }
    ]);
    console.log(`Seeded ${vehicleLogs.length} vehicle logs.`);

    // 6. Create Diesel Logs
    console.log('Seeding diesel distribution logs...');
    const fuelLogs = await FuelLog.create([
      {
        vehicleNumber: 'DL-03-CB-9876',
        amount: 85,
        cost: 7650, // ₹90 per liter approx
        loggedBy: 'Sarah Chen',
        date: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        vehicleNumber: 'HR-55-A-4321',
        amount: 120,
        cost: 10800,
        loggedBy: 'Marcus Vance',
        date: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      }
    ]);
    console.log(`Seeded ${fuelLogs.length} diesel logs.`);

    console.log('Database seeding operation completed successfully.');
    process.exit(0);
  } catch (err: any) {
    console.error(`Seeding operation encountered a critical failure: ${err.message}`);
    process.exit(1);
  }
}

seedDatabase();
