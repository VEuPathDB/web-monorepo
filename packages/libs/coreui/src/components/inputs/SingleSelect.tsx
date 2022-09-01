import { ReactNode, useEffect, useState, useRef } from "react";
import PopoverButton from "../buttons/PopoverButton/PopoverButton";
import { Item } from "./checkboxes/CheckboxList";
import { css } from '@emotion/react';
import { uniqueId } from "lodash";
  
export interface SingleSelectProps {
    /** Used for ARIA considerations */
    name: string;
    items: Item[];
    value: string;
    onChange: (value: string) => void;
    /** A button's content if/when no values are currently selected */
    defaultButtonDisplayContent: ReactNode;
}

export default function SingleSelect({
    name,
    items,
    value,
    onChange,
    defaultButtonDisplayContent,
}: SingleSelectProps) {
    const [ selected, setSelected ] = useState<SingleSelectProps['value']>(value);
    const [ buttonDisplayContent, setButtonDisplayContent ] = useState<ReactNode>(value.length ? value : defaultButtonDisplayContent);
    const [ key, setKey ] = useState('');
    const [ isPopoverOpen, setIsPopoverOpen ] = useState<boolean>(false);
    const [ focusedElement, setFocusedElement ] = useState(0);

    const onSelect = (value: string) => {
        onChange(selected);
        setSelected(value);
        /** Creates a new key which will close the popover menu */
        setKey(uniqueId());
    }
    
    useEffect(() => {
        setButtonDisplayContent(selected.length ? selected : defaultButtonDisplayContent);
        setFocusedElement(items.findIndex(item => selected === item.value) !== -1 ? items.findIndex(item => selected === item.value) : 0)
    }, [selected, isPopoverOpen])

    const onKeyDown = (key: string, value: string) => {
        if (key === 'Enter') {
            onSelect(value);
        } else if (key === 'ArrowUp') {
            focusedElement !== 0 ? setFocusedElement(prev => prev - 1) : null;
        } else if (key === 'ArrowDown') {
            focusedElement !== items.length - 1 ? setFocusedElement(prev => prev + 1) : null;
        }
    }

    return (
        <PopoverButton
            key={key}
            buttonDisplayContent={buttonDisplayContent}
            setIsPopoverOpen={setIsPopoverOpen}
        >
            <ul
                aria-label={'Menu of selectable options'}
                role="listbox"
                css={{
                    padding: 0,
                    margin: 0,
                    minWidth: '200px',
                    listStyle: 'none',
                }}
            >
                {items.map((item, index) => (
                    <Option 
                        key={item.value} 
                        item={item} 
                        onSelect={onSelect} 
                        onKeyDown={onKeyDown} 
                        shouldFocus={
                            index === focusedElement
                        }
                        isSelected={selected === item.value}
                    />
                ))}
            </ul>
        </PopoverButton>
    )
}

interface OptionProps {
    item: Item;
    onSelect: (value: string) => void;
    onKeyDown: (key: string, value: string) => void;
    shouldFocus: boolean;
    isSelected: boolean;
}

function Option({
    item, 
    onSelect, 
    onKeyDown,
    shouldFocus,
    isSelected
}: OptionProps) {
    const optionRef = useRef<HTMLLIElement>(null);

    if (shouldFocus && optionRef.current) {
        optionRef.current.focus();
    }

    return (
        <li
            role="option"
            aria-selected={isSelected}
            ref={optionRef}
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
    )
}