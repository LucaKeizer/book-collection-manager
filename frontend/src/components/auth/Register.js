// src/components/auth/Register.js
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
 InputAdornment,
 IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../services/api';

function Register() {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   username: '',
   email: '',
   password: '',
   password2: '',
 });

 const [errors, setErrors] = useState({
   username: '',
   email: '',
   password: '',
   password2: '',
   general: ''
 });

 const [showPasswords, setShowPasswords] = useState({
   password: false,
   password2: false
 });

 const [loading, setLoading] = useState(false);

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
   // Clear errors when user types
   setErrors(prev => ({
     ...prev,
     [name]: '',
     general: ''
   }));
 };

 const togglePasswordVisibility = (field) => {
   setShowPasswords(prev => ({
     ...prev,
     [field]: !prev[field]
   }));
 };

 const validateForm = () => {
   const newErrors = {
     username: '',
     email: '',
     password: '',
     password2: '',
     general: ''
   };
   let isValid = true;

   // Username validation
   if (!formData.username.trim()) {
     newErrors.username = 'Username is required';
     isValid = false;
   } else if (formData.username.length < 3) {
     newErrors.username = 'Username must be at least 3 characters long';
     isValid = false;
   }

   // Email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!formData.email.trim()) {
     newErrors.email = 'Email is required';
     isValid = false;
   } else if (!emailRegex.test(formData.email)) {
     newErrors.email = 'Please enter a valid email address';
     isValid = false;
   }

   // Password validation
   if (!formData.password) {
     newErrors.password = 'Password is required';
     isValid = false;
   } else if (formData.password.length < 8) {
     newErrors.password = 'Password must be at least 8 characters long';
     isValid = false;
   }

   // Password confirmation validation
   if (!formData.password2) {
     newErrors.password2 = 'Please confirm your password';
     isValid = false;
   } else if (formData.password !== formData.password2) {
     newErrors.password2 = 'Passwords do not match';
     isValid = false;
   }

   setErrors(newErrors);
   return isValid;
 };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    try {
        const response = await api.post('/api/auth/register/', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
        });
        
        if (response.status === 201) {
            // Store the token
            const token = response.data.token;
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Token ${token}`;
            
            // Navigate to home page
            navigate('/', { 
                state: { 
                    message: 'Registration successful! Welcome to your account.',
                    severity: 'success'
                }
            });
        }
    } catch (error) {
     if (error.response) {
       const data = error.response.data;
       
       // Handle different error types
       if (data.username) {
         setErrors(prev => ({
           ...prev,
           username: 'This username is already taken'
         }));
       }
       if (data.email) {
         setErrors(prev => ({
           ...prev,
           email: 'This email is already registered'
         }));
       }
       if (data.password) {
         setErrors(prev => ({
           ...prev,
           password: Array.isArray(data.password) ? data.password[0] : 'Invalid password'
         }));
       }
       if (data.message) {
         setErrors(prev => ({
           ...prev,
           general: data.message
         }));
       }
       if (!data.username && !data.email && !data.password && !data.message) {
         setErrors(prev => ({
           ...prev,
           general: 'Registration failed. Please try again.'
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
           Register
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
             value={formData.username}
             onChange={handleChange}
             margin="normal"
             error={!!errors.username}
             helperText={errors.username}
             disabled={loading}
             required
           />

           <TextField
             fullWidth
             label="Email"
             name="email"
             type="email"
             value={formData.email}
             onChange={handleChange}
             margin="normal"
             error={!!errors.email}
             helperText={errors.email}
             disabled={loading}
             required
           />

           <TextField
             fullWidth
             label="Password"
             name="password"
             type={showPasswords.password ? "text" : "password"}
             value={formData.password}
             onChange={handleChange}
             margin="normal"
             error={!!errors.password}
             helperText={errors.password || "Password must be at least 8 characters long"}
             disabled={loading}
             required
             InputProps={{
               endAdornment: (
                 <InputAdornment position="end">
                   <IconButton
                     onClick={() => togglePasswordVisibility('password')}
                     edge="end"
                   >
                     {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                   </IconButton>
                 </InputAdornment>
               ),
             }}
           />

           <TextField
             fullWidth
             label="Confirm Password"
             name="password2"
             type={showPasswords.password2 ? "text" : "password"}
             value={formData.password2}
             onChange={handleChange}
             margin="normal"
             error={!!errors.password2}
             helperText={errors.password2}
             disabled={loading}
             required
             InputProps={{
               endAdornment: (
                 <InputAdornment position="end">
                   <IconButton
                     onClick={() => togglePasswordVisibility('password2')}
                     edge="end"
                   >
                     {showPasswords.password2 ? <VisibilityOff /> : <Visibility />}
                   </IconButton>
                 </InputAdornment>
               ),
             }}
           />

           <Button
             type="submit"
             fullWidth
             variant="contained"
             sx={{ mt: 3, mb: 2 }}
             disabled={loading}
           >
             {loading ? 'Creating Account...' : 'Register'}
           </Button>

           <Box sx={{ mt: 2, textAlign: 'center' }}>
             <Typography variant="body2">
               Already have an account?{' '}
               <Link component={RouterLink} to="/login" color="primary">
                 Login here
               </Link>
             </Typography>
           </Box>
         </Box>
       </Paper>
     </Box>
   </Container>
 );
}

export default Register;