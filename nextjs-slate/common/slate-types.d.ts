import { BaseEditor, BaseElement } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
type HeadingOneElement = { type: 'heading-one'; children: CustomText[] };
type HeadingTwoElement = { type: 'heading-two'; children: CustomText[] };
type BlockQuoteElement = { type: 'block-quote'; children: CustomText[] };
type BulletedListElement = { type: 'bulleted-list'; children: ListItemElement[] };
type NumberedListElement = { type: 'numbered-list'; children: ListItemElement[] };
type ListItemElement = { type: 'list-item'; children: CustomText[] };
type LinkElement = { type: 'link'; url: string; children: CustomText[] };
type ImageElement = { type: 'image'; url: string; alt?: string; children: CustomText[] };
type VideoElement = { type: 'video'; url: string; children: CustomText[] };

type CustomElement = ParagraphElement | HeadingOneElement | HeadingTwoElement | BlockQuoteElement | BulletedListElement | NumberedListElement | ListItemElement | LinkElement | ImageElement | VideoElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor & { insertFile: (file: File) => Promise<void> };
    Element: CustomElement;
    Text: CustomText;
  }
}
