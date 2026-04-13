'use client';

import styles from '@nextjs-slate/components/PostPublicWithLayout.module.css';

import dynamic from 'next/dynamic';
const Post = dynamic(() => import('@nextjs-slate/components/Post'), {
  ssr: false,
});

import * as Constants from '@nextjs-slate/common/constants';
import * as Hooks from '@nextjs-slate/modules/hooks';
import * as Icon from '@nextjs-slate/components/Icon';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import ButtonAction from '@nextjs-slate/components/ButtonAction';
import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import Logo from '@nextjs-slate/components/Logo';
import PostByline from '@nextjs-slate/components/PostByline';
import PostDescription from '@nextjs-slate/components/PostDescription';
import PostTitle from '@nextjs-slate/components/PostTitle';
import Tooltip from '@nextjs-slate/components/Tooltip';

import { createEditor } from 'slate';
import { withReact, Slate } from 'slate-react';

const SidebarElements = (props) => {
  const forceUpdate = Hooks.useForceUpdate();
  const [height, setHeight] = React.useState(0);

  Hooks.useScrollTrigger(() => {
    const distance = Utilities.getScrollDistance();

    setHeight(distance - 49 >= 0 ? distance - 41 : 0);
    forceUpdate();
  });

  return (
    <div style={{ marginTop: height, transition: `200ms ease all`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column' }}>
      <Tooltip tooltipText="Share on X (Formerly Twitter)" position="right" yOffset="4px">
        <ButtonAction aria-label="Share on X" href={`https://twitter.com/intent/tweet?text=${props.postURL}`} target="_blank">
          <Icon.Twitter height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Author profile" position="right" yOffset="4px">
        <ButtonAction aria-label="Author profile" href={props.authorURL}>
          <Icon.Author height="12px" />
        </ButtonAction>
      </Tooltip>
      {props.isViewer ? (
        <Tooltip tooltipText="Edit post" position="right" yOffset="4px">
          <ButtonAction aria-label="Edit post" href={`/${props.user.username}/-/${props.post.id}`}>
            <Icon.EditPost height="12px" style={{ paddingBottom: 2, paddingLeft: 2 }} />
          </ButtonAction>
        </Tooltip>
      ) : null}
    </div>
  );
};

export default function PostPublicWithLayout(props) {
  const { post, user, isViewer } = props;
  const initialValue = React.useMemo(() => post.data.editorContent.children, []);
  const [editor] = React.useState(() => withReact(createEditor()));
  const postURL = `Reading ${post.data.title} was interesting. ${Constants.SITE_URL}/${user.username}/${post.slug}`;
  const authorURL = `/${user.username}`;

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <DefaultLayout logo={<Logo />} sidebar={<SidebarElements isViewer={isViewer} post={post} user={user} authorURL={authorURL} postURL={postURL} />}>
        <PostTitle value={post.data.title} readOnly />
        <PostByline user={user} timestamp={Utilities.toDateISOString(post.updated_at)} />
        <PostDescription value={post.data.description} readOnly />
        <div className={styles.body}>
          <Post editor={editor} initialValue={initialValue} readOnly />
        </div>
      </DefaultLayout>
    </Slate>
  );
}

