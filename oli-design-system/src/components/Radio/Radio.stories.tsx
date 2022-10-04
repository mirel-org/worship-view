import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Radio } from "./Radio";

export default {
  title: "Example/Radio",
  component: Radio,
} as ComponentMeta<typeof Radio>;

const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  selected: "",
  onChange: () => true,
  options: [
    {
      key: "1",
      label: "Email",
    },
    {
      key: "2",
      label: "Audience",
    },
    {
      key: "3",
      label: "Audience",
    },
  ],
};
