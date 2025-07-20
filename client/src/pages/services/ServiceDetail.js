import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Avatar,
  Chip,
  Rating,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertContext } from '../../contexts/AlertContext';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Review form validation schema
const ReviewSchema = Yup.object().shape({
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Please select a rating'),
  comment: Yup.string()
    .required('Comment is required')
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must not exceed 500 characters')
});

const ServiceDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { setError, setSuccess, setInfo } = useContext(AlertContext);
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        // Fetch service details
        const serviceRes = await axios.get(`/api/services/${id}`);
        setService(serviceRes.data.data);

        // Fetch reviews for this service
        const reviewsRes = await axios.get(`/api/reviews?service=${id}`);
        setReviews(reviewsRes.data.data);

        // Check if user has already reviewed this service
        if (isAuthenticated && user) {
          const userReviewRes = await axios.get(`/api/reviews?service=${id}&customer=${user._id}`);
          if (userReviewRes.data.data.length > 0) {
            setUserReview(userReviewRes.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again.');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id, isAuthenticated, user, setError, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReviewSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (userReview) {
        // Update existing review
        await axios.put(`/api/reviews/${userReview._id}`, values);
        setSuccess('Your review has been updated!');
      } else {
        // Create new review
        await axios.post('/api/reviews', {
          ...values,
          service: id
        });
        setSuccess('Your review has been submitted!');
      }

      // Refresh reviews
      const reviewsRes = await axios.get(`/api/reviews?service=${id}`);
      setReviews(reviewsRes.data.data);

      // Refresh service to update average rating
      const serviceRes = await axios.get(`/api/services/${id}`);
      setService(serviceRes.data.data);

      // Check if user review exists now
      const userReviewRes = await axios.get(`/api/reviews?service=${id}&customer=${user._id}`);
      if (userReviewRes.data.data.length > 0) {
        setUserReview(userReviewRes.data.data[0]);
      }

      resetForm();
      setReviewDialogOpen(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportReview = async () => {
    if (!reportReviewId || !reportReason) return;

    try {
      await axios.post(`/api/reviews/${reportReviewId}/report`, {
        reason: reportReason
      });
      setSuccess('Review has been reported. Thank you for your feedback.');
      setReportDialogOpen(false);
      setReportReviewId(null);
      setReportReason('');
    } catch (err) {
      console.error('Error reporting review:', err);
      setError('Failed to report review. Please try again.');
    }
  };

  const handleContactProvider = () => {
    if (!isAuthenticated) {
      setInfo('Please log in to contact the service provider.');
      navigate('/login');
      return;
    }
    setContactDialogOpen(true);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!service) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Service not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/services')}
          sx={{ mt: 2 }}
        >
          Back to Services
        </Button>
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

      <Grid container spacing={3}>
        {/* Service Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            {/* Service Image */}
            <Box
              sx={{
                height: { xs: 200, md: 300 },
                width: '100%',
                position: 'relative',
                backgroundImage: `url(${service.images?.[0] || 'https://via.placeholder.com/800x300?text=No+Image'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
                }}
              >
                <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
                  {service.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating
                    value={service.averageRating || 0}
                    precision={0.5}
                    readOnly
                    sx={{ color: 'white' }}
                  />
                  <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>
                    {service.averageRating?.toFixed(1) || 'No ratings'} ({service.reviewCount || 0} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="service tabs"
                variant="fullWidth"
              >
                <Tab label="Description" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>

            {/* Description Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                About This Service
              </Typography>
              <Typography variant="body1" paragraph>
                {service.description}
              </Typography>

              {service.tags && service.tags.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {service.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Price Information */}
              {service.priceInfo && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pricing
                  </Typography>
                  <Grid container spacing={2}>
                    {service.priceInfo.type === 'fixed' && (
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Fixed Price:</strong> ₹{service.priceInfo.fixedPrice}
                        </Typography>
                      </Grid>
                    )}

                    {service.priceInfo.type === 'hourly' && (
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Hourly Rate:</strong> ₹{service.priceInfo.hourlyRate} per hour
                        </Typography>
                      </Grid>
                    )}

                    {service.priceInfo.type === 'range' && (
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Price Range:</strong> ₹{service.priceInfo.minPrice} - ₹{service.priceInfo.maxPrice}
                        </Typography>
                      </Grid>
                    )}

                    {service.priceInfo.type === 'custom' && (
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Custom Pricing:</strong> {service.priceInfo.customDescription}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Availability */}
              {service.availability && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Availability
                  </Typography>
                  <Grid container spacing={2}>
                    {service.availability.days && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Days:</strong> {service.availability.days.join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {service.availability.timeSlots && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Hours:</strong> {service.availability.timeSlots.join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {service.availability.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Notes:</strong> {service.availability.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Custom Fields */}
              {service.customFields && Object.keys(service.customFields).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(service.customFields).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography variant="body1">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Reviews ({reviews.length})
                </Typography>
                {isAuthenticated && user?.role === 'customer' && (
                  <Button
                    variant="contained"
                    onClick={() => setReviewDialogOpen(true)}
                  >
                    {userReview ? 'Edit Your Review' : 'Write a Review'}
                  </Button>
                )}
              </Box>

              {reviews.length > 0 ? (
                <List>
                  {reviews.map((review) => (
                    <Paper key={review._id} sx={{ mb: 3, p: 2 }}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar>
                            {review.customer?.firstName?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography component="span" variant="subtitle1">
                                  {review.customer?.firstName} {review.customer?.lastName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Rating value={review.rating} readOnly size="small" />
                                  <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              {isAuthenticated && review.customer?._id !== user?._id && (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setReportReviewId(review._id);
                                    setReportDialogOpen(true);
                                  }}
                                  title="Report review"
                                >
                                  <FlagIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body1"
                                color="text.primary"
                                sx={{ display: 'block', mt: 1 }}
                              >
                                {review.comment}
                              </Typography>
                              {review.serviceDate && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  Service Date: {new Date(review.serviceDate).toLocaleDateString()}
                                </Typography>
                              )}
                              {review.providerResponse && (
                                <Box sx={{ mt: 2, ml: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                  <Typography variant="subtitle2">
                                    Response from Provider:
                                  </Typography>
                                  <Typography variant="body2">
                                    {review.providerResponse}
                                  </Typography>
                                </Box>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review this service!
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* Provider Info Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Service Provider
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 60, height: 60, mr: 2 }}
              >
                {service.provider?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {service.provider?.firstName} {service.provider?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(service.provider?.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                {service.provider?.building ? `${service.provider.building}, ` : ''}
                {service.community?.name}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleContactProvider}
              sx={{ mb: 2 }}
            >
              Contact Provider
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              Note: All payments are handled directly between you and the service provider. The platform does not process any payments.
            </Typography>
          </Paper>

          {/* Category Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip label={service.category?.name} />
              </Box>
              {service.subCategory && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subcategory: {service.subCategory.name}
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                {service.category?.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Community Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Community
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1">
                {service.community?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service.community?.address?.city}, {service.community?.address?.state}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userReview ? 'Edit Your Review' : 'Write a Review'}
          <IconButton
            aria-label="close"
            onClick={() => setReviewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik
          initialValues={{
            rating: userReview?.rating || 0,
            comment: userReview?.comment || '',
            serviceDate: userReview?.serviceDate ? new Date(userReview.serviceDate).toISOString().split('T')[0] : ''
          }}
          validationSchema={ReviewSchema}
          onSubmit={handleReviewSubmit}
        >
          {({ errors, touched, values, handleChange, setFieldValue, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom>
                  {service.title}
                </Typography>

                <Box sx={{ mb: 3, mt: 2 }}>
                  <Typography component="legend">Your Rating*</Typography>
                  <Rating
                    name="rating"
                    value={values.rating}
                    onChange={(event, newValue) => {
                      setFieldValue('rating', newValue);
                    }}
                    size="large"
                  />
                  {touched.rating && errors.rating && (
                    <Typography color="error" variant="caption">
                      {errors.rating}
                    </Typography>
                  )}
                </Box>

                <Field
                  as={TextField}
                  name="comment"
                  label="Your Review*"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  error={touched.comment && Boolean(errors.comment)}
                  helperText={touched.comment && errors.comment}
                />

                <TextField
                  name="serviceDate"
                  label="Service Date (Optional)"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={values.serviceDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 3 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : (userReview ? 'Update Review' : 'Submit Review')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Report Review Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report Review
          <IconButton
            aria-label="close"
            onClick={() => setReportDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            Please provide a reason for reporting this review. Our team will review your report and take appropriate action.
          </Typography>
          <TextField
            label="Reason for reporting"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReportReview}
            disabled={!reportReason}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Provider Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Contact {service.provider?.firstName} {service.provider?.lastName}
          <IconButton
            aria-label="close"
            onClick={() => setContactDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            You can contact the service provider using the following information:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
              Phone
            </Typography>
            <Typography variant="body1">
              {service.provider?.phone || 'Not provided'}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              Email
            </Typography>
            <Typography variant="body1">
              {service.provider?.email || 'Not provided'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Remember: All payments and service arrangements are made directly between you and the service provider.
            The Community Connector platform does not handle payments or guarantee services.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceDetail;