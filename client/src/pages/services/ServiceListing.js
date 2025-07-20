import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertContext } from '../../contexts/AlertContext';
import axios from 'axios';

const ServiceListing = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { setError } = useContext(AlertContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // State for services and filters
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedCommunity, setSelectedCommunity] = useState(queryParams.get('community') || '');
  const [selectedBuilding, setSelectedBuilding] = useState(queryParams.get('building') || '');
  const [minRating, setMinRating] = useState(queryParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [limit] = useState(9);

  // Fetch services, categories, and communities
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await axios.get('/api/categories');
        setCategories(categoriesRes.data.data);

        // Fetch communities
        const communitiesRes = await axios.get('/api/communities');
        setCommunities(communitiesRes.data.data);

        // Build query parameters for services
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCommunity) params.append('community', selectedCommunity);
        if (selectedBuilding) params.append('building', selectedBuilding);
        if (minRating) params.append('rating', minRating);
        if (sortBy) params.append('sort', sortBy);

        // Fetch services with filters
        const servicesRes = await axios.get(`/api/services?${params.toString()}`);
        setServices(servicesRes.data.data);
        setTotalPages(Math.ceil(servicesRes.data.total / limit));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, searchQuery, selectedCategory, selectedCommunity, selectedBuilding, minRating, sortBy, setError]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedCommunity) params.append('community', selectedCommunity);
    if (selectedBuilding) params.append('building', selectedBuilding);
    if (minRating) params.append('rating', minRating);
    if (sortBy) params.append('sort', sortBy);
    if (page > 1) params.append('page', page);

    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [searchQuery, selectedCategory, selectedCommunity, selectedBuilding, minRating, sortBy, page, navigate, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCommunity('');
    setSelectedBuilding('');
    setMinRating('');
    setSortBy('newest');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover trusted service providers in your community
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="reviews">Most Reviewed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1 }}
              >
                Filters
              </Button>
              <Button
                variant="contained"
                type="submit"
              >
                Search
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="community-label">Community</InputLabel>
                    <Select
                      labelId="community-label"
                      value={selectedCommunity}
                      label="Community"
                      onChange={(e) => {
                        setSelectedCommunity(e.target.value);
                        setSelectedBuilding('');
                      }}
                    >
                      <MenuItem value="">All Communities</MenuItem>
                      {communities.map((community) => (
                        <MenuItem key={community._id} value={community._id}>
                          {community.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="building-label">Building/Block</InputLabel>
                    <Select
                      labelId="building-label"
                      value={selectedBuilding}
                      label="Building/Block"
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      disabled={!selectedCommunity}
                    >
                      <MenuItem value="">All Buildings</MenuItem>
                      {selectedCommunity && communities.find(c => c._id === selectedCommunity)?.buildings?.map((building) => (
                        <MenuItem key={building} value={building}>
                          {building}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="rating-label">Minimum Rating</InputLabel>
                    <Select
                      labelId="rating-label"
                      value={minRating}
                      label="Minimum Rating"
                      onChange={(e) => setMinRating(e.target.value)}
                    >
                      <MenuItem value="">Any Rating</MenuItem>
                      <MenuItem value="4">4+ Stars</MenuItem>
                      <MenuItem value="3">3+ Stars</MenuItem>
                      <MenuItem value="2">2+ Stars</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Paper>

      {/* Active Filters */}
      {(searchQuery || selectedCategory || selectedCommunity || selectedBuilding || minRating) && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {searchQuery && (
            <Chip
              label={`Search: ${searchQuery}`}
              onDelete={() => setSearchQuery('')}
            />
          )}
          {selectedCategory && (
            <Chip
              label={`Category: ${categories.find(c => c._id === selectedCategory)?.name || 'Selected'}`}
              onDelete={() => setSelectedCategory('')}
            />
          )}
          {selectedCommunity && (
            <Chip
              label={`Community: ${communities.find(c => c._id === selectedCommunity)?.name || 'Selected'}`}
              onDelete={() => setSelectedCommunity('')}
            />
          )}
          {selectedBuilding && (
            <Chip
              label={`Building: ${selectedBuilding}`}
              onDelete={() => setSelectedBuilding('')}
            />
          )}
          {minRating && (
            <Chip
              label={`${minRating}+ Stars`}
              onDelete={() => setMinRating('')}
              icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
            />
          )}
        </Box>
      )}

      {/* Services Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : services.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card 
                  className="service-card"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => navigate(`/services/${service._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap sx={{ maxWidth: '70%' }}>
                        {service.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={service.averageRating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          ({service.reviewCount || 0})
                        </Typography>
                      </Box>
                    </Box>

                    <Chip 
                      size="small" 
                      label={service.category?.name || 'Uncategorized'} 
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {service.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {service.provider?.building || service.community?.name || 'Local'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No services found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search filters or check back later for new services.
          </Typography>
          {isAuthenticated && user?.role === 'provider' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/services/create')}
              sx={{ mt: 2 }}
            >
              Create a Service
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ServiceListing;