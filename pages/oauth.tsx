import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';
import * as Server from '@nextjs-slate/common/server';

import Cookies from '@nextjs-slate/modules/cookies';

function OAuthPage(props) {
  React.useEffect(() => {
    if (Utilities.isEmpty(props.code)) {
      window.location.replace('/');
    }

    const cookie = new Cookies();
    cookie.set(Constants.COOKIE_NAME, props.code, { sameSite: 'strict', path: '/' });

    window.location.replace('/');
  });

  return <div>redirecting ...</div>;
}

export async function getServerSideProps(context) {
  if (Utilities.isEmpty(context.query.key)) {
    return {
      redirect: {
        permanent: false,
        destination: `/`,
      },
    };
  }

  const code = Server.decrypt(String(context.query.key));

  return {
    props: {
      code,
    },
  };
}

export default OAuthPage;
