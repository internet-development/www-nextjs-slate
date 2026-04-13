'use client';

import dynamic from 'next/dynamic';
const Post = dynamic(() => import('@nextjs-slate/components/Post'), {
  ssr: false,
});

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';
import * as HTTP from '@nextjs-slate/common/http';
import * as SlateUtilities from '@nextjs-slate/common/slate';
import * as Icon from '@nextjs-slate/components/Icon';
import * as Hooks from '@nextjs-slate/modules/hooks';

import ButtonAction from '@nextjs-slate/components/ButtonAction';
import Cookies from '@nextjs-slate/modules/cookies';
import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import Logo from '@nextjs-slate/components/Logo';
import PostTitle from '@nextjs-slate/components/PostTitle';
import PostDescription from '@nextjs-slate/components/PostDescription';
import StatusText from '@nextjs-slate/components/StatusText';

import { withReact, ReactEditor, useSlate, Slate } from 'slate-react';
import { Editor, createEditor, Element as SlateElement, Node as SlateNode } from 'slate';
import { withHistory } from 'slate-history';

import Tooltip from '@nextjs-slate/components/Tooltip';
import { IS_MAC } from '@nextjs-slate/modules/is-hotkey';

const MOD = IS_MAC ? '⌘' : 'Ctrl+';

const SidebarElements = (props) => {
  const editor = useSlate();
  const forceUpdate = Hooks.useForceUpdate();
  const [height, setHeight] = React.useState(0);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  Hooks.useScrollTrigger(() => {
    const distance = Utilities.getScrollDistance();

    setHeight(distance - 49 >= 0 ? distance - 41 : 0);
    forceUpdate();
  });

  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const buttons = Array.from(toolbar.querySelectorAll('button')) as HTMLElement[];
    buttons.forEach((button, i) => {
      button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });
  }, []);

  const handleToolbarKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const buttons = Array.from(toolbar.querySelectorAll('button')) as HTMLElement[];
    const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      case 'Escape':
        event.preventDefault();
        ReactEditor.focus(editor);
        return;
      default:
        return;
    }

    event.preventDefault();
    buttons[currentIndex].setAttribute('tabindex', '-1');
    buttons[nextIndex].setAttribute('tabindex', '0');
    buttons[nextIndex].focus();
  }, []);

  return (
    <div ref={toolbarRef} role="toolbar" aria-label="Formatting" aria-orientation="vertical" onKeyDown={handleToolbarKeyDown} style={{ marginTop: height, transition: `200ms ease all`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column' }}>
      <Tooltip tooltipText={`Bold (${MOD}B)`} position="right" yOffset="4px" xOffset="6px">
        <ButtonAction
          aria-label="Bold"
          active={SlateUtilities.isMarkActive(editor, 'bold')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleMark(editor, 'bold');
            forceUpdate();
          }}
        >
          <Icon.EditorBold height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText={`Italic (${MOD}I)`} position="right" yOffset="4px">
        <ButtonAction
          aria-label="Italic"
          active={SlateUtilities.isMarkActive(editor, 'italic')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleMark(editor, 'italic');
            forceUpdate();
          }}
        >
          <Icon.EditorItalic height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText={`Underline (${MOD}U)`} position="right" yOffset="4px">
        <ButtonAction
          aria-label="Underline"
          active={SlateUtilities.isMarkActive(editor, 'underline')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleMark(editor, 'underline');
            forceUpdate();
          }}
        >
          <Icon.EditorUnderline height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText={`Code (${MOD}\`)`} position="right" yOffset="4px">
        <ButtonAction
          aria-label="Code"
          active={SlateUtilities.isMarkActive(editor, 'code')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleMark(editor, 'code');
            forceUpdate();
          }}
        >
          <Icon.EditorCode height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="H1" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Heading 1"
          active={SlateUtilities.isBlockActive(editor, 'heading-one')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleBlock(editor, 'heading-one');
            forceUpdate();
          }}
        >
          <Icon.EditorH1 height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="H2" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Heading 2"
          active={SlateUtilities.isBlockActive(editor, 'heading-two')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleBlock(editor, 'heading-two');
            forceUpdate();
          }}
        >
          <Icon.EditorH2 height="12px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Block Quote" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Block quote"
          active={SlateUtilities.isBlockActive(editor, 'block-quote')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleBlock(editor, 'block-quote');
            forceUpdate();
          }}
        >
          <Icon.EditorBlockQuote height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Numbered List" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Numbered list"
          active={SlateUtilities.isBlockActive(editor, 'numbered-list')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleBlock(editor, 'numbered-list');
            forceUpdate();
          }}
        >
          <Icon.EditorOrderedList height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Bulleted List" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Bulleted list"
          active={SlateUtilities.isBlockActive(editor, 'bulleted-list')}
          onClick={(event) => {
            event.preventDefault();
            SlateUtilities.toggleBlock(editor, 'bulleted-list');
            forceUpdate();
          }}
        >
          <Icon.EditorUnorderedList height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Link" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Insert link"
          active={SlateUtilities.isLinkActive(editor)}
          onClick={(event) => {
            event.preventDefault();
            const active = SlateUtilities.isLinkActive(editor);

            if (active) {
              SlateUtilities.unwrapLink(editor);
              return forceUpdate();
            }

            const url = window.prompt('Enter the URL of the link:');
            if (Utilities.isEmpty(url)) return;
            SlateUtilities.insertLink(editor, url);
            return forceUpdate();
          }}
        >
          <Icon.EditorLink height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Image" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Insert image"
          active={SlateUtilities.isBlockActive(editor, 'image')}
          onClick={(event) => {
            event.preventDefault();
            if (SlateUtilities.isBlockActive(editor, 'image')) {
              return;
            }

            var input = document.createElement('input');
            input.style.cssText = 'visiblity:hidden;position:absolute;top:0;left:0;opacity:0;height:1px;width:1px';
            input.type = 'file';
            input.onchange = function () {
              if (input.files && input.files.length) {
                editor.insertFile(input.files[0]);
              }
            };
            input.click();
          }}
        >
          <Icon.EditorImage height="10px" />
        </ButtonAction>
      </Tooltip>
    </div>
  );
};

const BottomBarElements = (props) => {
  const editor = useSlate();
  const forceUpdate = Hooks.useForceUpdate();

  const data = {
    ...props.data,
    description: props.description,
    editorContent: {
      children: editor.children,
    },
    title: props.title,
    public: props.public,
  };

  return (
    <>
      <Tooltip tooltipText={props.public ? 'Make Private' : 'Make Public'} position="right" yOffset="4px">
        <ButtonAction
          aria-label={props.public ? 'Make private' : 'Make public'}
          active={props.public}
          onClick={async () => {
            const cookies = new Cookies(null, { path: '/' });
            const key = cookies.get(Constants.COOKIE_NAME);
            const nextPublic = !props.public;
            const response = await HTTP.updatePost({
              id: props.id,
              key,
              updates: {
                data: { ...data, public: nextPublic },
                slug: props.slug,
              },
            });

            if (!response) {
              alert('An error occurred while saving this post. This may happen if the post title is not unique or if there are permission issues. If changing the post title doesn’t resolve the issue, please contact our team for assistance.');
              return;
            }

            props.onPublicChange(nextPublic);
            forceUpdate();
          }}
        >
          <Icon.Privacy height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Save" position="right" yOffset="4px">
        <ButtonAction
          aria-label="Save"
          onClick={async () => {
            const cookies = new Cookies(null, { path: '/' });
            const key = cookies.get(Constants.COOKIE_NAME);

            const response = await HTTP.updatePost({
              id: props.id,
              key,
              updates: {
                slug: props.slug,
                data,
              },
            });

            if (!response) {
              alert('An error occurred while saving this post. This may happen if the post title is not unique or if there are permission issues. If changing the post title doesn’t resolve the issue, please contact our team for assistance.');
              return;
            }

            forceUpdate();
          }}
        >
          <Icon.Save height="10px" />
        </ButtonAction>
      </Tooltip>
      <Tooltip tooltipText="Profile" position="right" yOffset="4px">
        <ButtonAction aria-label="Profile" href={`/${props.username}`}>
          <Icon.Author height="12px" />
        </ButtonAction>
      </Tooltip>
    </>
  );
};

const TopBarElements = (props) => {
  const editor = useSlate();

  let wordCount = 0;
  for (const [node] of SlateNode.texts(editor)) {
    if (node.text) {
      const words = node.text.split(' ');
      wordCount += words.length;
    }
  }

  return (
    <>
      <StatusText>[You are editing]</StatusText>
    </>
  );
};

export default function PostWithLayout(props) {
  const { post, username } = props;

  const initialValue: any = React.useMemo(() => post.data.editorContent.children, []);
  const [editor] = React.useState(() => SlateUtilities.withInlines(SlateUtilities.withMedia(SlateUtilities.withShortcuts(withReact(withHistory(createEditor()))))));
  const [publicPost, setPublicPost] = React.useState(post.data.public);
  const [title, setTitle] = React.useState(post.data.title);
  const [description, setDescription] = React.useState(post.data.description);
  const [slug, setSlug] = React.useState(post.slug);
  const [data, setData] = React.useState(post.data);

  const logoElement = <Logo />;
  const topBarElement = <TopBarElements />;
  const sideBarElement = <SidebarElements />;
  const bottomBarElement = <BottomBarElements id={post.id} title={title} description={description} slug={slug} data={data} public={publicPost} onPublicChange={setPublicPost} username={username} />;

  const handleDOMBeforeInput = React.useCallback((e: InputEvent) => {
    window.queueMicrotask(() => {
      const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

      let scheduleFlush = null;
      if (pendingDiffs) {
        scheduleFlush = pendingDiffs.some(({ diff, path }) => {
          if (!diff.text.endsWith(' ')) {
            return false;
          }

          const { text } = SlateNode.leaf(editor, path);
          const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1);
          if (!(beforeText in SlateUtilities.SHORTCUTS)) {
            return false;
          }

          const blockEntry = Editor.above(editor, {
            at: path,
            match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
          });
          if (!blockEntry) {
            return false;
          }

          const [, blockPath] = blockEntry;
          return Editor.isStart(editor, Editor.start(editor, path), blockPath);
        });
      }

      if (scheduleFlush) {
        ReactEditor.androidScheduleFlush(editor);
      }
    });
  }, []);

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <DefaultLayout logo={logoElement} top={topBarElement} sidebar={sideBarElement} bottombar={bottomBarElement}>
        <PostTitle value={title} onChange={setTitle} onSlugChange={setSlug} slug={slug} username={username} />
        <PostDescription value={description} onChange={setDescription} />
        <Post onDOMBeforeInput={handleDOMBeforeInput} editor={editor} initialValue={initialValue} onKeyDown={SlateUtilities.onKeyDown} placeholder="Start typing..." spellCheck autoFocus />
      </DefaultLayout>
    </Slate>
  );
}
