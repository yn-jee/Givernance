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

// JWT token as a constant
// const JWT =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYWJhY2Y4ZS1mNmQxLTRiNDUtOGZjZS05MGJlMjRlOTJiM2MiLCJlbWFpbCI6Im5heWoyODQyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZTNkZTMyZGZjYTg3NDdhYTM4NiIsInNjb3BlZEtleVNlY3JldCI6ImQxZTZmMGM2ZGFmM2Y3YWEzNzZiNDI5MzQ3NTYyMjA2ZmRjN2I4MjY3ZDY2MWE1ZWYxYmM5MTAyZTQyODg3NjEiLCJpYXQiOjE3MTg2MTczMTR9.nWYlouump08hSrX0lh-M6ozxfYCPyh2oT-tL5KHKhYU";

app.use(cors());

app.use(bodyParser.json({ limit: "55mb" }));
app.use(bodyParser.urlencoded({ limit: "55mb", extended: true }));

// Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT, // 환경 변수에서 JWT 불러오기
  pinataGateway: "purple-careful-ladybug-259.mypinata.cloud",
});

// pinata.setNewHeaders({
//   "x-pinata-gateway-token":
//     "k1pU-qaPbJ3NIOyUH22ZwYpWXGKk47BaoWU8kl1j3r1Nmc51-U3Odw14JtMvV4TB", // 여기에 액세스 토큰 추가
// });

const testPinataAuth = async () => {
  try {
    const authResponse = await pinata.testAuthentication();
    console.log("Pinata 인증 성공:", authResponse);
  } catch (error) {
    console.error("Pinata 인증 실패:", error);
  }
};

testPinataAuth();

// const files = await pinata.files.list();
// console.log(files);
/*
const testFile = await pinata.gateways.get(
  "bafybeichamzkrniyk3ub33gaxqgbm43aax7unpx75xzjg2mmsrgiih34gi"
);
console.log(testFile);
const parser = new DOMParser();
const doc = parser.parseFromString(testFile, "text/html");

// 모든 링크 태그(<a>)를 가져옵니다.
const links = doc.querySelectorAll("a");

// CID를 저장할 배열
const cids = [];

// 각 링크에서 CID를 추출합니다.
links.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && href.includes("/ipfs/")) {
    // /ipfs/ 이후의 문자열을 CID로 간주하고 추출
    const cid = href.split("/ipfs/")[1].split("?")[0]; // CID 부분만 추출
    cids.push(cid);
  }
});

console.log(cids); // CID 목록 출력*/

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
      // 파일을 하나씩 업로드
      const IpfsHashes = [];
      for (const file of files) {
        const pinataFile = new File([file.buffer], file.originalname, {
          type: file.mimetype,
        });

        // Pinata에 파일 업로드
        const result = await pinata.upload.file(pinataFile);
        IpfsHashes.push(result.IpfsHash);
      }

      // console.log(IpfsHashes);
      res.json(IpfsHashes); // 모든 파일의 업로드 결과를 반환
    } catch (error) {
      console.error("Pinata 업로드 오류:", error);
      res
        .status(500)
        .json({ error: "Pinata에 파일 업로드 중 오류가 발생했습니다." });
    }
  });
});

// const upload = multer({ storage });
// app.post("/upload", upload.array("file", 7), async (req, res) => {
//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res.status(400).json({ error: "No files uploaded" });
//   }

//   try {
//     const uploadPromises = files.map(async (file) => {
//       // const formData = new FormData();
//       // formData.append("file", file.buffer, file.originalname);

//       // const pinataRes = await axios.post(
//       //   "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       //   formData,
//       //   {
//       //     maxBodyLength: "Infinity",
//       //     headers: {
//       //       "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
//       //       Authorization: `Bearer ${JWT}`,
//       //     },
//       //   }
//       // );

//       console.log("trying:", file);
//       const upload = await pinata.upload.file(file);

//       return upload.data;
//     });

//     const results = await Promise.all(uploadPromises);
//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get("/fetch/:cid", async (req, res) => {
  try {
    const cid = req.params.cid; // URL에서 CID를 가져옴

    console.log(cid);

    if (!cid) {
      return res.status(400).json({ error: "CID가 제공되지 않았습니다." });
    }

    // Pinata SDK의 gateways.get을 사용하여 CID로 파일 가져오기
    const result = await pinata.gateways.get(cid);

    // 파일 데이터를 응답으로 전송
    res.send(result); // 파일 데이터를 클라이언트로 전송
  } catch (error) {
    console.error(
      "Pinata에서 파일을 불러오는 도중 오류가 발생했습니다:",
      error
    );
    res
      .status(500)
      .json({ error: "Pinata에서 파일을 불러오던 중 오류가 발생했습니다." });
  }
});

// const upload = multer({ storage });

// app.post("/upload", upload.array("file", 7), async (req, res) => {
//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
//   }

//   try {
//     // Pinata SDK를 사용하여 파일 업로드
//     const uploadPromises = files.map(async (file) => {
//       const pinataFile = new File(
//         [fs.readFileSync(file.path)],
//         file.originalname,
//         {
//           type: file.mimetype,
//         }
//       );

//       const result = await pinata.upload.fileArray([pinataFile]);
//       return result;
//     });

//     const results = await Promise.all(uploadPromises);

//     // 파일 업로드 후 로컬 파일 삭제
//     files.forEach((file) => {
//       fs.unlink(file.path, (err) => {
//         if (err) {
//           console.error("파일 삭제 중 오류 발생:", file.path, err);
//         }
//       });
//     });

//     res.json(results);
//   } catch (error) {
//     console.error("Pinata에 업로드 중 오류 발생:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/upload", upload.array("file", 6), async (req, res) => {
//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res.status(400).json({ error: "No files uploaded" });
//   }

//   try {
//     const uploadPromises = files.map(async (file) => {
//       const formData = new FormData();
//       formData.append("file", fs.createReadStream(file.path));

//       const pinataMetadata = JSON.stringify({ name: file.originalname });
//       formData.append("pinataMetadata", pinataMetadata);

//       const pinataOptions = JSON.stringify({ cidVersion: 0 });
//       formData.append("pinataOptions", pinataOptions);

//       const pinataRes = await axios.post(
//         "https://api.pinata.cloud/pinning/pinFileToIPFS",
//         formData,
//         {
//           maxBodyLength: "Infinity",
//           headers: {
//             "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
//             Authorization: `Bearer ${JWT}`,
//           },
//         }
//       );

//       return pinataRes.data;
//     });

//     const results = await Promise.all(uploadPromises);
//     res.json(results);
//   } catch (error) {
//     console.error(
//       "Error uploading to Pinata:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({ error: error.message });
//   }
// });

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
      console.log("File uploaded!");
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
