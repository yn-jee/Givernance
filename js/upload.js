import { PinataSDK } from "pinata-web3";
import multer from "multer";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

const storage = multer.memoryStorage(); // 메모리 저장소 사용
const upload = multer({ storage }).array("file", 7);

export async function uploadFiles(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
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
      res.json(IpfsHashes); // IPFS 해시 반환
    } catch (error) {
      console.error("Pinata 업로드 오류:", error);
      res
        .status(500)
        .json({ error: "Pinata에 파일 업로드 중 오류가 발생했습니다." });
    }
  });
}
