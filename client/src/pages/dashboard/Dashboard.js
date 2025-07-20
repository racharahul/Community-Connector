import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Star as StarIcon,
  Payment as PaymentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertContext } from '../../contexts/AlertContext';
import axios from 'axios';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { setError } = useContext(AlertContext);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) return;

      setLoading(true);
      try {
        // Fetch services based on user role
        const servicesRes = user.role === 'provider'
          ? await axios.get('/api/services/provider')
          : await axios.get('/api/services?limit=5');
        setServices(servicesRes.data.data);

        // Fetch reviews
        const reviewsRes = user.role === 'provider'
          ? await axios.get('/api/reviews?provider=true')
          : await axios.get('/api/reviews?customer=true');
        setReviews(reviewsRes.data.data);

        // Fetch subscription if provider
        if (user.role === 'provider') {
          try {
            const subscriptionRes = await axios.get('/api/subscriptions/me');
            setSubscription(subscriptionRes.data.data);
          } catch (err) {
            // It's okay if there's no subscription yet
            console.log('No active subscription found');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, navigate, authLoading, setError]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (authLoading || !user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.firstName}!
            </Typography>
            <Typography variant="body1">
              {user.role === 'provider'
                ? 'Manage your services, check your reviews, and track your subscription.'
                : 'Discover services in your community and manage your reviews.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Dashboard Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<HomeIcon />} label="Overview" />
              <Tab icon={<PersonIcon />} label="Profile" />
              {user.role === 'provider' && (
                <Tab icon={<PaymentIcon />} label="Subscription" />
              )}
              <Tab icon={<StarIcon />} label="Reviews" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Services Section */}
                <Grid item xs={12} md={user.role === 'provider' ? 12 : 6}>
                  <Typography variant="h6" gutterBottom>
                    {user.role === 'provider' ? 'Your Services' : 'Recent Services'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : services.length > 0 ? (
                    <List>
                      {services.slice(0, 5).map((service) => (
                        <Paper key={service._id} sx={{ mb: 2, p: 2 }}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{ px: 0 }}
                            button
                            onClick={() => navigate(`/services/${service._id}`)}
                          >
                            <ListItemAvatar>
                              <Avatar src={service.images?.[0]} alt={service.title}>
                                {service.title.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={service.title}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {service.category?.name}
                                  </Typography>
                                  {` — ${service.description.substring(0, 60)}...`}
                                </React.Fragment>
                              }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarIcon sx={{ color: 'gold', mr: 0.5 }} />
                              <Typography variant="body2">
                                {service.averageRating?.toFixed(1) || 'New'}
                              </Typography>
                            </Box>
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {user.role === 'provider'
                        ? 'You haven\'t created any services yet.'
                        : 'No services found in your community.'}
                    </Typography>
                  )}

                  {user.role === 'provider' && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/services/create')}
                      sx={{ mt: 2 }}
                    >
                      Create New Service
                    </Button>
                  )}
                </Grid>

                {/* Community Info Section - Only for customers */}
                {user.role === 'customer' && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Your Community
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">
                          {user.community?.name || 'Community information not available'}
                        </Typography>
                        {user.community && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {user.community.address?.street}, {user.community.address?.city}, {user.community.address?.state} {user.community.address?.postalCode}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                <strong>Type:</strong> {user.community.type}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Total Units:</strong> {user.community.totalUnits}
                              </Typography>
                              {user.community.amenities && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Amenities:</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {user.community.amenities.map((amenity, index) => (
                                      <Chip key={index} label={amenity} size="small" />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </>
                        )}
                      </Paper>
                    )}
                  </Grid>
                )}

                {/* Recent Reviews Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Recent Reviews
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : reviews.length > 0 ? (
                    <List>
                      {reviews.slice(0, 3).map((review) => (
                        <Paper key={review._id} sx={{ mb: 2, p: 2 }}>
                          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar>
                                {review.customer?.firstName?.charAt(0) || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body1"
                                    color="text.primary"
                                  >
                                    {review.service?.title || 'Service'}
                                  </Typography>
                                  <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        sx={{
                                          color: i < review.rating ? 'gold' : 'grey.300',
                                          fontSize: '1rem'
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </React.Fragment>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {review.customer?.firstName} {review.customer?.lastName} -
                                  </Typography>
                                  {` ${review.comment}`}
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No reviews yet.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {user.phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Role:</strong> {user.role === 'provider' ? 'Service Provider' : 'Customer'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/profile')}
                  >
                    Edit Profile
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Community Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {user.community ? (
                    <Box>
                      <Typography variant="body1">
                        <strong>Community:</strong> {user.community.name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Address:</strong> {user.community.address?.street}, {user.community.address?.city}, {user.community.address?.state} {user.community.address?.postalCode}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Type:</strong> {user.community.type}
                      </Typography>
                      {user.building && (
                        <Typography variant="body1">
                          <strong>Building/Block:</strong> {user.building}
                        </Typography>
                      )}
                      {user.unit && (
                        <Typography variant="body1">
                          <strong>Unit/Apartment:</strong> {user.unit}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Community information not available.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Subscription Tab - Only for providers */}
            {user.role === 'provider' && (
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Subscription Status
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : subscription ? (
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label={subscription.status}
                        color={subscription.status === 'active' ? 'success' : 'error'}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="h6">
                        {subscription.plan.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        ₹{subscription.amount} / {subscription.plan.billingCycle}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Started:</strong> {new Date(subscription.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Expires:</strong> {new Date(subscription.endDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Auto-Renewal:</strong> {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Payment Method:</strong> {subscription.paymentMethod}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Subscription ID:</strong> {subscription.paymentGateway.subscriptionId}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mr: 2 }}
                      >
                        Manage Subscription
                      </Button>
                      {subscription.status === 'active' && (
                        <Button
                          variant="outlined"
                          color="error"
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    <Typography variant="body1" paragraph>
                      You don't have an active subscription. Subscribe to list your services on the platform.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/subscription')}
                    >
                      Subscribe Now
                    </Button>
                  </Box>
                )}
              </TabPanel>
            )}

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={user.role === 'provider' ? 3 : 2}>
              <Typography variant="h6" gutterBottom>
                {user.role === 'provider' ? 'Reviews for Your Services' : 'Your Reviews'}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : reviews.length > 0 ? (
                <List>
                  {reviews.map((review) => (
                    <Paper key={review._id} sx={{ mb: 3, p: 2 }}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar>
                            {user.role === 'provider'
                              ? review.customer?.firstName?.charAt(0) || 'U'
                              : review.service?.title?.charAt(0) || 'S'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body1"
                                color="text.primary"
                              >
                                {user.role === 'provider'
                                  ? `${review.customer?.firstName} ${review.customer?.lastName}`
                                  : review.service?.title}
                              </Typography>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    sx={{
                                      color: i < review.rating ? 'gold' : 'grey.300',
                                      fontSize: '1rem'
                                    }}
                                  />
                                ))}
                              </Box>
                            </React.Fragment>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {user.role === 'provider'
                                  ? review.service?.title
                                  : `${review.service?.provider?.firstName} ${review.service?.provider?.lastName}`} -
                              </Typography>
                              {` ${review.comment}`}
                              {review.serviceDate && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  Service Date: {new Date(review.serviceDate).toLocaleDateString()}
                                </Typography>
                              )}
                              {review.providerResponse && (
                                <Box sx={{ mt: 1, ml: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Response:</strong> {review.providerResponse}
                                  </Typography>
                                </Box>
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {user.role === 'provider' && !review.providerResponse && (
                        <Box sx={{ mt: 1, ml: 9 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/reviews/${review._id}/respond`)}
                          >
                            Respond to Review
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {user.role === 'provider'
                    ? 'No reviews for your services yet.'
                    : 'You haven\'t left any reviews yet.'}
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;