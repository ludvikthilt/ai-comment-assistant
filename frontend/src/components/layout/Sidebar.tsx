import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Comment as CommentIcon,
  QuestionAnswer as QuestionIcon,
  Description as TemplateIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuthStore, useSettingsStore } from '@/stores';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Commentaires', icon: <CommentIcon />, path: '/comments' },
  { label: 'Questions', icon: <QuestionIcon />, path: '/questions' },
  { label: 'Templates', icon: <TemplateIcon />, path: '/templates' },
  { label: 'Pages Facebook', icon: <FacebookIcon />, path: '/facebook-pages' },
  { label: 'WhatsApp', icon: <WhatsAppIcon />, path: '/whatsapp' },
  { label: 'Historique', icon: <HistoryIcon />, path: '/history' },
  { label: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const [hovered, setHovered] = useState(false);

  const drawerWidth = sidebarCollapsed && !hovered ? 72 : 260;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed && !hovered ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {(!sidebarCollapsed || hovered) && (
          <Typography variant="h6" fontWeight={800} color="primary" noWrap>
            FB Comment AI
          </Typography>
        )}
        <IconButton onClick={toggleSidebar} size="small">
          {sidebarCollapsed && !hovered ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              title={sidebarCollapsed && !hovered ? item.label : ''}
              placement="right"
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    onMobileClose();
                  }}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed && !hovered ? 'center' : 'flex-start',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'inherit' },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed && !hovered ? 0 : 40,
                      mr: sidebarCollapsed && !hovered ? 0 : 1,
                      color: isActive ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!sidebarCollapsed || hovered) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* User */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {user?.full_name?.charAt(0) || 'U'}
        </Avatar>
        {(!sidebarCollapsed || hovered) && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.full_name || 'Utilisateur'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role || 'viewer'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
