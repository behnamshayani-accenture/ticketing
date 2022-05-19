import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wraper';

const start = async () => {
  console.log('Starting up...');
  console.log('testing');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined.');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined.');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined.');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_CLIENT_ID must be defined.');
  }

  if (!process.env.STRIPE_KEY) {
    throw new Error('STRIPE_KEY must be defined.');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('Connection to NATS lost!');
      process.exit();
    });
    process.on('SIGTERM', () => {
      natsWrapper.client.close();
    });
    process.on('SIGINT', () => {
      natsWrapper.client.close();
    });

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongo db');
  } catch (error) {
    console.log('error connecting');
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('listening on 3000!!!!');
  });
};

start();
