import { ReactNode, useState } from "react";
import PopoverButton from "../buttons/PopoverButton";
import CheckboxList, { CheckboxListProps } from "./CheckboxList";
  
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
    /** 
     * this is essentially how Bob M. is handling this in his ad hoc ValuePicker for proportion controls
     * if we desire to concat the values, we'll need to add ellipsis at a calculated length/width
     * */ 
    const [ buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(value.length ? value.join(', ') : defaultButtonDisplayContent);
    /**
     * this state was lifted from PopoverButton to be able to auto close the popover in the SelectTree component when only a single value can be selected
     */
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);


    const onClose = () => {
        onChange(selected)
        setButtonDisplayContent(selected.length ? selected.join(', ') : defaultButtonDisplayContent);
    }

    return (
        <PopoverButton
            buttonDisplayContent={buttonDisplayContent}
            onClose={onClose}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <CheckboxList 
                name={name}
                items={items}
                value={selected}
                onChange={setSelected}
                linksPosition={linksPosition}
            />
            {children}
        </PopoverButton>
    )
}