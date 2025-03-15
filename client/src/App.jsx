import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
  Grid,
  IconButton
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [largeUrl, setLargeUrl] = useState('');
  const [smallUrl, setSmallUrl] = useState('');
  const [hexColor, setHexColor] = useState("#7289DA");
  const [userId, setUserId] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [largeImageUrl, setLargeImageUrl] = useState('');
  const [smallImageUrl, setSmallImageUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get('userId') || '');
    setAboutMe(params.get('aboutMe') || '');
    setBannerUrl(params.get('bannerUrl') || '');
    setLargeImageUrl(params.get('largeImageUrl') || '');
    setSmallImageUrl(params.get('smallImageUrl') || '');
    setHexColor(`#${params.get('hexColor') || '7289DA'}`);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (userId) params.set('userId', userId);
    if (aboutMe) params.set('aboutMe', aboutMe);
    if (bannerUrl) params.set('bannerUrl', bannerUrl);
    if (largeImageUrl) params.set('largeImageUrl', largeImageUrl);
    if (smallImageUrl) params.set('smallImageUrl', smallImageUrl);
    if (hexColor) params.set('hexColor', hexColor.substring(1));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [userId, aboutMe, bannerUrl, largeImageUrl, smallImageUrl, hexColor]);

  const loadapi = () => {
    const baseUrl = `https://discord-cards.onrender.com/api`;
    setLargeUrl(`${baseUrl}/card/${userId}?about=${aboutMe}&banner=${bannerUrl}&large_image=${largeImageUrl}&small_image=${smallImageUrl}&hex=${hexColor.substring(1)}`);
    setSmallUrl(`${baseUrl}/compact/${userId}?about=${aboutMe}&banner=${bannerUrl}&large_image=${largeImageUrl}&small_image=${smallImageUrl}&hex=${hexColor.substring(1)}`);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Copied to clipboard!");
  };

  return (
    <Box sx={{
      backgroundColor: "#23272A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      color: "#ffffff",
      overflow: "hidden",
      position: "relative"
    }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#7289DA", textTransform: "uppercase", marginBottom: "20px" }}>
        Discord Cards
      </Typography>

      <Typography variant="body1" sx={{ textAlign: "center", maxWidth: "500px", color: "#B9BBBE", marginBottom: "20px" }}>
        To use Discord Cards, join our <a href="https://discord.gg/RPaWHVBb7B" target="_blank" rel="noopener noreferrer" style={{ color: "#7289DA" }}>Discord Server</a>.
        This allows our bot to track your activity and generate your custom Discord card.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <IconButton component="a" href="https://discord.gg/RPaWHVBb7B" target="_blank" rel="noopener noreferrer">
          <img src="https://static.vecteezy.com/system/resources/previews/006/892/625/original/discord-logo-icon-editorial-free-vector.jpg" alt="Discord" style={{ width: "30px", height: "30px", borderRadius: "20%" }} />
        </IconButton>
        <IconButton component="a" href="https://github.com/crizmo/DiscordCards" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn3.iconfinder.com/data/icons/inficons/512/github.png" alt="GitHub" style={{ width: "30px", height: "30px", borderRadius: "20%" }} />
        </IconButton>
      </Box>
      {/* Input Form */}
      <Paper sx={{
        width: "80%",
        maxWidth: "500px",
        padding: "20px",
        backgroundColor: "#2C2F33",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="User ID" 
              variant="filled" 
              id="user-id" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ input: { color: "#ffffff" } }} 
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="About Me" 
              variant="filled" 
              id="about-me" 
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              sx={{ input: { color: "#ffffff" } }} 
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Banner URL" 
              variant="filled" 
              id="banner-url" 
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              sx={{ input: { color: "#ffffff" } }} 
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Large Image URL" 
              variant="filled" 
              id="large-image-url" 
              value={largeImageUrl}
              onChange={(e) => setLargeImageUrl(e.target.value)}
              sx={{ input: { color: "#ffffff" } }} 
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Small Image URL" 
              variant="filled" 
              id="small-image-url" 
              value={smallImageUrl}
              onChange={(e) => setSmallImageUrl(e.target.value)}
              sx={{ input: { color: "#ffffff" } }} 
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <input type="color" id="hex-code" value={hexColor} onChange={(e) => setHexColor(e.target.value)}
              style={{ width: "100%", height: "40px", border: "none", background: "#2C2F33", cursor: "pointer" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" onClick={loadapi} sx={{
              backgroundColor: "#7289DA",
              color: "#ffffff",
              fontWeight: "bold",
              '&:hover': { backgroundColor: "#5B6EAE" }
            }}>
              Generate Card
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Display Cards */}
      {(largeUrl || smallUrl) && (
        <Grid container spacing={3} sx={{ marginTop: "20px", justifyContent: "center" }}>
          {largeUrl && (
            <Grid item xs={12} sm={6}>
              <Paper sx={{
                backgroundColor: "#2C2F33",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
              }}>
                <Typography variant="h6" sx={{ color: "#ffffff", marginBottom: "5px" }}>
                  Large Card
                  <IconButton onClick={() => copyToClipboard(largeUrl)} sx={{ color: "#ffffff", marginTop: "5px" }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Typography>
                <img src={largeUrl} alt="Large Card" style={{ width: "100%", maxWidth: "250px", borderRadius: "8px" }} />
              </Paper>
            </Grid>
          )}

          {smallUrl && (
            <Grid item xs={12} sm={6}>
              <Paper sx={{
                backgroundColor: "#2C2F33",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
              }}>
                <Typography variant="h6" sx={{ color: "#ffffff", marginBottom: "5px" }}>
                  Compact Card
                  <IconButton onClick={() => copyToClipboard(smallUrl)} sx={{ color: "#ffffff", marginTop: "5px" }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Typography>
                <img src={smallUrl} alt="Compact Card" style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }} />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default App;