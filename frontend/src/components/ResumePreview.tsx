import { Box, Paper, Typography, Button, TextField } from "@mui/material";
import { ResumeData, TemplateType } from "../utils/resume";
import html2pdf from "html2pdf.js";
import { Download as DownloadIcon, Save as SaveIcon } from "@mui/icons-material";
import { useEffect } from "react";
import { resumeService } from "../services/api";
import { toast } from 'react-hot-toast';

interface ResumePreviewProps {
  data: ResumeData;
  selectedTemplate: TemplateType;
  resumeName: string;
  onResumeNameChange: (name: string) => void;
}

const ResumePreview = ({
  data,
  selectedTemplate,
  resumeName,
  onResumeNameChange,
}: ResumePreviewProps) => {
  const handleDownload = () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;

    // Get the actual content height
    const contentHeight = element.scrollHeight;
    const pageHeight = 1123; // A4 height in pixels (297mm * 3.78 pixels per mm)

    // Calculate number of pages needed
    const numPages = Math.ceil(contentHeight / pageHeight);

    const opt = {
      margin: 0.4,
      filename: resumeName
        ? `${resumeName}.pdf`
        : `${data.personalInfo.firstName}_${data.personalInfo.lastName}_Resume.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 794, // A4 width in pixels (210mm * 3.78 pixels per mm)
        windowHeight: pageHeight * numPages,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait" as "portrait" | "landscape",
        compress: true,
        precision: 16,
        putOnlyUsedFonts: true,
      },
    };

    // Add print-specific styles
    element.classList.add("pdf-generation");
    document.body.classList.add("pdf-generation");

    // Generate PDF
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Remove print-specific styles
        element.classList.remove("pdf-generation");
        document.body.classList.remove("pdf-generation");
      });
  };

  const handleSave = async () => {
    // Validate email
    if (!data.personalInfo.email) {
      toast.error('Please add your email before saving the resume', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
      return;
    }

    try {
      const resumeData = {
        name: resumeName || `${data.personalInfo.firstName}_${data.personalInfo.lastName}_Resume`,
        template: selectedTemplate,
        personalInfo: data.personalInfo,
        experience: data.experience,
        education: data.education,
        skills: data.skills
      };

      await resumeService.createResume(resumeData);
      toast.success('Resume saved successfully!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  // Add this at the top level of your component, before the template renders
  const commonStyles = {
    // Styles for screen view
    p: 4,
    maxWidth: "800px",
    margin: "0 auto",

    // Special styles for PDF generation
    "&.for-pdf": {
      maxWidth: "100%",
      width: "210mm", // A4 width
      minHeight: "297mm", // A4 height
      padding: "15mm", // Standard margin for printing
      margin: 0,
      boxSizing: "border-box",
      backgroundColor: "white",
      "@media print": {
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm",
        margin: 0,
      },
    },
  };

  // Template 1 - Similar to Michelle Wattz's design
  const renderModernTemplate = () => (
    <Box
      id="resume-preview"
      sx={{
        ...commonStyles,
        color: "#2c3e50",
      }}
    >
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            letterSpacing: "0.1em",
            color: "#2c3e50",
          }}
        >
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          {data.personalInfo.location} | {data.personalInfo.phone} |{" "}
          {data.personalInfo.email}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            borderBottom: "2px solid #2c3e50",
            pb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "500",
          }}
        >
          Objective
        </Typography>
        <Typography paragraph sx={{ color: "#444" }}>
          {data.personalInfo.summary}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            borderBottom: "2px solid #2c3e50",
            pb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "500",
          }}
        >
          Experience
        </Typography>
        {data.experience.map((exp, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#2c3e50" }}
              >
                {exp.company}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {exp.startDate} – {exp.endDate}
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1, color: "#444" }}>
              {exp.position}
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              {exp.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            borderBottom: "2px solid #2c3e50",
            pb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "500",
          }}
        >
          Education
        </Typography>
        {data.education.map((edu, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#2c3e50" }}
              >
                {edu.institution}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {edu.startDate} – {edu.endDate}
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: "#444" }}>
              {edu.degree} in {edu.field}
            </Typography>
            {edu.gpa && (
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                GPA: {edu.gpa}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            borderBottom: "2px solid #2c3e50",
            pb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "500",
          }}
        >
          Skills
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {data.skills.map((skill, index) => (
            <Typography
              key={index}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.9rem",
                color: "#2c3e50",
                border: "1px solid #2c3e50",
              }}
            >
              {skill}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );

  // Template 2 - Similar to Danielle Brasseur's design
  const renderClassicTemplate = () => (
    <Box
      id="resume-preview"
      sx={{
        ...commonStyles,
        color: "#1a472a",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#1a472a",
          }}
        >
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
          {data.personalInfo.location} | {data.personalInfo.phone} |{" "}
          {data.personalInfo.email}
        </Typography>
        <Typography paragraph sx={{ color: "#444" }}>
          {data.personalInfo.summary}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: "#1a472a",
            fontWeight: "bold",
            borderBottom: "3px solid #90EE90",
            pb: 1,
          }}
        >
          Education
        </Typography>
        {data.education.map((edu, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#1a472a" }}
            >
              {edu.degree} in {edu.field}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#444", mb: 1 }}>
              {edu.institution} | {edu.startDate} - {edu.endDate}
            </Typography>
            {edu.gpa && (
              <Typography variant="body2" sx={{ color: "#666" }}>
                GPA: {edu.gpa}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: "#1a472a",
            fontWeight: "bold",
            borderBottom: "3px solid #90EE90",
            pb: 1,
          }}
        >
          Experience
        </Typography>
        {data.experience.map((exp, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", color: "#1a472a" }}
            >
              {exp.position} | {exp.company}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
              {exp.startDate} - {exp.endDate}
            </Typography>
            <Typography variant="body2" sx={{ color: "#444" }}>
              {exp.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: "#1a472a",
            fontWeight: "bold",
            borderBottom: "3px solid #90EE90",
            pb: 1,
          }}
        >
          Skills
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {data.skills.map((skill, index) => (
            <Typography
              key={index}
              sx={{
                color: "#1a472a",
                fontSize: "0.9rem",
                position: "relative",
                "&:not(:last-child):after": {
                  content: '"•"',
                  position: "absolute",
                  right: "-1rem",
                  color: "#90EE90",
                },
              }}
            >
              {skill}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );

  // Template 3 - New Minimal Template
  const renderMinimalTemplate = () => (
    <Box
      id="resume-preview"
      sx={{
        ...commonStyles,
        color: "#2d3436",
      }}
    >
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "2px solid #74b9ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "600",
            mb: 1,
            color: "#2d3436",
            letterSpacing: "0.02em",
          }}
        >
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#636e72", mb: 2, fontSize: "1rem" }}
        >
          {data.personalInfo.location} • {data.personalInfo.phone} •{" "}
          {data.personalInfo.email}
        </Typography>
        <Typography
          paragraph
          sx={{
            color: "#2d3436",
            fontSize: "1rem",
            lineHeight: "1.6",
            maxWidth: "95%",
          }}
        >
          {data.personalInfo.summary}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: "1.25rem",
            mb: 2.5,
            color: "#2d3436",
            fontWeight: "600",
            position: "relative",
            paddingLeft: "12px",
            "&:before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "4px",
              height: "100%",
              backgroundColor: "#74b9ff",
              borderRadius: "2px",
            },
          }}
        >
          Professional Experience
        </Typography>
        {data.experience.map((exp, index) => (
          <Box key={index} sx={{ mb: 3, pl: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                color: "#2d3436",
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              {exp.position}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "#636e72",
                fontSize: "0.95rem",
              }}
            >
              <Typography component="span" sx={{ fontWeight: "500" }}>
                {exp.company}
              </Typography>
              <Typography component="span" sx={{ mx: 1 }}>
                •
              </Typography>
              <Typography component="span">
                {exp.startDate} – {exp.endDate}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#2d3436",
                lineHeight: "1.6",
                fontSize: "0.95rem",
              }}
            >
              {exp.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: "1.25rem",
            mb: 2.5,
            color: "#2d3436",
            fontWeight: "600",
            position: "relative",
            paddingLeft: "12px",
            "&:before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "4px",
              height: "100%",
              backgroundColor: "#74b9ff",
              borderRadius: "2px",
            },
          }}
        >
          Education
        </Typography>
        {data.education.map((edu, index) => (
          <Box key={index} sx={{ mb: 3, pl: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                color: "#2d3436",
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              {edu.degree} in {edu.field}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#636e72",
                fontSize: "0.95rem",
              }}
            >
              <Typography component="span" sx={{ fontWeight: "500" }}>
                {edu.institution}
              </Typography>
              <Typography component="span" sx={{ mx: 1 }}>
                •
              </Typography>
              <Typography component="span">
                {edu.startDate} – {edu.endDate}
              </Typography>
            </Box>
            {edu.gpa && (
              <Typography
                sx={{
                  color: "#636e72",
                  mt: 0.5,
                  fontSize: "0.95rem",
                }}
              >
                GPA: {edu.gpa}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box>
        <Typography
          component="h2"
          sx={{
            fontSize: "1.25rem",
            mb: 2.5,
            color: "#2d3436",
            fontWeight: "600",
            position: "relative",
            paddingLeft: "12px",
            "&:before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "4px",
              height: "100%",
              backgroundColor: "#74b9ff",
              borderRadius: "2px",
            },
          }}
        >
          Technical Skills
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            pl: 1,
          }}
        >
          {data.skills.map((skill, index) => (
            <Typography
              key={index}
              sx={{
                color: "#2d3436",
                fontSize: "0.95rem",
                backgroundColor: "rgba(116, 185, 255, 0.1)",
                px: 2,
                py: 0.75,
                borderRadius: "4px",
                border: "1px solid rgba(116, 185, 255, 0.3)",
              }}
            >
              {skill}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "modern":
        return renderModernTemplate();
      case "classic":
        return renderClassicTemplate();
      case "minimal":
        return renderMinimalTemplate();
      default:
        return renderModernTemplate();
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          mb: 1,
          backgroundColor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
            }}
          >
            Resume Preview
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <TextField
              size="small"
              label="File Name"
              value={resumeName}
              onChange={(e) => onResumeNameChange(e.target.value)}
              placeholder="e.g., Software_Engineer_Resume"
              sx={{
                width: { xs: "100%", sm: 250 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              helperText="Leave empty for default name"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              Save Resume
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: "white",
          borderRadius: 2,
          overflow: "auto",
          flex: 1,
          position: "relative",
          "& *": {
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          },
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
            "&:hover": {
              background: "#666",
            },
          },
          "@media print": {
            padding: 0,
            margin: 0,
            boxShadow: "none",
            borderRadius: 0,
            overflow: "visible",
            height: "auto",
            pageBreakAfter: "avoid",
          },
        }}
      >
        <div
          id="resume-preview"
          className="resume-preview"
          style={{
            position: "relative",
            zIndex: 2,
            backgroundColor: "white",
          }}
        >
          {renderTemplate()}
        </div>
      </Paper>
    </Box>
  );
};

export default ResumePreview;
