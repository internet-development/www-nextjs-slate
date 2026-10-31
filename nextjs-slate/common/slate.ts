import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as Utilities from '@nextjs-slate/common/utilities';

import Cookies from '@nextjs-slate/modules/cookies';

import { Point, Editor, Range, Transforms, Element as SlateElement, type Element } from 'slate';
import { isHotkey, isKeyHotkey } from '@nextjs-slate/modules/is-hotkey';

type LinkElement = Extract<Element, { type: 'link' }>;
type BulletedListElement = Extract<Element, { type: 'bulleted-list' }>;

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export const MEDIA_TYPES = ['image', 'video'];

export const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

export const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
};

export const INITIAL_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing...' }],
  },
];

export const insertImage = (editor, url) => {
  const text = { text: '' };
  const image = { type: 'image' as const, url, children: [text] };
  Transforms.insertNodes(editor, image);
};

export const insertVideo = (editor, url) => {
  const text = { text: '' };
  const video = { type: 'video' as const, url, children: [text] };
  Transforms.insertNodes(editor, video);
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  );

  return !!match;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes<SlateElement>(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

export const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};

export const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};

export const wrapLink = (editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const withShortcuts = (editor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text, options) => {
    const { selection } = editor;

    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor);
        }

        const newProperties: Partial<SlateElement> = {
          type,
        };
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        });

        if (type === 'list-item') {
          const list: BulletedListElement = {
            type: 'bulleted-list',
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
          });
        }

        return;
      }
    }

    insertText(text, options);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (!Editor.isEditor(block) && SlateElement.isElement(block) && block.type !== 'paragraph' && Point.equals(selection.anchor, start)) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

export const withInlines = (editor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => ['link'].includes(element.type) || isInline(element);

  editor.insertText = (text, options) => {
    if (text && Utilities.isURL(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text, options);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && Utilities.isURL(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const withMedia = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return MEDIA_TYPES.includes(element.type) ? true : isVoid(element);
  };

  editor.insertData = async (data) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      const file = files && files[0] ? files[0] : null;
      if (!file) {
        return;
      }

      const cookies = new Cookies(null, { path: '/' });
      const key = cookies.get(Constants.COOKIE_NAME);
      const result = await HTTP.uploadData({ file, key });


      if (file.type.startsWith('image/')) {
        insertImage(editor, result.fileURL);
      } else if (file.type.startsWith('video/')) {
        insertVideo(editor, result.fileURL);
      }
    } else if (Utilities.isImageURL(text)) {
      insertImage(editor, text);
    } else if (Utilities.isVideoURL(text)) {
      insertVideo(editor, text);
    } else {
      insertData(data);
    }
  };

  editor.insertFile = async (file) => {
    const cookies = new Cookies(null, { path: '/' });
    const key = cookies.get(Constants.COOKIE_NAME);
    const result = await HTTP.uploadData({ file, key });
    if (file.type.startsWith('video/')) {
      insertVideo(editor, result.fileURL);
    } else {
      insertImage(editor, result.fileURL);
    }
  };

  return editor;
};

export const onKeyDown = (event, editor) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event as any)) {
      event.preventDefault();
      const mark = HOTKEYS[hotkey];
      toggleMark(editor, mark);
      return;
    }
  }

  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const { nativeEvent } = event;
    if (isKeyHotkey('left', nativeEvent)) {
      event.preventDefault();
      Transforms.move(editor, { unit: 'offset', reverse: true });
      return;
    }
    if (isKeyHotkey('right', nativeEvent)) {
      event.preventDefault();
      Transforms.move(editor, { unit: 'offset' });
      return;
    }
  }
};
