import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Paper, Grid, Avatar, Button, TextField, Box, Divider, Chip } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: ''
  });

  useEffect(() => {
    // In a real application, you would fetch the user profile from the backend
    // For now, we'll simulate this with the current user data
    if (currentUser) {
      const mockProfile = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        bio: 'Community enthusiast and service provider',
        location: 'New York, NY',
        phone: '(555) 123-4567',
        memberSince: new Date(currentUser.createdAt).toLocaleDateString(),
        role: currentUser.role,
        avatar: 'https://via.placeholder.com/150'
      };
      
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        bio: mockProfile.bio,
        location: mockProfile.location,
        phone: mockProfile.phone
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real application, you would update the profile via API
    // For now, we'll just update the local state
    setProfile(prev => ({
      ...prev,
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      phone: formData.phone
    }));
    setEditing(false);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <Typography variant="h5" color="error">Please log in to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profile.avatar}
              alt={profile.name}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>{profile.name}</Typography>
            <Chip label={profile.role} color="primary" sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Member since {profile.memberSince}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {editing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" variant="contained">Save Changes</Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4">Profile Information</Typography>
                  <Button variant="outlined" onClick={() => setEditing(true)}>Edit Profile</Button>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{profile.email}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="textSecondary">Bio</Typography>
                    <Typography variant="body1">{profile.bio}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="textSecondary">Location</Typography>
                    <Typography variant="body1">{profile.location}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">{profile.phone}</Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Additional sections could be added here, such as:
      - Services offered (for providers)
      - Booking history
      - Reviews received
      - Account settings
      */}
    </Container>
  );
};

export default Profile;