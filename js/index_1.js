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

import { PinataSDK } from "pinata";
import dotenv from "dotenv";
dotenv.config();

// __dirname을 ES 모듈에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let hashMap = new Map();

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

// JWT token as a constant
// const JWT =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYWJhY2Y4ZS1mNmQxLTRiNDUtOGZjZS05MGJlMjRlOTJiM2MiLCJlbWFpbCI6Im5heWoyODQyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZTNkZTMyZGZjYTg3NDdhYTM4NiIsInNjb3BlZEtleVNlY3JldCI6ImQxZTZmMGM2ZGFmM2Y3YWEzNzZiNDI5MzQ3NTYyMjA2ZmRjN2I4MjY3ZDY2MWE1ZWYxYmM5MTAyZTQyODg3NjEiLCJpYXQiOjE3MTg2MTczMTR9.nWYlouump08hSrX0lh-M6ozxfYCPyh2oT-tL5KHKhYU";

app.use(cors());

app.use(bodyParser.json({ limit: "55mb" }));
app.use(bodyParser.urlencoded({ limit: "55mb", extended: true }));

const storage = multer.memoryStorage(); // 메모리 저장소 사용
const upload = multer();

async function createNode() {
  const { createHelia } = await import("helia");
  const { unixfs } = await import("@helia/unixfs");
  const helia = await createHelia();
  const fs = unixfs(helia);
  return fs;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  const fs = await createNode();
  const data = req.file.buffer;
  const cid = await fs.addBytes(data);
  hashMap.set(req.file.originalname, cid);
  res.status(201).send("Your file has been uploaded");
});

app.get("/fetch", async (req, res) => {
  const fs = await createNode();
  const filename = req.body.filename;
  const cid = hashMap(filename);
  if (!cid) {
    res.status(404).send("we could not find the file");
  }
  let text;
  const decoder = new TextDecoder();
  for await (const chunks of fs.cat(cid)) {
    text = decoder.decode(chunks, { stream: true });
  }
  res.status(200).send(text);
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
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        return pinataRes.data;
      });

      const results = await Promise.all(uploadPromises);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// HTTPS 서버 생성 및 실행
https
  .createServer(
    {
      key: fs.readFileSync("localhost.key"),
      cert: fs.readFileSync("localhost.crt"),
    },
    app
  )
  .listen(3000, "0.0.0.0", () => {
    console.log("HTTPS server running on https://localhost:3000 !");
  });
