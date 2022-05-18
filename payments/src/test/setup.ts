import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wraper');

process.env.STRIPE_KEY =
  'sk_test_51ISTGsEgwm5OnwIDz8qK1WOLNafK4gosEMOOELhlclFH9vydvCtxyDU8NdgM3jQX473E0F101Rtn9aXwX9wYZ20m00ocYQfkex';
jest.setTimeout(20000);
let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = 'asfsss';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const dbCollections = await mongoose.connection.db.collections();

  for (let collection of dbCollections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
