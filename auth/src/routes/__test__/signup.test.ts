import request from 'supertest';
import { app } from '../../app';

it('Returns a 201 on successful user signup.', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'adadsad',
    })
    .expect(201);
});

it('Returns a 400 with an invalid email.', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'adadad',
      password: 'adadadasd',
    })
    .expect(400);
});

it('Returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'aaasdadaöjakdjalkdjadkjadkajdklajdladjalkdj',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'aa',
    })
    .expect(400);
});

it('Returns a 400 with an empty password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: '',
    })
    .expect(400);
});

it('Returns a 400 with a missing email or password.', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'adadadasda',
    })
    .expect(400);
});

it('Returns a 400 with a duplicated email.', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'asdasdadad',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'asdasdadad',
    })
    .expect(400);
});

it('Sets a cookie on successful user signup.', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'behnamshayani@gmail.com',
      password: 'asdasdadad',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
