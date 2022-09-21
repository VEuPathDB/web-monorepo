import { ReactNode, useState } from "react";
import PopoverButton from "../buttons/PopoverButton/PopoverButton";
import CheckboxList, { CheckboxListProps } from "./checkboxes/CheckboxList";
  
export interface SelectListProps extends CheckboxListProps {
    children?: ReactNode;
    /** A button's content if/when no values are currently selected */
    defaultButtonDisplayContent: ReactNode;
}

export default function SelectList({
    name,
    items,
    value,
    onChange,
    linksPosition,
    children,
    defaultButtonDisplayContent,
}: SelectListProps) {
    const [selected, setSelected] = useState<SelectListProps['value']>(value);
    const [ buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(value.length ? value.join(', ') : defaultButtonDisplayContent);

    const onClose = () => {
        onChange(selected)
        setButtonDisplayContent(selected.length ? selected.join(', ') : defaultButtonDisplayContent);
    }

    const buttonLabel = (
        <span
        style={{
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }}
        >
        {buttonDisplayContent}
        </span>
    );

    return (
        <PopoverButton
            buttonDisplayContent={buttonLabel}
            onClose={onClose}
        >
            <div css={{
                margin: '0.5em'
            }}>
                <CheckboxList 
                    name={name}
                    items={items}
                    value={selected}
                    onChange={setSelected}
                    linksPosition={linksPosition}
                />
                {children}
            </div>
        </PopoverButton>
    )
}