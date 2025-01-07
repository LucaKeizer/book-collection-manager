// src/components/books/BookDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  TextField,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop
} from '@mui/material';
import api from '../../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [book, setBook] = useState(null);
  const [userBook, setUserBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newReview, setNewReview] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]); // Add fetchBookData to dependencies  

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchBookData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bookResponse = await api.get(`/api/books/${id}/`);
      setBook(bookResponse.data);

      const userBooksResponse = await api.get('/api/userbooks/', {
        params: { book: id }
      });
      
      if (userBooksResponse.data.length > 0) {
        const userBookData = userBooksResponse.data[0];
        setUserBook(userBookData);
        setCurrentPage(userBookData.current_page);

        try {
          const [notesRes, reviewsRes, quotesRes] = await Promise.all([
            api.get('/api/notes/', { params: { user_book: userBookData.id } }),
            api.get('/api/reviews/', { params: { user_book: userBookData.id } }),
            api.get('/api/quotes/', { params: { user_book: userBookData.id } })
          ]);

          setNotes(notesRes.data);
          setReviews(reviewsRes.data);
          setQuotes(quotesRes.data);
        } catch (error) {
          showSnackbar('Error loading some book details', 'warning');
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Book not found');
        navigate('/books'); // Redirect to books list
      } else {
        setError('Error loading book details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!userBook) return;

    setActionLoading(true);
    try {
      await api.post(`/api/userbooks/${userBook.id}/update_progress/`, {
        current_page: currentPage,
        create_session: true,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });
      showSnackbar('Progress updated successfully');
      fetchBookData();
    } catch (error) {
      showSnackbar('Failed to update progress', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!userBook || !newNote.trim()) return;

    setActionLoading(true);
    try {
      await api.post('/api/notes/', {
        user_book: userBook.id,
        content: newNote,
        page_number: currentPage
      });
      setNewNote('');
      showSnackbar('Note added successfully');
      fetchBookData();
    } catch (error) {
      showSnackbar('Failed to add note', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddQuote = async () => {
    if (!userBook || !newQuote.trim()) return;

    setActionLoading(true);
    try {
      await api.post('/api/quotes/', {
        user_book: userBook.id,
        content: newQuote,
        page_number: currentPage
      });
      setNewQuote('');
      showSnackbar('Quote added successfully');
      fetchBookData();
    } catch (error) {
      showSnackbar('Failed to add quote', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!userBook || !newReview.trim()) return;

    setActionLoading(true);
    try {
      await api.post('/api/reviews/', {
        user_book: userBook.id,
        content: newReview,
        is_public: true
      });
      setNewReview('');
      showSnackbar('Review posted successfully');
      fetchBookData();
    } catch (error) {
      showSnackbar('Failed to post review', 'error');
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/books')}>
          Return to Book List
        </Button>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Book not found</Alert>
      </Container>
    );
  }

  const readingProgress = userBook ? (currentPage / book.page_count) * 100 : 0;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Book Info Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box
                component="img"
                src={book.thumbnail_url || '/book-placeholder.png'}
                alt={book.title}
                sx={{ width: '100%', height: 'auto', mb: 2 }}
                onError={(e) => {
                  e.target.src = '/book-placeholder.png';
                }}
              />
              <Typography variant="h5" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                by {book.authors?.join(', ')}
              </Typography>
              <Typography variant="body2" paragraph>
                {book.description}
              </Typography>
              <Typography variant="body2">
                Pages: {book.page_count}
              </Typography>
            </Paper>
          </Grid>

          {/* Reading Progress and Notes Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
              >
                <Tab label="Progress" />
                <Tab label="Notes" />
                <Tab label="Quotes" />
                <Tab label="Reviews" />
              </Tabs>

              {/* Progress Tab */}
              <TabPanel value={tabValue} index={0}>
                {userBook ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Reading Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={readingProgress} 
                      sx={{ height: 10, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {currentPage} of {book.page_count} pages ({Math.round(readingProgress)}%)
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <TextField
                        type="number"
                        label="Current Page"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        InputProps={{ 
                          inputProps: { min: 0, max: book.page_count },
                          disabled: actionLoading
                        }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleUpdateProgress}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Updating...' : 'Update Progress'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ m: 2 }}>
                    Add this book to your collection to track reading progress
                  </Alert>
                )}
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel value={tabValue} index={1}>
                {userBook ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Add a note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        disabled={actionLoading}
                        sx={{ mb: 2 }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAddNote}
                        disabled={actionLoading || !newNote.trim()}
                      >
                        {actionLoading ? 'Adding...' : 'Add Note'}
                      </Button>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <Card key={note.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="body1">{note.content}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Page {note.page_number} - {new Date(note.created_at).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography color="text.secondary">No notes yet</Typography>
                    )}
                  </>
                ) : (
                  <Alert severity="info" sx={{ m: 2 }}>
                    Add this book to your collection to create notes
                  </Alert>
                )}
              </TabPanel>

              {/* Similar structure for Quotes and Reviews tabs... */}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Loading backdrop */}
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

export default BookDetail;