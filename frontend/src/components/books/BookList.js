// src/components/books/BookList.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  Skeleton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../../services/api';

function BookList() {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/userbooks/');
      setBooks(response.data);
    } catch (error) {
      setError('Failed to load your books. Please try again later.');
      showSnackbar('Error loading books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/api/userbooks/${bookId}/`, { status: newStatus });
      showSnackbar('Book status updated successfully', 'success');
      await fetchBooks();
    } catch (error) {
      showSnackbar('Failed to update book status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBooks = status === 'all'
    ? books
    : books.filter(book => book.status === status);

  // Loading skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={100} height={36} />
                  <Skeleton variant="rectangular" width={100} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchBooks}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={status}
              label="Filter by Status"
              onChange={(e) => setStatus(e.target.value)}
              disabled={actionLoading}
            >
              <MenuItem value="all">All Books</MenuItem>
              <MenuItem value="want_to_read">Want to Read</MenuItem>
              <MenuItem value="reading">Currently Reading</MenuItem>
              <MenuItem value="read">Read</MenuItem>
            </Select>
          </FormControl>

          <Button
            component={RouterLink}
            to="/search"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Books
          </Button>
        </Box>

        {filteredBooks.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {status === 'all' 
              ? "You haven't added any books to your collection yet." 
              : `You don't have any books marked as "${status.replace(/_/g, ' ')}".`}
          </Alert>
        )}

        <Grid container spacing={3}>
          {filteredBooks.map((userBook) => (
            <Grid item xs={12} sm={6} md={4} key={userBook.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={userBook.book_details.thumbnail_url || '/book-placeholder.png'}
                  alt={userBook.book_details.title}
                  sx={{ objectFit: 'contain', pt: 2 }}
                  onError={(e) => {
                    e.target.src = '/book-placeholder.png';
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {userBook.book_details.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {userBook.book_details.authors?.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {userBook.status.replace(/_/g, ' ')}
                  </Typography>
                  {userBook.current_page > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Progress: {userBook.current_page} / {userBook.book_details.page_count} pages
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={userBook.status}
                      onChange={(e) => handleStatusChange(userBook.id, e.target.value)}
                      disabled={actionLoading}
                    >
                      <MenuItem value="want_to_read">Want to Read</MenuItem>
                      <MenuItem value="reading">Currently Reading</MenuItem>
                      <MenuItem value="read">Read</MenuItem>
                    </Select>
                  </FormControl>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/books/${userBook.book_details.google_books_id}`}
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

export default BookList;