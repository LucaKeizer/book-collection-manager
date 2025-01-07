// src/components/books/BookSearch.js
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  IconButton
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../../services/api';

function BookSearch() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const response = await api.get(`/api/books/search_google_books/?q=${encodeURIComponent(query)}`);
      setBooks(response.data);
      if (response.data.length === 0) {
        showSnackbar('No books found matching your search', 'info');
      }
    } catch (error) {
      setError('Failed to search books. Please try again.');
      showSnackbar('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (book) => {
    setActionLoading(true);
    try {
      await api.post(`/api/books/${book.google_books_id}/add_to_collection/`, {
        status: 'want_to_read'
      });
      showSnackbar('Book added to your collection', 'success');
    } catch (error) {
      if (error.response?.status === 409) {
        showSnackbar('Book is already in your collection', 'warning');
      } else {
        showSnackbar('Failed to add book to collection', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSearch} 
          sx={{ mb: 4 }}
          noValidate
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Search books"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                variant="outlined"
                disabled={loading}
                error={query.trim() === '' && searchPerformed}
                helperText={query.trim() === '' && searchPerformed ? 'Please enter a search term' : ''}
                InputProps={{
                  endAdornment: loading && (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !query.trim()}
                sx={{ height: '56px' }}
                startIcon={<SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {searchPerformed && !loading && books.length === 0 && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No books found matching your search term. Try a different search.
          </Alert>
        )}

        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.google_books_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={book.thumbnail_url || '/book-placeholder.png'}
                  alt={book.title}
                  sx={{ objectFit: 'contain', pt: 2 }}
                  onError={(e) => {
                    e.target.src = '/book-placeholder.png';
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {book.authors?.join(', ')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleAddToCollection(book)}
                    disabled={actionLoading}
                  >
                    Add to Collection
                  </Button>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/books/${book.google_books_id}`}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BookSearch;