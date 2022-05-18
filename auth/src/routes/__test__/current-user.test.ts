import request from 'supertest';
import { app } from '../../app';
import { signupHelper } from '../../test/signup-helper';

it("Returns curerent user's email after calling current uer api", async () => {
  const cookie = await signupHelper();

  const currentUserResponse = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie);

  expect(currentUserResponse.body.currentUser.email).toEqual('test@test.com');
});

it('Returns null with un-authenticated requests.', async () => {
  const response = await request(app).get('/api/users/currentuser').expect(200);
  expect(response.body.currentUser).toBeNull();
});
