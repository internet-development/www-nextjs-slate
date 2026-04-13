import { SizingData } from '@nextjs-slate/modules/get-sizing-data';

import forceHiddenStyles from '@nextjs-slate/modules/force-hidden-styles';

//NOTE(jimmylee): Use labelled tuples once they are available.
export type CalculatedNodeHeights = number[];

let hiddenTextarea: HTMLTextAreaElement | null = null;

const getHeight = (node: HTMLElement, sizingData: SizingData): number => {
  const height = node.scrollHeight;

  if (sizingData.sizingStyle.boxSizing === 'border-box') {
    //NOTE(jimmylee): border-box: add border, since height = content + padding + border.
    return height + sizingData.borderSize;
  }

  //NOTE(jimmylee): Remove padding, since height = content.
  return height - sizingData.paddingSize;
};

export default function calculateNodeHeight(sizingData: SizingData, value: string, minRows = 1, maxRows = Infinity): CalculatedNodeHeights {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.setAttribute('tabindex', '-1');
    hiddenTextarea.setAttribute('aria-hidden', 'true');
    forceHiddenStyles(hiddenTextarea);
  }

  if (hiddenTextarea.parentNode === null) {
    document.body.appendChild(hiddenTextarea);
  }

  const { paddingSize, borderSize, sizingStyle } = sizingData;
  const { boxSizing } = sizingStyle;

  Object.keys(sizingStyle).forEach((_key) => {
    const key = _key as keyof typeof sizingStyle;
    hiddenTextarea!.style[key] = sizingStyle[key] as any;
  });

  forceHiddenStyles(hiddenTextarea);

  hiddenTextarea.value = value;
  let height = getHeight(hiddenTextarea, sizingData);

  //NOTE(jimmylee): Measure height of a textarea with a single row.
  hiddenTextarea.value = 'x';
  const rowHeight = hiddenTextarea.scrollHeight - paddingSize;

  let minHeight = rowHeight * minRows;
  if (boxSizing === 'border-box') {
    minHeight = minHeight + paddingSize + borderSize;
  }
  height = Math.max(minHeight, height);

  let maxHeight = rowHeight * maxRows;
  if (boxSizing === 'border-box') {
    maxHeight = maxHeight + paddingSize + borderSize;
  }
  height = Math.min(maxHeight, height);

  return [height, rowHeight];
}
