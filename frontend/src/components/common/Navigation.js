// src/components/common/Navigation.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box
} from '@mui/material';
import { Search as SearchIcon, Bookmarks as BookShelfIcon } from '@mui/icons-material';

function Navigation() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Book Collection
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/search"
              color="inherit"
              startIcon={<SearchIcon />}
            >
              Search Books
            </Button>
            <Button
              component={RouterLink}
              to="/shelves"
              color="inherit"
              startIcon={<BookShelfIcon />}
            >
              My Shelves
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;