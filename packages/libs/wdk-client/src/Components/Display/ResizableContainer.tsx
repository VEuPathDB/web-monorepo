import React, { useEffect, useRef, useImperativeHandle } from 'react';

// TODO: Do we want to store our custom hooks in a central place?
const useJQueryUIResizable = (
  containerRef: React.RefObject<HTMLElement>,
  options: JQueryUI.ResizableOptions = {
    handles: 'all',
    minWidth: 100,
    minHeight: 100,
  }
) => {
  useEffect(() => {
    if (containerRef.current) {
      $(containerRef.current).resizable(options);
    }

    return () => {
      if (containerRef.current) {
        $(containerRef.current).resizable('destroy');
      }
    };
  });
};

type ResizableProps = JQueryUI.ResizableOptions & { className?: string };

export const ResizableContainer = React.forwardRef<
  HTMLDivElement | null,
  React.PropsWithChildren<ResizableProps>
>(({ className, children, ...resizableOptions }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    ref,
    () => containerRef.current
  );
  useJQueryUIResizable(containerRef, resizableOptions);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
});
