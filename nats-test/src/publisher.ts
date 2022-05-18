import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();

const stan = nats.connect('ticketing', 'abc', { url: 'http://localhost:4222' });

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);

  try {
    await publisher.publish({
      id: '2334dddcsf4',
      title: 'Celine concert',
      cost: 200,
    });
  } catch (err) {}
});
