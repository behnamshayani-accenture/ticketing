import expres from 'express';

const router = expres.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;
  res.send({});
});

export { router as signoutRouter };
