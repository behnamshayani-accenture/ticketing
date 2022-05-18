import useRequest from '../../hooks/use-request';
import { useEffect } from 'react';
import Router from 'next/router';

const Signout = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => {
    doRequest();
  }, []);
};

export default Signout;
