import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertContext } from '../../contexts/AlertContext';
import axios from 'axios';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

// Validation schema
const ServiceSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  category: Yup.string()
    .required('Category is required'),
  subCategory: Yup.string(),
  tags: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
  priceInfo: Yup.object().shape({
    type: Yup.string().required('Price type is required'),
    fixedPrice: Yup.number().when('type', {
      is: 'fixed',
      then: Yup.number().required('Fixed price is required').positive('Price must be positive')
    }),
    hourlyRate: Yup.number().when('type', {
      is: 'hourly',
      then: Yup.number().required('Hourly rate is required').positive('Rate must be positive')
    }),
    minPrice: Yup.number().when('type', {
      is: 'range',
      then: Yup.number().required('Minimum price is required').positive('Price must be positive')
    }),
    maxPrice: Yup.number().when('type', {
      is: 'range',
      then: Yup.number().required('Maximum price is required').positive('Price must be positive')
        .moreThan(Yup.ref('minPrice'), 'Maximum price must be greater than minimum price')
    }),
    customDescription: Yup.string().when('type', {
      is: 'custom',
      then: Yup.string().required('Custom price description is required')
    })
  }),
  availability: Yup.object().shape({
    days: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one day is required')
      .required('Days are required'),
    timeSlots: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one time slot is required')
      .required('Time slots are required'),
    notes: Yup.string()
  }),
  customFields: Yup.object()
});

const CreateService = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { setError, setSuccess } = useContext(AlertContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [categoryFields, setCategoryFields] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Days of the week for availability selection
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Time slots for availability selection
  const timeSlots = [
    'Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Night (9PM-6AM)'
  ];

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (isAuthenticated && user) {
      if (user.role !== 'provider') {
        setError('Only service providers can create services');
        navigate('/services');
        return;
      }
    } else {
      setError('Please login as a service provider to create services');
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.data.filter(cat => !cat.parentCategory));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, user, setError, navigate]);

  const handleCategoryChange = async (categoryId, setFieldValue) => {
    setFieldValue('category', categoryId);
    setFieldValue('subCategory', '');
    
    if (!categoryId) {
      setSubCategories([]);
      setCategoryFields([]);
      return;
    }

    try {
      // Fetch subcategories
      const subCatRes = await axios.get(`/api/categories?parentCategory=${categoryId}`);
      setSubCategories(subCatRes.data.data);

      // Fetch category details to get form fields
      const categoryRes = await axios.get(`/api/categories/${categoryId}`);
      setCategoryFields(categoryRes.data.data.formFields || []);

      // Initialize custom fields based on category form fields
      const initialCustomFields = {};
      categoryRes.data.data.formFields?.forEach(field => {
        initialCustomFields[field.name] = '';
      });
      setFieldValue('customFields', initialCustomFields);
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError('Failed to load category details. Please try again.');
    }
  };

  const handleAddTag = (values, setFieldValue) => {
    if (newTag.trim() && !values.tags.includes(newTag.trim())) {
      setFieldValue('tags', [...values.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index, values, setFieldValue) => {
    const newTags = [...values.tags];
    newTags.splice(index, 1);
    setFieldValue('tags', newTags);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Limit to 5 images
    if (imageFiles.length + files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    // Check file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) setError(`${file.name} is not a valid image type`);
      if (!isValidSize) setError(`${file.name} exceeds the 5MB size limit`);
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setImageFiles([...imageFiles, ...validFiles]);

    // Create preview URLs
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls = [];
    
    try {
      // In a real implementation, you would upload each image to your server or a cloud storage service
      // For this example, we'll simulate the upload and return placeholder URLs
      for (const file of imageFiles) {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, you would get the URL from your upload response
        uploadedUrls.push(`https://via.placeholder.com/800x600?text=${encodeURIComponent(file.name)}`);
      }
      
      setUploadingImages(false);
      return uploadedUrls;
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
      setUploadingImages(false);
      return [];
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Format the data for the API
      const serviceData = {
        ...values,
        images: imageUrls,
        // Convert priceInfo and availability to strings as required by the API
        priceInfo: JSON.stringify(values.priceInfo),
        availability: JSON.stringify(values.availability),
        customFields: values.customFields
      };
      
      // Create the service
      const response = await axios.post('/api/services', serviceData);
      
      setSuccess('Service created successfully!');
      resetForm();
      setImageFiles([]);
      setImageUrls([]);
      
      // Navigate to the new service page
      navigate(`/services/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err.response?.data?.message || 'Failed to create service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/services')}
        sx={{ mb: 2 }}
      >
        Back to Services
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Service
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Fill out the form below to create a new service listing. Fields marked with * are required.
        </Typography>

        <Formik
          initialValues={{
            title: '',
            description: '',
            category: '',
            subCategory: '',
            tags: [],
            priceInfo: {
              type: 'fixed',
              fixedPrice: '',
              hourlyRate: '',
              minPrice: '',
              maxPrice: '',
              customDescription: ''
            },
            availability: {
              days: [],
              timeSlots: [],
              notes: ''
            },
            customFields: {}
          }}
          validationSchema={ServiceSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="title"
                    label="Service Title*"
                    fullWidth
                    variant="outlined"
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="description"
                    label="Description*"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                    <InputLabel id="category-label">Category*</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={values.category}
                      label="Category*"
                      onChange={(e) => handleCategoryChange(e.target.value, setFieldValue)}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="">Select a category</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.category && errors.category && (
                      <FormHelperText>{errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!values.category || subCategories.length === 0}>
                    <InputLabel id="subcategory-label">Subcategory</InputLabel>
                    <Select
                      labelId="subcategory-label"
                      name="subCategory"
                      value={values.subCategory}
                      label="Subcategory"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="">Select a subcategory</MenuItem>
                      {subCategories.map((subCategory) => (
                        <MenuItem key={subCategory._id} value={subCategory._id}>
                          {subCategory.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags*
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      label="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(values, setFieldValue);
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddTag(values, setFieldValue)}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {values.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(index, values, setFieldValue)}
                      />
                    ))}
                  </Box>
                  {touched.tags && errors.tags && (
                    <FormHelperText error>{errors.tags}</FormHelperText>
                  )}
                </Grid>

                {/* Pricing Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Pricing Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="price-type-label">Price Type*</InputLabel>
                    <Select
                      labelId="price-type-label"
                      name="priceInfo.type"
                      value={values.priceInfo.type}
                      label="Price Type*"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="fixed">Fixed Price</MenuItem>
                      <MenuItem value="hourly">Hourly Rate</MenuItem>
                      <MenuItem value="range">Price Range</MenuItem>
                      <MenuItem value="custom">Custom Pricing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {values.priceInfo.type === 'fixed' && (
                    <Field
                      as={TextField}
                      name="priceInfo.fixedPrice"
                      label="Fixed Price (₹)*"
                      type="number"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      error={touched.priceInfo?.fixedPrice && Boolean(errors.priceInfo?.fixedPrice)}
                      helperText={touched.priceInfo?.fixedPrice && errors.priceInfo?.fixedPrice}
                    />
                  )}

                  {values.priceInfo.type === 'hourly' && (
                    <Field
                      as={TextField}
                      name="priceInfo.hourlyRate"
                      label="Hourly Rate (₹)*"
                      type="number"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      error={touched.priceInfo?.hourlyRate && Boolean(errors.priceInfo?.hourlyRate)}
                      helperText={touched.priceInfo?.hourlyRate && errors.priceInfo?.hourlyRate}
                    />
                  )}

                  {values.priceInfo.type === 'range' && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Field
                          as={TextField}
                          name="priceInfo.minPrice"
                          label="Minimum Price (₹)*"
                          type="number"
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={touched.priceInfo?.minPrice && Boolean(errors.priceInfo?.minPrice)}
                          helperText={touched.priceInfo?.minPrice && errors.priceInfo?.minPrice}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field
                          as={TextField}
                          name="priceInfo.maxPrice"
                          label="Maximum Price (₹)*"
                          type="number"
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={touched.priceInfo?.maxPrice && Boolean(errors.priceInfo?.maxPrice)}
                          helperText={touched.priceInfo?.maxPrice && errors.priceInfo?.maxPrice}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {values.priceInfo.type === 'custom' && (
                    <Field
                      as={TextField}
                      name="priceInfo.customDescription"
                      label="Custom Price Description*"
                      fullWidth
                      variant="outlined"
                      error={touched.priceInfo?.customDescription && Boolean(errors.priceInfo?.customDescription)}
                      helperText={touched.priceInfo?.customDescription && errors.priceInfo?.customDescription}
                    />
                  )}
                </Grid>

                {/* Availability */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Availability
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.availability?.days && Boolean(errors.availability?.days)}>
                    <InputLabel id="days-label">Available Days*</InputLabel>
                    <Select
                      labelId="days-label"
                      multiple
                      name="availability.days"
                      value={values.availability.days}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      input={<OutlinedInput label="Available Days*" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {daysOfWeek.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.availability?.days && errors.availability?.days && (
                      <FormHelperText>{errors.availability.days}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.availability?.timeSlots && Boolean(errors.availability?.timeSlots)}>
                    <InputLabel id="time-slots-label">Available Time Slots*</InputLabel>
                    <Select
                      labelId="time-slots-label"
                      multiple
                      name="availability.timeSlots"
                      value={values.availability.timeSlots}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      input={<OutlinedInput label="Available Time Slots*" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>
                          {slot}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.availability?.timeSlots && errors.availability?.timeSlots && (
                      <FormHelperText>{errors.availability.timeSlots}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="availability.notes"
                    label="Availability Notes"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="Add any additional notes about your availability"
                  />
                </Grid>

                {/* Images */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Service Images
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Images
                    <input
                      type="file"
                      hidden
                      accept="image/png, image/jpeg, image/jpg"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    You can upload up to 5 images (JPEG, PNG, JPG). Max size: 5MB per image.
                  </Typography>

                  <Grid container spacing={2}>
                    {imageUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: 150,
                            width: '100%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            '& img': {
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }
                          }}
                        >
                          <img src={url} alt={`Preview ${index}`} />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)'
                              }
                            }}
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Category-specific fields */}
                {categoryFields.length > 0 && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Additional Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    {categoryFields.map((field) => (
                      <Grid item xs={12} sm={6} key={field.name}>
                        {field.type === 'text' && (
                          <TextField
                            name={`customFields.${field.name}`}
                            label={`${field.label}${field.required ? '*' : ''}`}
                            fullWidth
                            variant="outlined"
                            value={values.customFields[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            helperText={field.helpText}
                          />
                        )}

                        {field.type === 'textarea' && (
                          <TextField
                            name={`customFields.${field.name}`}
                            label={`${field.label}${field.required ? '*' : ''}`}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            value={values.customFields[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            helperText={field.helpText}
                          />
                        )}

                        {field.type === 'select' && (
                          <FormControl fullWidth required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              name={`customFields.${field.name}`}
                              label={field.label}
                              value={values.customFields[field.name] || ''}
                              onChange={handleChange}
                            >
                              {field.options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {field.helpText && (
                              <FormHelperText>{field.helpText}</FormHelperText>
                            )}
                          </FormControl>
                        )}

                        {/* Add more field types as needed */}
                      </Grid>
                    ))}
                  </>
                )}

                {/* Submit Button */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={submitting || uploadingImages || !isValid}
                    sx={{ mr: 2 }}
                  >
                    {(submitting || uploadingImages) ? <CircularProgress size={24} /> : 'Create Service'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/services')}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default CreateService;