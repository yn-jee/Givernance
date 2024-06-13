import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { uploadTextToIPFS, downloadTextFromIPFS } from './ipfs.js'; // ipfs.js에서 함수 가져오기

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

// IPFS 파일 업로드 라우트
app.post('/api/IPFSUpload', async (req, res) => {
    try {
        const textData = req.body.data;
        const response = await uploadTextToIPFS(textData);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// IPFS 파일 다운로드 라우트
app.get('/api/IPFSDownload/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const text = await downloadTextFromIPFS(cid);
        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// HTTPS 서버 생성 및 실행
https.createServer({
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
}, app).listen(3000, '0.0.0.0', () => {
  console.log('HTTPS server running on https://localhost:3000 !');
});
