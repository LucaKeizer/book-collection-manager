// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import api from '../../services/api';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: '',
      general: ''
    };
    let isValid = true;

    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await api.post('/api/auth/login/', credentials);
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
        navigate('/');
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    setErrors(prev => ({
                        ...prev,
                        username: 'User not found'
                    }));
                    break;
                case 400:
                    setErrors(prev => ({
                        ...prev,
                        password: 'Invalid password'
                    }));
                    break;
                default:
                    setErrors(prev => ({
                        ...prev,
                        general: 'Login failed. Please try again.'
                    }));
            }
        } else if (error.request) {
            setErrors(prev => ({
                ...prev,
                general: 'Unable to connect to the server. Please check your internet connection.'
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                general: 'An unexpected error occurred. Please try again.'
            }));
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" color="primary">
                  Register here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;