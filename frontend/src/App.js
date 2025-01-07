// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navigation from './components/common/Navigation';
import BookSearch from './components/books/BookSearch';
import BookList from './components/books/BookList';
import BookDetail from './components/books/BookDetail';
import ShelfList from './components/shelves/ShelfList';
import ShelfDetail from './components/shelves/ShelfDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/search" element={<BookSearch />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/shelves" element={<ShelfList />} />
            <Route path="/shelves/:id" element={<ShelfDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;