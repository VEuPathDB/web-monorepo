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
    const optionsRef = useRef<HTMLUListElement>(null);
    console.log(optionsRef);

    const onSelect = (value: string) => {
        onChange(selected)
        setSelected(value)
        setKey(Math.random().toString())
    }
    
    useEffect(() => {
        setButtonDisplayContent(selected.length ? selected : defaultButtonDisplayContent);
    }, [selected])

    // useEffect(() => {
    //     if (optionsRef && optionsRef.current) {
    //         console.log(optionsRef.current.children[0])
    //     }
    // }, [optionsRef])

    // if (optionsRef && optionsRef.current) optionsRef.current;

    return (
        <PopoverButton
            key={key}
            buttonDisplayContent={buttonDisplayContent}
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
                {items.map((item, index) => (
                    <li
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
                        onKeyDown={(e) => e.key === 'Enter' ? onSelect(item.value) : null}
                    >
                        {item.display}
                    </li>
                ))}
            </ul>
        </PopoverButton>
    )
}