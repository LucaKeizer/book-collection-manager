// src/components/shelves/ShelfList.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  IconButton,
  Box,
  Skeleton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../../services/api';

function ShelfList() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [shelfName, setShelfName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchShelves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/shelves/');
      setShelves(response.data);
    } catch (error) {
      setError('Failed to load shelves. Please try again later.');
      showSnackbar('Error loading shelves', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (shelf = null) => {
    if (shelf) {
      setEditingShelf(shelf);
      setShelfName(shelf.name);
    } else {
      setEditingShelf(null);
      setShelfName('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingShelf(null);
    setShelfName('');
  };

  const handleSubmit = async () => {
    if (!shelfName.trim()) return;

    setActionLoading(true);
    try {
      if (editingShelf) {
        await api.put(`/api/shelves/${editingShelf.id}/`, {
          name: shelfName,
          is_default: editingShelf.is_default
        });
        showSnackbar('Shelf updated successfully');
      } else {
        await api.post('/api/shelves/', {
          name: shelfName,
          is_default: false
        });
        showSnackbar('Shelf created successfully');
      }
      fetchShelves();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(
        error.response?.status === 409
          ? 'A shelf with this name already exists'
          : 'Failed to save shelf',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (shelfId) => {
    if (!window.confirm('Are you sure you want to delete this shelf?')) return;

    setActionLoading(true);
    try {
      await api.delete(`/api/shelves/${shelfId}/`);
      showSnackbar('Shelf deleted successfully');
      fetchShelves();
    } catch (error) {
      showSnackbar('Failed to delete shelf', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchShelves}>
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
          <Typography variant="h4" component="h1">
            My Shelves
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create New Shelf
          </Button>
        </Box>

        {shelves.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You haven't created any shelves yet. Create one to start organizing your books!
          </Alert>
        )}

        <Grid container spacing={3}>
          {shelves.map((shelf) => (
            <Grid item xs={12} sm={6} md={4} key={shelf.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {shelf.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shelf.book_count || 0} books
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      component={RouterLink}
                      to={`/shelves/${shelf.id}`}
                      variant="outlined"
                      size="small"
                    >
                      View Books
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(shelf)}
                      disabled={shelf.is_default}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(shelf.id)}
                      disabled={shelf.is_default}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Create/Edit Shelf Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingShelf ? 'Edit Shelf' : 'Create New Shelf'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shelf Name"
            fullWidth
            value={shelfName}
            onChange={(e) => setShelfName(e.target.value)}
            disabled={actionLoading}
            error={!shelfName.trim()}
            helperText={!shelfName.trim() ? 'Shelf name is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={actionLoading || !shelfName.trim()}
          >
            {actionLoading ? 'Saving...' : editingShelf ? 'Save' : 'Create'}
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

export default ShelfList;