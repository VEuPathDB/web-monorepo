import React, { useEffect, useRef } from 'react';

// TODO: Do we want to store our custom hooks in a central place?
const useJQueryUIResizable = ( 
  containerRef: React.RefObject<HTMLElement>,
  options: JQueryUI.ResizableOptions = { handles: 'all', minWidth: 100, minHeight: 100 }
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

export const ResizableContainer: React.FunctionComponent<ResizableProps> = ({ 
  className,
  children,
  ...resizableOptions 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useJQueryUIResizable(containerRef, resizableOptions);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
