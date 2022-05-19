import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wraper');

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
