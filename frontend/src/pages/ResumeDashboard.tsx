import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  useTheme,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  FileCopy as DuplicateIcon,
  Home as HomeIcon,
  Description as TemplateIcon,
  AccessTime as RecentIcon,
  Star as FavoriteIcon,
  StarBorder as UnfavoriteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/authContext';
import { resumeService } from '../services/api';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

interface Resume {
  _id: string;
  name: string;
  template: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    location?: string;
    phone?: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationYear?: string;
  }>;
  skills: string[];
  createdAt: string;
  updatedAt?: string;
  favorite?: boolean;
}

const LoggedIn = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return { isLoggedIn };
};

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn } = LoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (error) {
      toast.error('Failed to fetch resumes');
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resumeService.deleteResume(id);
      setResumes(resumes.filter(resume => resume._id !== id));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
      console.error('Error deleting resume:', error);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedResumeId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedResumeId(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const resumeToDuplicate = resumes.find(resume => resume._id === id);
      if (!resumeToDuplicate) return;
      
      
      const newResume = {
        ...resumeToDuplicate,
        _id: `temp-${Date.now()}`,
        name: `${resumeToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      
      setResumes([...resumes, newResume]);
      toast.success('Resume duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate resume');
    } finally {
      handleCloseMenu();
    }
  };

  const handleToggleFavorite = (id: string) => {
    setResumes(resumes.map(resume => 
      resume._id === id ? { ...resume, favorite: !resume.favorite } : resume
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFilteredResumes = () => {
    let filtered = [...resumes];
    
    // Filter by tab
    if (tabValue === 1) {
      filtered = filtered.filter(resume => resume.favorite);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resume => 
        resume.name.toLowerCase().includes(query) ||
        resume.personalInfo.firstName.toLowerCase().includes(query) ||
        resume.personalInfo.lastName.toLowerCase().includes(query) ||
        resume.template.toLowerCase().includes(query) ||
        resume.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }
    
    // Sort by most recent first
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleDownload = async (resumeId: string) => {
    try {
      const resume = await resumeService.getResumeById(resumeId);
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
          <h1 style="text-align: center; margin-bottom: 20px;">${resume.personalInfo.firstName} ${resume.personalInfo.lastName}</h1>
          <div style="text-align: center; margin-bottom: 20px;">
            <p>${resume.personalInfo.email} | ${resume.personalInfo.phone || ''} | ${resume.personalInfo.location || ''}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h2>Professional Summary</h2>
            <p>${resume.personalInfo.summary || ''}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h2>Experience</h2>
            ${resume.experience.map(exp => `
              <div style="margin-bottom: 10px;">
                <h3>${exp.position} at ${exp.company}</h3>
                <p>${exp.startDate} - ${exp.endDate}</p>
                <p>${exp.description}</p>
              </div>
            `).join('')}
          </div>
          <div style="margin-bottom: 20px;">
            <h2>Education</h2>
            ${resume.education.map(edu => `
              <div style="margin-bottom: 10px;">
                <h3>${edu.institution}</h3>
                <p>${edu.degree} in ${edu.field}</p>
                <p>${edu.startDate} - ${edu.endDate}</p>
                ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
              </div>
            `).join('')}
          </div>
          <div>
            <h2>Skills</h2>
            <p>${resume.skills.join(', ')}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 0.4,
        filename: `${resume.name || `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume`}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredResumes = getFilteredResumes();

  const renderResumePreview = (resume: Resume) => {

    const hasExperience = resume.experience && resume.experience.length > 0;
    const hasEducation = resume.education && resume.education.length > 0;
    
    return (
      <Box sx={{ 
        pt: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 2
        }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {getInitials(resume.personalInfo.firstName, resume.personalInfo.lastName)}
          </Avatar>
        </Box>
        
        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
          {resume.personalInfo.firstName} {resume.personalInfo.lastName}
        </Typography>
        
        {hasExperience && (
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
            {resume.experience[0].position}
          </Typography>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ flexGrow: 1 }}>
          {hasExperience && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Experience
              </Typography>
              {resume.experience.slice(0, 2).map((exp, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {exp.company} · {exp.position}
                </Typography>
              ))}
              {resume.experience.length > 2 && (
                <Typography variant="body2" color="text.secondary">
                  +{resume.experience.length - 2} more
                </Typography>
              )}
            </Box>
          )}
          
          {hasEducation && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Education
              </Typography>
              {resume.education.slice(0, 1).map((edu, index) => (
                <Typography key={index} variant="body2">
                  {edu.institution} · {edu.degree}
                </Typography>
              ))}
            </Box>
          )}
          
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {resume.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
              {resume.skills.length > 3 && (
                <Chip
                  label={`+${resume.skills.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          My Resumes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            Home
          </Button>
          </Link>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/resume-builder')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            Create New Resume
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<RecentIcon fontSize="small" />} 
            iconPosition="start"
            label="All Resumes" 
          />
          <Tab 
            icon={<FavoriteIcon fontSize="small" />} 
            iconPosition="start"
            label="Favorites" 
          />
        </Tabs>
      </Box>

      {filteredResumes.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tabValue === 0 ? 'No resumes found' : 'No favorite resumes'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tabValue === 0 
              ? 'Create your first resume to get started' 
              : 'Mark resumes as favorites to see them here'}
          </Typography>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/resume-builder')}
              sx={{ mt: 2 }}
            >
              Create Resume
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredResumes.map((resume) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={resume._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  display: 'flex',
                  gap: 1
                }}>
                  <IconButton 
                    size="small"
                    onClick={() => handleToggleFavorite(resume._id)}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                  >
                    {resume.favorite ? (
                      <FavoriteIcon fontSize="small" color="primary" />
                    ) : (
                      <UnfavoriteIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleOpenMenu(e, resume._id)}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box 
                  sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    p: 2,
                    position: 'relative',
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {resume.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TemplateIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {resume.template} Template
                    </Typography>
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, px: 2, pt: 0 }}>
                  {renderResumePreview(resume)}
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Updated {formatDate(resume.updatedAt || resume.createdAt)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/resume-builder/${resume._id}`)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton size="small" onClick={() => handleDownload(resume._id)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => navigate(`/resume-builder/${selectedResumeId}`)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleDuplicate(selectedResumeId)}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { 
          if (selectedResumeId) {
            handleDelete(selectedResumeId);
            handleCloseMenu();
          }
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ResumeDashboard;