import { Story, Meta } from '@storybook/react/types-6-0';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { gray } from '../../definitions/colors';

import SelectList, { SelectListProps } from '../../components/inputs/SelectList';

export default {
    title: 'Inputs/SelectList',
    component: SelectList
} as Meta;

const Template: Story<SelectListProps> = (args) => {
    return (
        // <UIThemeProvider
        // theme={{
        //     palette: {
        //         primary: { hue: gray, level: 200 },
        //         secondary: { hue: gray, level: 500 }
        //     }
        // }}
        // >
            <SelectList {...args} />
        // {/* </ UIThemeProvider> */}
    )
}

export const Standard = Template.bind({});
Standard.args = {
    items: [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ],
    value: [],
    onChange: (value: string[]) => null,
    defaultButtonDisplayContent: 'Select a letter'
} as SelectListProps;