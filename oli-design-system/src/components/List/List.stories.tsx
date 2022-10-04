import { ComponentStory, ComponentMeta } from "@storybook/react";

import { List } from "./List";

export default {
  title: "Example/List",
  component: List,
} as ComponentMeta<typeof List>;

const Template: ComponentStory<typeof List> = (args) => <List {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  items: [
    { key: "1", text: "First item", onClick: () => true },
    { key: "2", text: "Second item", onClick: () => true },
    { key: "3", text: "Third item", onClick: () => true },
  ],
};
