import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  Zoom,
  FormHelperText,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  DragIndicator as DragIndicatorIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  TipsAndUpdates as TipsIcon,
} from "@mui/icons-material";
import { ResumeData, TemplateType } from "../utils/resume";

interface ResumeFormProps {
  data: ResumeData;
  onDataChange: (data: ResumeData) => void;
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

const ResumeForm = ({
  data,
  onDataChange,
  selectedTemplate,
  onTemplateChange,
}: ResumeFormProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | false>(
    "personal"
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [tips, setTips] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Tips for different sections
  const sectionTips = {
    personal: [
      "Use a professional email address",
      "Keep your summary concise and impactful",
      "Include your most relevant contact information",
      "Tailor your summary to match the job requirements",
    ],
    experience: [
      "Use action verbs to start bullet points",
      "Focus on achievements rather than responsibilities",
      "Include quantifiable results when possible",
      "Highlight experience relevant to the target position",
    ],
    education: [
      "List your most recent education first",
      "Include relevant coursework if applicable",
      "Add GPA only if it's impressive (3.5+)",
      "Emphasize education that aligns with job requirements",
    ],
    skills: [
      "Mix technical and soft skills",
      "Use industry-standard terminology",
      "Prioritize skills relevant to the job",
      "Include keywords from the job description",
    ],
    general: [
      "Customize your resume for each job application",
      "Use keywords from the job posting",
      "Highlight relevant experience and skills",
      "Keep formatting consistent and professional",
    ],
  };

  // Calculate form completion progress
  useEffect(() => {
    let completed = 0;
    let total = 0;

    // Personal Info
    total += 6;
    if (data.personalInfo.firstName) completed++;
    if (data.personalInfo.lastName) completed++;
    if (data.personalInfo.email) completed++;
    if (data.personalInfo.phone) completed++;
    if (data.personalInfo.location) completed++;
    if (data.personalInfo.summary) completed++;

    // Experience
    total += data.experience.length * 5;
    data.experience.forEach((exp) => {
      if (exp.company) completed++;
      if (exp.position) completed++;
      if (exp.startDate) completed++;
      if (exp.endDate) completed++;
      if (exp.description) completed++;
    });

    // Education
    total += data.education.length * 6;
    data.education.forEach((edu) => {
      if (edu.institution) completed++;
      if (edu.degree) completed++;
      if (edu.field) completed++;
      if (edu.startDate) completed++;
      if (edu.endDate) completed++;
      if (edu.gpa) completed++;
    });

    // Skills
    total += 1;
    if (data.skills.length > 0) completed++;

    setProgress((completed / total) * 100);
  }, [data]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "h":
            e.preventDefault();
            setHelpDialogOpen(true);
            break;
          case "k":
            e.preventDefault();
            setKeyboardShortcutsOpen(true);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Show tips based on active section
  useEffect(() => {
    if (expandedSection) {
      setTips(sectionTips[expandedSection as keyof typeof sectionTips] || []);
    }
  }, [expandedSection]);

  // Update activeStep based on expandedSection
  useEffect(() => {
    switch (expandedSection) {
      case "personal":
        setActiveStep(0);
        break;
      case "experience":
        setActiveStep(1);
        break;
      case "education":
        setActiveStep(2);
        break;
      case "skills":
        setActiveStep(3);
        break;
      default:
        setActiveStep(0);
    }
  }, [expandedSection]);

  const handleResumeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setResumeName(newName);
  };

  const handleSave = () => {
    setSnackbarMessage("Resume saved successfully");
    setSnackbarOpen(true);
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSection(isExpanded ? panel : false);
    };

  const handlePersonalInfoChange = (
    field: keyof typeof data.personalInfo,
    value: string
  ) => {
    onDataChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const handleExperienceAdd = () => {
    onDataChange({
      ...data,
      experience: [
        ...data.experience,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    });
    setExpandedSection("experience");
  };

  const handleExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newExperience = [...data.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    onDataChange({
      ...data,
      experience: newExperience,
    });
  };

  const handleExperienceDelete = (index: number) => {
    onDataChange({
      ...data,
      experience: data.experience.filter((_, i) => i !== index),
    });
  };

  const handleEducationAdd = () => {
    onDataChange({
      ...data,
      education: [
        ...data.education,
        {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    });
    setExpandedSection("education");
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newEducation = [...data.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    onDataChange({
      ...data,
      education: newEducation,
    });
  };

  const handleEducationDelete = (index: number) => {
    onDataChange({
      ...data,
      education: data.education.filter((_, i) => i !== index),
    });
  };

  const handleSkillAdd = () => {
    if (newSkill.trim()) {
      onDataChange({
        ...data,
        skills: [...data.skills, newSkill.trim()],
      });
      setNewSkill("");
      setSnackbarMessage(`Skill "${newSkill.trim()}" added`);
      setSnackbarOpen(true);
    }
  };

  const handleSkillDelete = (index: number) => {
    const skillName = data.skills[index];
    onDataChange({
      ...data,
      skills: data.skills.filter((_, i) => i !== index),
    });
    setSnackbarMessage(`Skill "${skillName}" removed`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Build Your Professional Resume
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Keyboard Shortcuts (Ctrl/Cmd + K)">
              <IconButton onClick={() => setKeyboardShortcutsOpen(true)}>
                <KeyboardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help & Tips">
              <IconButton onClick={() => setHelpDialogOpen(true)}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Fill in the details below to create your ATS-friendly resume.
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {progress.toFixed(1)}% Complete
        </Typography>
      </Box>

      {showTips && tips.length > 0 && (
        <Slide direction="down" in={true}>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TipsIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Pro Tips</Typography>
            </Box>
            <Typography variant="body2">
              {tips[Math.floor(Math.random() * tips.length)]}
            </Typography>
          </Paper>
        </Slide>
      )}

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Template Style
          </Typography>
          <Tooltip title="Choose a template that best represents your professional style">
            <InfoIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          </Tooltip>
        </Box>
        <FormControl fullWidth>
          <InputLabel>Template</InputLabel>
          <Select
            value={selectedTemplate}
            label="Template"
            onChange={(e) => onTemplateChange(e.target.value as TemplateType)}
          >
            <MenuItem value="modern">Modern</MenuItem>
            <MenuItem value="classic">Classic</MenuItem>
            <MenuItem value="minimal">Minimal</MenuItem>
          </Select>
          <FormHelperText>All templates are ATS-friendly</FormHelperText>
        </FormControl>
      </Paper>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        <Step>
          <StepLabel>Personal Info</StepLabel>
        </Step>
        <Step>
          <StepLabel>Experience</StepLabel>
        </Step>
        <Step>
          <StepLabel>Education</StepLabel>
        </Step>
        <Step>
          <StepLabel>Skills</StepLabel>
        </Step>
      </Stepper>

      <Accordion
        expanded={expandedSection === "personal"}
        onChange={handleAccordionChange("personal")}
        elevation={3}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "background.paper",
            boxShadow: 3,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Personal Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={data.personalInfo.firstName}
                onChange={(e) =>
                  handlePersonalInfoChange("firstName", e.target.value)
                }
                variant="outlined"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={data.personalInfo.lastName}
                onChange={(e) =>
                  handlePersonalInfoChange("lastName", e.target.value)
                }
                variant="outlined"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) =>
                  handlePersonalInfoChange("email", e.target.value)
                }
                variant="outlined"
                helperText="Use a professional email address"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={data.personalInfo.phone}
                onChange={(e) =>
                  handlePersonalInfoChange("phone", e.target.value)
                }
                variant="outlined"
                placeholder="e.g., (555) 123-4567"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={data.personalInfo.location}
                onChange={(e) =>
                  handlePersonalInfoChange("location", e.target.value)
                }
                variant="outlined"
                placeholder="City, State"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Professional Summary"
                value={data.personalInfo.summary}
                onChange={(e) =>
                  handlePersonalInfoChange("summary", e.target.value)
                }
                variant="outlined"
                helperText="Keep it concise, highlight your key strengths and career goals (3-5 sentences)"
                InputProps={{ sx: { borderRadius: 1 } }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedSection === "experience"}
        onChange={handleAccordionChange("experience")}
        elevation={3}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "background.paper",
            boxShadow: 3,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Experience</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {data.experience.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No experience added yet. Click the "+" button to add work
              experience.
            </Alert>
          ) : (
            data.experience.map((exp, index) => (
              <Box
                key={index}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: 2, borderColor: "primary.light" },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <DragIndicatorIcon
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Experience {index + 1}
                    </Typography>
                  </Box>
                  <Tooltip title="Remove" TransitionComponent={Zoom}>
                    <IconButton
                      size="small"
                      onClick={() => handleExperienceDelete(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
                  <Grid component="div" xs={12} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(index, "company", e.target.value)
                      }
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={exp.position}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "position",
                          e.target.value
                        )
                      }
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      variant="outlined"
                      placeholder="e.g., Jan 2020"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="End Date"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleExperienceChange(index, "endDate", e.target.value)
                      }
                      variant="outlined"
                      placeholder="e.g., Present"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={exp.description}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      variant="outlined"
                      helperText="Use bullet points and action verbs to highlight achievements"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))
          )}
          <Button
            startIcon={<AddIcon />}
            onClick={handleExperienceAdd}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Experience
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedSection === "education"}
        onChange={handleAccordionChange("education")}
        elevation={3}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "background.paper",
            boxShadow: 3,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Education</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {data.education.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No education added yet. Click the "+" button to add education
              details.
            </Alert>
          ) : (
            data.education.map((edu, index) => (
              <Box
                key={index}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: 2, borderColor: "primary.light" },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <DragIndicatorIcon
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Education {index + 1}
                    </Typography>
                  </Box>
                  <Tooltip title="Remove" TransitionComponent={Zoom}>
                    <IconButton
                      size="small"
                      onClick={() => handleEducationDelete(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
                  <Grid component="div" xs={12} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                      variant="outlined"
                      placeholder="e.g., Bachelor of Science"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Field"
                      value={edu.field}
                      onChange={(e) =>
                        handleEducationChange(index, "field", e.target.value)
                      }
                      variant="outlined"
                      placeholder="e.g., Computer Science"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      value={edu.startDate}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      variant="outlined"
                      placeholder="e.g., Sep 2018"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sm={6} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="End Date"
                      value={edu.endDate}
                      onChange={(e) =>
                        handleEducationChange(index, "endDate", e.target.value)
                      }
                      variant="outlined"
                      placeholder="e.g., May 2022"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                  <Grid component="div" xs={12} sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      label="GPA (Optional)"
                      value={edu.gpa}
                      onChange={(e) =>
                        handleEducationChange(index, "gpa", e.target.value)
                      }
                      variant="outlined"
                      placeholder="e.g., 3.8/4.0"
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))
          )}
          <Button
            startIcon={<AddIcon />}
            onClick={handleEducationAdd}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Education
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedSection === "skills"}
        onChange={handleAccordionChange("skills")}
        elevation={3}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "background.paper",
            boxShadow: 3,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Skills</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add relevant skills for the job you're applying for. Include both
              technical and soft skills.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSkillAdd()}
                variant="outlined"
                placeholder="e.g., Project Management"
                InputProps={{
                  sx: { borderRadius: 1 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSkillAdd}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            {data.skills.length === 0 ? (
              <Alert severity="info">
                No skills added yet. Add skills relevant to the position you're
                applying for.
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: 1 },
                }}
              >
                {data.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleSkillDelete(index)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 1,
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<InfoIcon />}
              sx={{ px: 3 }}
              onClick={handleSave}
            >
              Save Resume
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resume Builder Help</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Welcome to the Resume Builder! Here are some tips to create a great
            resume:
          </Typography>
          <Box sx={{ mt: 2 }}>
            {Object.entries(sectionTips).map(([section, tips]) => (
              <Box key={section} sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ textTransform: "capitalize" }}
                >
                  {section}
                </Typography>
                <ul>
                  {tips.map((tip, index) => (
                    <li key={index}>
                      <Typography variant="body2">{tip}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={keyboardShortcutsOpen}
        onClose={() => setKeyboardShortcutsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              Use these keyboard shortcuts to navigate:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Ctrl/Cmd + H</Typography>
                <Typography variant="body2">Open help dialog</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Ctrl/Cmd + K</Typography>
                <Typography variant="body2">Show keyboard shortcuts</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeyboardShortcutsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeForm;
