'use client';

import '@root/global.css';

import Cookies from '@nextjs-slate/modules/cookies';
import ButtonAction from '@nextjs-slate/components/ButtonAction';
import Tooltip from '@nextjs-slate/components/Tooltip';

import * as Constants from '@nextjs-slate/common/constants';
import * as Icon from '@nextjs-slate/components/Icon';
import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

export default function GeneralSidebar(props) {
  if (!props.viewer) {
    return null;
  }

  return (
    <>
      <Tooltip tooltipText="Create a new post" position="right" yOffset="4px">
        <ButtonAction
          onClick={async () => {
            if (!props.viewer.username) {
              window.location.href = `/${props.viewer.email}`;
              return;
            }

            const cookies = new Cookies(null, { path: '/' });
            const response = await HTTP.createPost({ key: cookies.get(Constants.COOKIE_NAME) });

            if (!response) {
              alert('Something went wrong. Please try again later.');
              return;
            }

            if (response.error) {
              alert('Something went wrong. Please try again later.');
              return;
            }

            window.location.href = `/${props.viewer.username}/-/${response.data.id}`;
          }}
        >
          <Icon.Write height="14px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Profile" position="right" yOffset="4px">
        <ButtonAction href={`/${props.viewer.username}`}>
          <Icon.Author height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Sign out" position="right" yOffset="4px">
        <ButtonAction
          onClick={async () => {
            const confirm = window.confirm('Are you sure you want to sign out?');
            if (!confirm) {
              return;
            }

            const cookies = new Cookies(null, { path: '/' });
            cookies.remove(Constants.COOKIE_NAME);
            window.location.href = '/';
          }}
        >
          <Icon.Exit height="12px" />
        </ButtonAction>
      </Tooltip>
    </>
  );
}
