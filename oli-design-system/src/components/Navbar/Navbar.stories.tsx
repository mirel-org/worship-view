import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FaBible, FaMusic, FaPray } from "react-icons/fa";

import { Navbar } from "./Navbar";

export default {
  title: "Example/Navbar",
  component: Navbar,
} as ComponentMeta<typeof Navbar>;

const Template: ComponentStory<typeof Navbar> = (args) => <Navbar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  items: [
    { key: "1", icon: <FaBible />, onClick: () => true },
    { key: "2", icon: <FaMusic />, onClick: () => true },
    { key: "3", icon: <FaPray />, onClick: () => true },
  ],
};
