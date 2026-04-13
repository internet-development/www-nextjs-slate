import * as React from 'react';

import calculateNodeHeight from '@nextjs-slate/modules/calculate-node-height';
import getSizingData, { SizingData } from '@nextjs-slate/modules/get-sizing-data';
import { useComposedRef, useWindowResizeListener } from '@nextjs-slate/modules/hooks';
import { noop } from '@nextjs-slate/common/utilities';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Style = Omit<NonNullable<TextareaProps['style']>, 'maxHeight' | 'minHeight'> & {
  height?: number;
};

export type TextareaHeightChangeMeta = {
  rowHeight: number;
};
export interface TextareaAutosizeProps extends Omit<TextareaProps, 'style'> {
  maxRows?: number;
  minRows?: number;
  onHeightChange?: (height: number, meta: TextareaHeightChangeMeta) => void;
  cacheMeasurements?: boolean;
  style?: Style;
}

const TextareaAutosize: React.ForwardRefRenderFunction<HTMLTextAreaElement, TextareaAutosizeProps> = (
  { cacheMeasurements, maxRows, minRows, onChange = noop, onHeightChange = noop, ...props },
  userRef: React.Ref<HTMLTextAreaElement>
) => {
  const isControlled = props.value !== undefined;
  const libRef = React.useRef<HTMLTextAreaElement | null>(null);
  const ref = useComposedRef(libRef, userRef);
  const heightRef = React.useRef(0);
  const measurementsCacheRef = React.useRef<SizingData | undefined>(undefined);

  const resizeTextarea = () => {
    const node = libRef.current!;
    const nodeSizingData = cacheMeasurements && measurementsCacheRef.current ? measurementsCacheRef.current : getSizingData(node);

    if (!nodeSizingData) {
      return;
    }

    measurementsCacheRef.current = nodeSizingData;

    const [height, rowHeight] = calculateNodeHeight(nodeSizingData, node.value || node.placeholder || 'x', minRows, maxRows);

    if (heightRef.current !== height) {
      heightRef.current = height;
      node.style.setProperty('height', `${height}px`);
      onHeightChange(height, { rowHeight });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      resizeTextarea();
    }
    onChange(event);
  };

  if (typeof document !== 'undefined') {
    React.useLayoutEffect(resizeTextarea);
    useWindowResizeListener(resizeTextarea);
  }

  return <textarea {...props} onChange={handleChange} ref={ref} />;
};

export default /* #__PURE__ */ React.forwardRef(TextareaAutosize);
