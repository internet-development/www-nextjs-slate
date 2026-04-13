'use client';

import componentStyles from '@nextjs-slate/components/Tooltip.module.css';

import * as React from 'react';

import ReactDOM from 'react-dom';

type Placement = 'top' | 'bottom' | 'left' | 'right';
type TooltipProps = {
  children: React.ReactNode;
  styles?: React.CSSProperties;
  tooltipText: string;
  position: Placement;
  delayMs?: number;
  xOffset?: React.CSSProperties['marginLeft'];
  yOffset?: React.CSSProperties['marginTop'];

};

function arrowPosition(placement: Placement) {
  switch (placement) {
    case 'top':
      return { top: '100%', left: '50%' };
    case 'bottom':
      return { top: '0', left: '50%' };
    case 'left':
      return { top: '50%', left: '100%' };
    case 'right':
      return { top: '50%', left: '0' };
  }

}

const DEFAULT_OPEN_DELAY_MS = 300;

export default function Tooltip({ position: placement, children, styles, tooltipText, delayMs, yOffset, xOffset }: TooltipProps) {
  delayMs = delayMs === undefined ? DEFAULT_OPEN_DELAY_MS : delayMs;
  const [position, setPosition] = React.useState({ top: 0, left: 0, placement });
  const [visible, setVisible] = React.useState(false);
  const tooltipId = React.useId();

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const arrowRef = React.useRef<HTMLDivElement>(null);
  const delayRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  React.useLayoutEffect(() => {

    if (!visible || !triggerRef.current || !tooltipRef.current || !arrowRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    //NOTE(jimmylee): Calculate the space between the tooltip's bounding rectangle and the edges of the viewport.
    const availableSpace: Record<Placement, number> = {
      top: triggerRect.top,
      bottom: viewportSize.height - triggerRect.bottom,
      left: triggerRect.left,
      right: viewportSize.width - triggerRect.right
    }

    const arrowSize = arrowRef.current.getBoundingClientRect();
    //NOTE(jimmylee): The arrow is a diamond, positioned 50% under the tooltip to appear as if it is pointing to the trigger.
    const tooltipSize = {
      width: tooltipRect.width,
      height: tooltipRect.height
    }

    const requiredSpace: Record<Placement, number> = {
      top: tooltipRect.height + arrowSize.height / 2,
      bottom: tooltipRect.height + arrowSize.height / 2,
      left: tooltipRect.width + arrowSize.width / 2,
      right: tooltipRect.width + arrowSize.width / 2
    };

    const validPlacements = (Object.keys(availableSpace) as Placement[]).filter((placement) => {
      return availableSpace[placement] > requiredSpace[placement];
    });

    const placementPriority: Array<Placement> = [];
    switch (placement) {
      case 'top':
        placementPriority.push('top', 'bottom', 'left', 'right');
        break;
      case 'bottom':
        placementPriority.push('bottom', 'top', 'left', 'right');
        break;
      case 'left':
        placementPriority.push('left', 'right', 'top', 'bottom');
        break;
      case 'right':
        placementPriority.push('right', 'left', 'top', 'bottom');
        break;
    }
    let finalPlacement: Placement = placement;
    for (const placement of placementPriority) {
      if (validPlacements.includes(placement)) {
        finalPlacement = placement;
        break;
      }
    }

    const triggerCenter = {
      x: triggerRect.left + triggerRect.width / 2,
      y: triggerRect.top + triggerRect.height / 2
    }

    let top: number;
    let left: number;

    switch (finalPlacement) {
      case 'top':
        top = triggerRect.top + window.scrollY - (tooltipSize.height) - arrowSize.height / 2;
        left = triggerCenter.x + window.scrollX - tooltipSize.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + window.scrollY + (arrowSize.width / 2);
        left = triggerCenter.x + window.scrollX - tooltipSize.width / 2;
        break;
      case 'left':
        top = window.scrollY + triggerCenter.y - tooltipSize.height / 2;
        left = window.scrollX + triggerRect.left - tooltipSize.width - arrowSize.width / 2;
        break;
      case 'right':
        top = window.scrollY + triggerCenter.y - tooltipSize.height / 2;
        left = window.scrollX + triggerRect.right + arrowSize.width / 2;
        break;
    }
    setPosition({ top: Math.round(top), left: Math.round(left), placement: finalPlacement });
  }, [visible])

  function onMouseEnter() {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
    delayRef.current = setTimeout(() => {
      setVisible(true);
    }, delayMs || 0);
  }
  function onMouseLeave() {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
    setVisible(false);
  }

  return (<>
    <div className={componentStyles.trigger} ref={triggerRef} onMouseEnter={onMouseEnter} onFocus={onMouseEnter} onMouseLeave={onMouseLeave} onBlur={onMouseLeave} aria-describedby={tooltipId}>{children}</div >
    {visible && ReactDOM.createPortal(<div ref={tooltipRef} id={tooltipId} className={componentStyles.tooltip} style={{ ...styles, marginTop: yOffset, marginLeft: xOffset, left: position.left, top: position.top }}>
      {tooltipText}
      <div className={componentStyles.arrow} ref={arrowRef} style={arrowPosition(position.placement)} />
    </div>, document.body)
    }
  </>)
}
