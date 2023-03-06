import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.on('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error: ', error);
});

export async function mongoDisconnect() {
  await mongoose.disconnect();
}

export async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
}
