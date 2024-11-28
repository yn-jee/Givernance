import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

export async function fetchData(cid) {
  if (!cid) {
    throw new Error("CID가 제공되지 않았습니다.");
  }

  try {
    const result = await pinata.gateways.get(cid);
    console.log("Fetched data:", result);
    return result;
  } catch (error) {
    console.error("Pinata 데이터 가져오기 오류:", error);
    throw new Error("Pinata에서 데이터를 가져오는 도중 오류가 발생했습니다.");
  }
}
