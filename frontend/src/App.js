// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// PrivateRoute component
function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <BookList />
              </PrivateRoute>
            } />
            <Route path="/search" element={
              <PrivateRoute>
                <BookSearch />
              </PrivateRoute>
            } />
            <Route path="/books/:id" element={
              <PrivateRoute>
                <BookDetail />
              </PrivateRoute>
            } />
            <Route path="/shelves" element={
              <PrivateRoute>
                <ShelfList />
              </PrivateRoute>
            } />
            <Route path="/shelves/:id" element={
              <PrivateRoute>
                <ShelfDetail />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;