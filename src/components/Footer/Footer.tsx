import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction } from '../ui';

interface NavTab {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

interface FooterProps {
  tabs: NavTab[];
  onTabClick: (tabId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ tabs, onTabClick }) => {
  const activeTabId = tabs.find(t => t.isActive)?.id ?? tabs[0]?.id;

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      <BottomNavigation
        value={activeTabId}
        onChange={(_e, value) => onTabClick(value)}
        showLabels
      >
        {tabs.map(tab => (
          <BottomNavigationAction
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={<span aria-hidden="true">{tab.icon}</span>}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default Footer;
