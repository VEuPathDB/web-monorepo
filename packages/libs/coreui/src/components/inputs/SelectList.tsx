import { ReactNode } from "react";
import PopoverButton from "../buttons/PopoverButton";
import CheckboxList, {LinksPosition} from "./CheckboxList";

type Item = {
    display: ReactNode
    value: any
  }
  
type SelectListProps = {
    name?: string
    items: Item[]
    value: string[]
    onChange: (value: string[]) => void
    linksPosition?: LinksPosition
    popoverCustomizations?: ReactNode
    buttonDisplayContent: ReactNode
    onClose?: unknown
}

export default function SelectList({
    name,
    items,
    value,
    onChange,
    linksPosition,
    popoverCustomizations,
    buttonDisplayContent,
    onClose = null
}: SelectListProps) {

    return (
        <PopoverButton
            buttonDisplayContent={buttonDisplayContent}
            onClose={onClose}
        >
            <CheckboxList 
                name={name}
                items={items}
                value={value}
                onChange={onChange}
                linksPosition={linksPosition}
            />
            {popoverCustomizations}
        </PopoverButton>
    )
}