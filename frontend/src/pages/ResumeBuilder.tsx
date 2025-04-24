import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import FadeIn from "@/components/animations/FadeIn";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Menu as MenuIcon,
  NightsStay as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import { ResumeData, TemplateType } from "../utils/resume";
import { useAuth } from "../contexts/authContext";
import { resumeService } from '../services/api';
import { toast } from 'react-hot-toast';

const ResumeBuilder = () => {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("modern");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(!!id);
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const data = await resumeService.getResumeById(id!);
      setResumeData({
        personalInfo: data.personalInfo,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        projects: data.projects || [],
      });
      setSelectedTemplate(data.template);
      setResumeName(data.name);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#dc004e",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: "box-shadow 0.3s ease-in-out",
          },
        },
      },
    },
  });

  const handleResumeDataChange = (newData: ResumeData) => {
    setResumeData(newData);
  };

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box role="presentation" sx={{ width: 250 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DescriptionIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Resume Builder
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem onClick={toggleDarkMode}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItem>
      </List>
    </Box>
  );

  const mainContent = (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          mt: "64px",
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              mb: 4,
              fontWeight: "bold",
              display: { xs: "none", md: "block" },
            }}
          >
            Professional Resume Builder
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                flex: { xs: "1 1 auto", md: "1 1 50%" },
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 8,
                },
              }}
            >
              <ResumeForm
                data={resumeData}
                onDataChange={handleResumeDataChange}
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />
            </Paper>

            <Box
              sx={{
                flex: { xs: "1 1 auto", md: "1 1 50%" },
                display: {
                  xs: isMobile && mobileOpen ? "none" : "block",
                  md: "block",
                },
              }}
            >
              <ResumePreview
                data={resumeData}
                selectedTemplate={selectedTemplate}
                resumeName={resumeName}
                onResumeNameChange={setResumeName}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Resume Builder
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: 250,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resume Builder
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Personal Info" />
                </ListItem>
                <ListItem onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText primary="Experience" />
                </ListItem>
                <ListItem onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText primary="Education" />
                </ListItem>
                <ListItem onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <PsychologyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Skills" />
                </ListItem>
              </List>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 0,
              width: { sm: `calc(100% - ${250}px)` },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              overflow: "hidden",
            }}
          >
            {/* Form Section */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                height: "calc(100vh - 64px)",
                borderRight: { md: 1 },
                borderColor: "divider",
                p: { xs: 1, sm: 2 },
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <ResumeForm
                data={resumeData}
                onDataChange={handleResumeDataChange}
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />
            </Box>

            {/* Preview Section */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                height: "calc(100vh - 64px)",
                p: { xs: 1, sm: 2 },
                display: { xs: "none", md: "block" },
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <ResumePreview
                data={resumeData}
                selectedTemplate={selectedTemplate}
                resumeName={resumeName}
                onResumeNameChange={setResumeName}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ResumeBuilder;
