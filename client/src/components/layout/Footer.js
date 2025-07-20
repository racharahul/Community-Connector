import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Community Connector
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connecting residents with local service providers within your community.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link
              component={RouterLink}
              to="/"
              className="footer-link"
              display="block"
              sx={{ mb: 1 }}
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to="/services"
              className="footer-link"
              display="block"
              sx={{ mb: 1 }}
            >
              Services
            </Link>
            <Link
              component={RouterLink}
              to="/login"
              className="footer-link"
              display="block"
              sx={{ mb: 1 }}
            >
              Login
            </Link>
            <Link
              component={RouterLink}
              to="/register"
              className="footer-link"
              display="block"
              sx={{ mb: 1 }}
            >
              Register
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Service Categories
            </Typography>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Home Services
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Skills & Education
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Food & Culinary
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Personal Care
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Creative & Craft
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Help Center
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link href="#" className="footer-link" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Typography variant="body2" align="center" sx={{ pt: 2, pb: 2 }}>
          © {currentYear} Community Connector. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;