import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Divider,
  Alert
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  // State for toggle buttons
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedHighContrast = localStorage.getItem('highContrast');
    
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
    
    if (savedHighContrast !== null) {
      setIsHighContrast(JSON.parse(savedHighContrast));
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [isDarkMode]);

  // Apply high contrast
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.style.filter = 'contrast(150%)';
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.style.filter = 'none';
    }
  }, [isHighContrast]);

  // Handle Dark Mode toggle
  const handleDarkModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    
    // Show confirmation
    console.log(`Dark Mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Handle High Contrast toggle
  const handleHighContrastToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsHighContrast(newValue);
    localStorage.setItem('highContrast', JSON.stringify(newValue));
    
    // Show confirmation
    console.log(`High Contrast ${newValue ? 'enabled' : 'disabled'}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Configure your FraudGuard Pro preferences
        </Typography>
      </Box>

      {/* Settings Content */}
      <Paper sx={{ p: 4 }}>
        {/* Appearance Section */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" mb={2}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Appearance
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          {/* Dark Mode Setting */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" component="h3">
                  Dark Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toggle between light and dark themes
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={handleDarkModeToggle}
                    name="darkMode"
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* High Contrast Setting */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" component="h3">
                  High Contrast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Increase contrast for better visibility
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isHighContrast}
                    onChange={handleHighContrastToggle}
                    name="highContrast"
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Status Alert */}
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Settings are automatically saved and will persist across browser sessions
        </Alert>

        {/* Current Status Display */}
        <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Current Settings Status:
          </Typography>
          <Typography variant="body2">
            🌙 Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}
          </Typography>
          <Typography variant="body2">
            🔆 High Contrast: {isHighContrast ? 'Enabled' : 'Disabled'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
