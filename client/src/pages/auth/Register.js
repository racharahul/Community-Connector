import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertContext } from '../../contexts/AlertContext';
import axios from 'axios';

// Validation schema
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['customer', 'provider'], 'Invalid role'),
  community: Yup.string()
    .required('Community is required'),
  building: Yup.string()
    .required('Building/Block is required'),
  unit: Yup.string()
    .required('Unit/Apartment number is required')
});

const Register = () => {
  const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
  const { setError: setAlertError, setSuccess } = useContext(AlertContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Set form error if auth error exists
    if (error) {
      setFormError(error);
      clearErrors();
    }

    // Fetch communities
    const fetchCommunities = async () => {
      try {
        const res = await axios.get('/api/communities');
        setCommunities(res.data); // API returns data directly, not nested in data property
      } catch (err) {
        console.error('Error fetching communities:', err);
        setAlertError('Failed to load communities. Please refresh the page.');
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, [isAuthenticated, navigate, error, clearErrors, setAlertError]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setFormError('');

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = values;
    
    // Debug log to see what data is being sent
    console.log('Sending registration data:', registerData);

    try {
      await register(registerData);
      setSuccess('Registration successful! Please verify your email.');
      resetForm();
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setFormError(err.response?.data?.message || 'Registration failed. Please try again.');
      setAlertError('Registration failed. Please check your information.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} className="auth-container">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create an Account
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            role: 'customer',
            community: '',
            building: '',
            unit: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, handleChange, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="firstName"
                    label="First Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email Address"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={touched.role && Boolean(errors.role)}
                  >
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="provider">Service Provider</MenuItem>
                    </Select>
                    {touched.role && errors.role && (
                      <FormHelperText>{errors.role}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={touched.community && Boolean(errors.community)}
                  >
                    <InputLabel id="community-label">Community</InputLabel>
                    <Select
                      labelId="community-label"
                      name="community"
                      value={values.community}
                      onChange={handleChange}
                      label="Community"
                      disabled={loadingCommunities}
                    >
                      {loadingCommunities ? (
                        <MenuItem value="">Loading communities...</MenuItem>
                      ) : (
                        communities.map((community) => (
                          <MenuItem key={community._id} value={community._id}>
                            {community.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {touched.community && errors.community && (
                      <FormHelperText>{errors.community}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={touched.building && Boolean(errors.building)}
                  >
                    <InputLabel id="building-label">Building/Block</InputLabel>
                    <Select
                      labelId="building-label"
                      name="building"
                      value={values.building || ''}
                      onChange={handleChange}
                      label="Building/Block"
                      disabled={!values.community || loadingCommunities}
                    >
                      {!values.community ? (
                        <MenuItem value="">Select a community first</MenuItem>
                      ) : loadingCommunities ? (
                        <MenuItem value="">Loading buildings...</MenuItem>
                      ) : (
                        communities
                          .find(c => c._id === values.community)?.buildings.map((building) => (
                            <MenuItem key={building} value={building}>
                              {building}
                            </MenuItem>
                          )) || []
                      )}
                    </Select>
                    {touched.building && errors.building && (
                      <FormHelperText>{errors.building}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="unit"
                    label="Unit/Apartment Number"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={touched.unit && Boolean(errors.unit)}
                    helperText={touched.unit && errors.unit}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;