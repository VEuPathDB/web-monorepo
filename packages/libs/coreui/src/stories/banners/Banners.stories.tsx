import { Story, Meta } from '@storybook/react/types-6-0';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { gray } from '../../definitions/colors'

import Banner, { BannerComponentProps } from '../../components/banners/Banner'

export default {
    title: 'Banners/Banners',
    component: Banner
} as Meta;

const Template: Story<BannerComponentProps> = (args) => {
    return (
        <UIThemeProvider
            theme={{
                palette: {
                    primary: { hue: gray, level: 200 },
                    secondary: { hue: gray, level: 500 }
                }
            }}
        >
            <Banner {...args}></Banner>
        </UIThemeProvider>
    )
}

export const Warning = Template.bind({});
Warning.args = {
    banner: {
        type: 'warning',
        message: 'This is a "warning" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Danger = Template.bind({});
Danger.args = {
    banner: {
        type: 'danger',
        message: 'This is a "danger" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Error = Template.bind({});
Error.args = {
    banner: {
        type: 'error',
        message: 'This is an "error" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Success = Template.bind({});
Success.args = {
    banner: {
        type: 'success',
        message: 'This is a "success" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Info = Template.bind({});
Info.args = {
    banner: {
        type: 'info',
        message: 'This is an "info" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Normal = Template.bind({});
Normal.args = {
    banner: {
        type: 'normal',
        message: 'This is a "normal" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;