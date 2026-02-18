import React from 'react';

/**
 * Prevents Enter key presses from bubbling up and triggering
 * native form submission. Wrap around input widgets that live
 * inside a <form> where Enter-to-submit is unwanted.
 */
export function NoSubmitOnEnter({ children }: { children: React.ReactNode }) {
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
