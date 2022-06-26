import { exportCallDataGroth16 } from "./zkProofs/exportCallData";

export async function mintCalldata(attribute1, attribute2, attribute3, hashKey) {
  const input =
  {
    "attribute1": attribute1,
    "attribute2": attribute2,
    "attribute3": attribute3,
    "hashKey": hashKey 
  };
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "/zkProofs/mint.wasm",
      "/zkProofs/mint.zkey"
    );
  } catch (error) {
    // console.log(error);
    window.alert("Wrong answer");
  }

  return dataResult;
}
