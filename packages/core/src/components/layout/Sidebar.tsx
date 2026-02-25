import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

const SIDEBAR_OPEN_EVENT = 'sidebar:open';
const SIDEBAR_CLOSE_EVENT = 'sidebar:close';

export function openSidebar() {
  window.dispatchEvent(new Event(SIDEBAR_OPEN_EVENT));
}

export function closeSidebar() {
  window.dispatchEvent(new Event(SIDEBAR_CLOSE_EVENT));
}

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: FC<SidebarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    window.addEventListener(SIDEBAR_OPEN_EVENT, handleOpen);
    window.addEventListener(SIDEBAR_CLOSE_EVENT, handleClose);
    return () => {
      window.removeEventListener(SIDEBAR_OPEN_EVENT, handleOpen);
      window.removeEventListener(SIDEBAR_CLOSE_EVENT, handleClose);
    };
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <div
        className="sidebar-backdrop"
        data-open={isOpen}
        onClick={handleClose}
      />
      <div
        className="sidebar-panel bg-background border-r border-border"
        data-open={isOpen}
      >
        {children}
      </div>
    </>
  );
};

export default Sidebar;
