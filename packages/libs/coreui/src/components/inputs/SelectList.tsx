import { ReactNode, useState, FormEvent } from "react";
import PopoverButton from "../buttons/PopoverButton";
import CheckboxList, { CheckboxListProps } from "./CheckboxList";
  
interface SelectListProps extends Omit<CheckboxListProps, 'onChange' | 'onSelectAll' | 'onClearAll'> {
    onChange: (value: string[]) => void;
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

    const checkboxListOnChange = (e: FormEvent<HTMLInputElement>) => {
        const valueChanged = e.currentTarget.value;
        const availableSelections = items.map(item => item.value);
        setSelected(
            selected.indexOf(valueChanged) == -1 ?
            selected.concat(valueChanged).sort((a,b) => availableSelections.indexOf(a) - availableSelections.indexOf(b)) :
            selected.filter(elem => elem != valueChanged)
        );
    }
    
    const checkboxListOnSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSelected(items.map(item => item.value));
        e.preventDefault();
    };
    
    const checkboxListOnClearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSelected([]);
        e.preventDefault();
    };

    const onClose = () => {
        onChange(selected)
        setButtonDisplayContent(selected.length ? selected.join(', ') : defaultButtonDisplayContent);
    }

    return (
        <PopoverButton
            buttonDisplayContent={buttonDisplayContent}
            onClose={onClose}
        >
            <CheckboxList 
                name={name}
                items={items}
                value={selected}
                onChange={checkboxListOnChange}
                onSelectAll={checkboxListOnSelectAll}
                onClearAll={checkboxListOnClearAll}
                linksPosition={linksPosition}
            />
            {children}
        </PopoverButton>
    )
}