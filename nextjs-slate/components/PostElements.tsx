import styles from '@nextjs-slate/components/PostElements.module.css';

import * as React from 'react';

import { useSlateStatic, useSelected, useFocused } from 'slate-react';

export const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'video':
      return <Video attributes={attributes} children={children} element={element} />;
    case 'image':
      return <Image attributes={attributes} children={children} element={element} />;
    case 'link':
      return <LinkComponent attributes={attributes} children={children} element={element} />;
    case 'block-quote':
      return (
        <blockquote {...attributes} className={styles.blockquote}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} className={styles.ul}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 {...attributes} className={styles.h1}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} className={styles.h2}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li {...attributes} className={styles.li}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} className={styles.ol}>
          {children}
        </ol>
      );
    default:
      return (
        <p {...attributes} className={styles.p}>
          {children}
        </p>
      );
  }
};

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong className={styles.strong}>{children}</strong>;
  }

  if (leaf.code) {
    children = <code className={styles.code}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em className={styles.em}>{children}</em>;
  }

  if (leaf.underline) {
    children = <u className={styles.u}>{children}</u>;
  }

  return (
    <span {...attributes} className={styles.leaf}>
      {children}
    </span>
  );
};

export const Video = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes} style={{ width: '100%' }}>
      {children}
      <div contentEditable={false} className={styles.video}>
        <video
          className={styles.videoElement}
          src={element.url}
          controls
          autoPlay
          muted
          loop
          style={{
            boxShadow: selected && focused ? '0 1px 16px rgba(0, 0, 255, 0.3), 0 0 0 1px var(--color-primary)' : null,
          }}
        />
      </div>
    </div>
  );
};

export const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div {...attributes} style={{ width: '100%' }}>
      {children}
      <div contentEditable={false} className={styles.image}>
        <img
          className={styles.imageElement}
          src={element.url}
          alt={element.alt || ''}
          style={{
            opacity: loaded ? 1 : 0,
            boxShadow: selected && focused ? '0 1px 16px rgba(0, 0, 255, 0.3), 0 0 0 1px var(--color-primary)' : null,
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};

export const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

export const LinkComponent = ({ attributes, children, element }) => {
  const selected = useSelected();
  return (
    <a {...attributes} href={element.url} style={selected ? { boxShadow: '0 1px 16px rgba(0, 0, 255, 0.3), 0 0 0 1px var(--color-primary)' } : null}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};
