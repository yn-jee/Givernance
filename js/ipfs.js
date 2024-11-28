// import { createHeliaHTTP } from "@helia/http";
// import { unixfs } from "@helia/unixfs";
// //import { CID } from "multiformats";
// //import { TextEncoder, TextDecoder } from "util";

// // Helia 설정 함수
// async function createHeliaInstance() {
//     const helia = await createHeliaHTTP({
//         url: 'http://localhost:5001' // IPFS 데몬의 HTTP API 엔드포인트
//     });
//     return helia;
// }

// // 파일 업로드 함수
// export async function uploadTextToIPFS(textData) {
//     try {
//         const helia = await createHeliaInstance();
//         const heliaFs = unixfs(helia);
//         const encoder = new TextEncoder();
//         const bytes = encoder.encode(textData);
//         const fileCid = await heliaFs.addBytes(bytes);

//         return {
//             message: 'Text uploaded successfully',
//             data: textData,
//             cid: fileCid.toString()
//         };
//     } catch (error) {
//         console.error('Error uploading text:', error);
//         throw new Error('Internal Server Error');
//     }
// }

// // 파일 다운로드 함수
// export async function downloadTextFromIPFS(cid) {
//     try {
//         const helia = await createHeliaInstance();
//         const heliaFs = unixfs(helia);
//         const decoder = new TextDecoder();
//         let text = "";

//         for await (const chunk of heliaFs.cat(CID.parse(cid))) {
//             text += decoder.decode(chunk, {
//                 stream: true,
//             });
//         }
//         return text;
//     } catch (error) {
//         console.error('Error downloading text:', error);
//         throw new Error('Internal Server Error');
//     }
// }

import { createHelia } from 'helia';
import { MemoryBlockstore } from 'blockstore-core/memory';

async function createHeliaInstance() {
    const blockstore = new MemoryBlockstore();
    const helia = await createHelia({ blockstore });
    return helia;
}

export async function uploadTextToIPFS(text) {
    const helia = await createHeliaInstance();
    const { cid } = await helia.add(text);
    console.log('CID:', cid.toString());  // CID를 콘솔에 출력하여 확인
    return { path: cid.toString() };  // 객체를 반환
}

export async function downloadTextFromIPFS(cid) {
    const helia = await createHeliaInstance();
    const chunks = [];
    for await (const chunk of helia.cat(cid)) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString();
}
