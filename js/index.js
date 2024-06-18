import fs from 'fs';
import https from 'https';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import axios from 'axios';
import FormData from 'form-data';
import exp from 'constants';

// __dirname을 ES 모듈에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../')));

// 루트 경로에 대한 요청을 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});


// JWT token as a constant
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYWJhY2Y4ZS1mNmQxLTRiNDUtOGZjZS05MGJlMjRlOTJiM2MiLCJlbWFpbCI6Im5heWoyODQyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZTNkZTMyZGZjYTg3NDdhYTM4NiIsInNjb3BlZEtleVNlY3JldCI6ImQxZTZmMGM2ZGFmM2Y3YWEzNzZiNDI5MzQ3NTYyMjA2ZmRjN2I4MjY3ZDY2MWE1ZWYxYmM5MTAyZTQyODg3NjEiLCJpYXQiOjE3MTg2MTczMTR9.nWYlouump08hSrX0lh-M6ozxfYCPyh2oT-tL5KHKhYU'

// Multer 설정 (파일 업로드를 위해 사용)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 파일 크기 제한 설정 (10MB)
}).fields([
  { name: 'json', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]);


app.use(bodyParser.json({ limit: '55mb' }));
app.use(bodyParser.urlencoded({ limit: '55mb', extended: true }));

const pinFilesToIPFS = async (formData) => {
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
  };
  

  
  app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).send('Error uploading files: ' + err.message);
      }
  
      if (!req.files || !req.body.description) {
        return res.status(400).send('Missing files or description.');
      }
  
      const jsonContent = {
        description: req.body.description,
        images: []
      };
  
      // 파일을 Base64로 인코딩하여 JSON에 추가
      req.files.forEach(file => {
        const base64Data = file.buffer.toString('base64');
        jsonContent.images.push({
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          data: base64Data
        });
      });
  
      const formData = new FormData();
      formData.append('json', Buffer.from(JSON.stringify(jsonContent)), 'data.json');
  
      const result = await pinFilesToIPFS(formData);
  
      if (result) {
        res.json(result);
      } else {
        res.status(500).send('Error pinning files to IPFS');
      }
    });
  });
  
// HTTPS 서버 생성 및 실행
https.createServer({
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
}, app).listen(3000, '0.0.0.0', () => {
  console.log('HTTPS server running on https://localhost:3000 !');
});
