// src/components/shelves/ShelfDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import api from '../../services/api';

function ShelfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);

  useEffect(() => {
    fetchShelfData();
  }, [id]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchShelfData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [shelfResponse, booksResponse] = await Promise.all([
        api.get(`/api/shelves/${id}/`),
        api.get(`/api/shelves/${id}/books/`)
      ]);
      setShelf(shelfResponse.data);
      setBooks(booksResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Shelf not found');
        navigate('/shelves');
      } else {
        setError('Failed to load shelf data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddBookDialog = async () => {
    setActionLoading(true);
    try {
      // Fetch user's books that aren't in this shelf
      const response = await api.get('/api/userbooks/');
      const shelfBookIds = new Set(books.map(book => book.id));
      const availableBooks = response.data.filter(book => !shelfBookIds.has(book.id));
      setAvailableBooks(availableBooks);
      setAddBookDialogOpen(true);
    } catch (error) {
      showSnackbar('Failed to load available books', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBookToShelf = async (bookId) => {
    setActionLoading(true);
    try {
      await api.post(`/api/userbooks/${bookId}/shelves/`, {
        shelf_id: id
      });
      showSnackbar('Book added to shelf successfully');
      fetchShelfData();
      setAddBookDialogOpen(false);
    } catch (error) {
      showSnackbar('Failed to add book to shelf', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBookFromShelf = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book from the shelf?')) return;

    setActionLoading(true);
    try {
      await api.delete(`/api/userbooks/${bookId}/shelves/${id}/`);
      showSnackbar('Book removed from shelf successfully');
      fetchShelfData();
    } catch (error) {
      showSnackbar('Failed to remove book from shelf', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/shelves"
        >
          Back to Shelves
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/shelves"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Shelves
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              {shelf?.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddBookDialog}
              disabled={actionLoading}
            >
              Add Books
            </Button>
          </Box>

          {books.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              This shelf is empty. Add some books to get started!
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {books.map((userBook) => (
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
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/books/${userBook.book_details.google_books_id}`}
                      >
                        View Details
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveBookFromShelf(userBook.id)}
                        disabled={actionLoading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Add Book Dialog */}
      <Dialog 
        open={addBookDialogOpen} 
        onClose={() => setAddBookDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Books to Shelf</DialogTitle>
        <DialogContent>
          {availableBooks.length === 0 ? (
            <Alert severity="info">
              No books available to add. Add some books to your collection first!
            </Alert>
          ) : (
            <List>
              {availableBooks.map((book) => (
                <React.Fragment key={book.id}>
                  <ListItem>
                    <ListItemText
                      primary={book.book_details.title}
                      secondary={book.book_details.authors?.join(', ')}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleAddBookToShelf(book.id)}
                        disabled={actionLoading}
                      >
                        Add
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddBookDialogOpen(false)} 
            disabled={actionLoading}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Snackbar for notifications */}
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

export default ShelfDetail;