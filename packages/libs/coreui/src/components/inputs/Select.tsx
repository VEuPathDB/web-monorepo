import { ReactNode, useEffect, useState, useRef } from "react";
import PopoverButton from "../buttons/PopoverButton/PopoverButton";
import { Item } from "./checkboxes/CheckboxList";
import { css } from '@emotion/react';
  
export interface SelectProps {
    name?: string;
    items: Item[];
    value: string;
    onChange: (value: string) => void;
    /** A button's content if/when no values are currently selected */
    defaultButtonDisplayContent: ReactNode;
}

export default function Select({
    name,
    items,
    value,
    onChange,
    defaultButtonDisplayContent,
}: SelectProps) {
    const [ selected, setSelected ] = useState<SelectProps['value']>(value);
    const [ buttonDisplayContent, setButtonDisplayContent ] = useState<ReactNode>(value.length ? value : defaultButtonDisplayContent);
    const [ key, setKey ] = useState('');
    const [ isPopoverOpen, setIsPopoverOpen ] = useState<boolean>(false);
    const optionsRef = useRef<HTMLUListElement>(null);

    const onSelect = (value: string) => {
        onChange(selected);
        setSelected(value);
        /** Creates a new key which will close the popover menu */
        setKey(Math.random().toString());
    }
    
    useEffect(() => {
        setButtonDisplayContent(selected.length ? selected : defaultButtonDisplayContent);
    }, [selected])
    
    useEffect(() => {
        if (optionsRef && optionsRef.current) {
            const childIndex = items.findIndex(item => selected === item.value);
            // @ts-ignore
            childIndex !== -1 ? optionsRef.current.children[childIndex].focus() : optionsRef.current.firstChild.focus()
        }
    }, [isPopoverOpen, optionsRef])

    const onKeyDown = (key: string, value: string) => {
        const activeElement = document.activeElement;
        if (key === 'Enter') {
            onSelect(value);
        } else if (key === 'ArrowUp') {
            // @ts-ignore
            activeElement?.previousSibling ? activeElement.previousSibling.focus() : null;
        } else if (key === 'ArrowDown') {
            // @ts-ignore
            activeElement?.nextSibling ? activeElement.nextSibling.focus() : null;
        }
    }

    return (
        <PopoverButton
            key={key}
            buttonDisplayContent={buttonDisplayContent}
            setIsPopoverOpen={setIsPopoverOpen}
        >
            <ul
                ref={optionsRef}
                css={{
                    padding: 0,
                    margin: 0,
                    minWidth: '200px',
                    listStyle: 'none',
                }}
            >
                {items.map((item) => (
                    <li
                        key={item.value}
                        css={css`
                            padding: 0.5em;
                            line-height: 1.25;
                            cursor: pointer;
                            &:focus {
                                background-color: #3375E1;
                                color: white;
                            }
                            &:hover {
                                background-color: #3375E1;
                                color: white;
                            }
                        `}
                        tabIndex={0}
                        onClick={() => onSelect(item.value)} 
                        onKeyDown={(e) => onKeyDown(e.key, item.value)}
                    >
                        {item.display}
                    </li>
                ))}
            </ul>
        </PopoverButton>
    )
}