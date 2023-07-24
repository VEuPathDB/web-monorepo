import { useRef, useEffect } from 'react';

class BodyScrollManager {
  private refs = new Set<object>();

  blockScroll(instance: object) {
    this.refs.add(instance);
    this.updateBodyClass();
  }

  unblockScroll(instance: object) {
    this.refs.delete(instance);
    this.updateBodyClass();
  }

  private updateBodyClass() {
    const className = 'wdk-ModalOpen';
    const classes = document.body.classList;
    const needs = this.refs.size > 0;
    const has = classes.contains(className);
    if (needs && !has) classes.add(className);
    else if (!needs && has) classes.remove(className);
  }
}

const bodyScrollManager = new BodyScrollManager();

export function useBodyScrollManager(isDisabled: boolean) {
  // A ref can be treated like an instance variable
  // See https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
  const ref = useRef({});
  useEffect(() => {
    if (isDisabled) {
      bodyScrollManager.blockScroll(ref.current);
    } else {
      bodyScrollManager.unblockScroll(ref.current);
    }

    return () => {
      bodyScrollManager.unblockScroll(ref.current);
    };
  }, [isDisabled]);
}
