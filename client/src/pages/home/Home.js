import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Restaurant as RestaurantIcon,
  Spa as SpaIcon,
  Brush as BrushIcon,
  LocalShipping as LocalShippingIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

const Home = () => {
  const categories = [
    {
      title: 'Home Services',
      icon: <HomeIcon fontSize="large" color="primary" />,
      description: 'Find handymen, cleaners, pet sitters, and more within your community.'
    },
    {
      title: 'Skills & Education',
      icon: <SchoolIcon fontSize="large" color="primary" />,
      description: 'Discover tutors, language teachers, and instructors living nearby.'
    },
    {
      title: 'Food & Culinary',
      icon: <RestaurantIcon fontSize="large" color="primary" />,
      description: 'Order home-cooked meals, baked goods, and catering from neighbors.'
    },
    {
      title: 'Personal Care',
      icon: <SpaIcon fontSize="large" color="primary" />,
      description: 'Book haircuts, beauty services, and wellness treatments locally.'
    },
    {
      title: 'Creative & Craft',
      icon: <BrushIcon fontSize="large" color="primary" />,
      description: 'Commission artwork, photography, and handmade items from local creators.'
    },
    {
      title: 'Errands & Logistics',
      icon: <LocalShippingIcon fontSize="large" color="primary" />,
      description: 'Get help with grocery shopping, deliveries, and local errands.'
    },
    {
      title: 'Professional Services',
      icon: <ComputerIcon fontSize="large" color="primary" />,
      description: 'Access tech support, accounting help, and writing services nearby.'
    }
  ];

  const features = [
    {
      title: 'Hyper-Local Focus',
      description: 'All services are offered within your specific residential community, ensuring convenience and building neighborhood connections.'
    },
    {
      title: 'Trust & Verification',
      description: 'Every user is verified as a resident of your community, creating a trusted environment for service exchange.'
    },
    {
      title: 'Community Reviews',
      description: 'Read and leave reviews for service providers from fellow community members to make informed decisions.'
    },
    {
      title: 'No Platform Payments',
      description: 'Pay service providers directly using your preferred payment method - no platform fees or commissions.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box className="home-hero">
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Discover Services Within Your Community
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Connect with trusted service providers who live in your neighborhood.
            From home repairs to tutoring, find the help you need just doors away.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ mr: 2 }}
            >
              Join Your Community
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/services"
            >
              Browse Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container className="home-section">
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <Typography variant="h4" component="h3" gutterBottom>
                1. Join
              </Typography>
              <Typography variant="body1" paragraph>
                Sign up and verify your residency in your community. Browse available services or create a provider profile.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <Typography variant="h4" component="h3" gutterBottom>
                2. Connect
              </Typography>
              <Typography variant="body1" paragraph>
                Discover service providers in your community. Contact them directly through the platform to discuss your needs.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <Typography variant="h4" component="h3" gutterBottom>
                3. Review
              </Typography>
              <Typography variant="body1" paragraph>
                After using a service, leave a review to help others in your community make informed decisions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Service Categories Section */}
      <Box sx={{ bgcolor: '#f5f5f5' }} className="home-section">
        <Container>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Service Categories
          </Typography>
          <Divider sx={{ mb: 6 }} />

          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                    <Box sx={{ mb: 2 }}>{category.icon}</Box>
                    <Typography gutterBottom variant="h5" component="h3">
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button size="small" color="primary">
                      Explore
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container className="home-section">
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Platform Features
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#e3f2fd', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Connect With Your Community?
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Join today and discover the services available in your neighborhood.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;