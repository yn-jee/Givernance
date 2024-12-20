import fs from "fs";
import https from "https";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";
import { WebSocketServer } from 'ws';
import { PinataSDK } from "pinata-web3";
import dotenv from "dotenv";
dotenv.config();

// __dirname을 ES 모듈에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "../")));

// 루트 경로에 대한 요청을 처리
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "purple-careful-ladybug-259.mypinata.cloud",
});

const testPinataAuth = async () => {
  try {
    const authResponse = await pinata.testAuthentication();
    console.log("Pinata 인증 성공:", authResponse);
  } catch (error) {
    console.error("Pinata 인증 실패:", error);
  }
};

testPinataAuth();

const storage = multer.memoryStorage(); // 메모리 저장소 사용
const upload = multer({ storage }).array("file", 7);

app.post("/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "파일 업로드에 실패했습니다." });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "업로드할 파일이 없습니다." });
    }

    try {
      const IpfsHashes = [];
      for (const file of files) {
        const pinataFile = new File([file.buffer], file.originalname, {
          type: file.mimetype,
        });

        const result = await pinata.upload.file(pinataFile);
        IpfsHashes.push(result.IpfsHash);
      }

      res.json(IpfsHashes);
    } catch (error) {
      console.error("Pinata 업로드 오류:", error);
      res
        .status(500)
        .json({ error: "Pinata에 파일 업로드 중 오류가 발생했습니다." });
    }
  });
});

const FundraiserUpload = multer({ storage });
app.post(
  "/FundraiserUpload",
  FundraiserUpload.array("file", 7),
  async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.path));

        const pinataMetadata = JSON.stringify({ name: file.originalname });
        formData.append("pinataMetadata", pinataMetadata);

        const pinataOptions = JSON.stringify({ cidVersion: 0 });
        formData.append("pinataOptions", pinataOptions);

        const pinataRes = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: "Infinity",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
              Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
          }
        );

        return pinataRes.data;
      });

      const results = await Promise.all(uploadPromises);
      res.json(results);
      console.log("File uploaded!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// WebSocket 서버 설정
const server = https.createServer({ key, cert }, app);
const wss = new WebSocketServer({ server, path: '/ws' });

// 웹소켓 연결 처리
wss.on('connection', function connection(ws) {
  console.log('Client connected via WebSocket');

  ws.on('message', function incoming(message) {
      console.log('Received from client: ' + message);
     // 수신한 메시지를 문자열로 변환
  const messageString = message.toString();

      // 다른 클라이언트에 메시지를 전송할 수 있습니다
      wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(messageString);
          }
      });
  });
}); 



// HTTPS 서버 생성 및 실행
https
  .createServer(
    {
      key: fs.readFileSync("/etc/letsencrypt/live/givernance.org/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/givernance.org/fullchain.pem"),
    },
    app
  )
  .listen(8443, "0.0.0.0", () => {
    console.log("HTTPS server running on https://givernance.org:8443 !");
  });
