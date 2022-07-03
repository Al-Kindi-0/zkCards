import { exportCallDataGroth16 } from "../exportCallData";

export async function sellCalldata(address, shieldId, root, secretKey, pubKey, path_elements, path_indices, attribute1, attribute2, attribute3, hashKey) {

  const input =
  {
    address: address,
    id: shieldId,
    root: root,
    secret: secretKey,
    pubKeyReceiver: pubKey,
    pathElements: path_elements,
    pathIndices: path_indices,
    attribute1: attribute1,
    attribute2: attribute2,
    attribute3: attribute3,
    hashKey: hashKey
  };

  //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "zkProofs/sell/sell.wasm",
      "zkProofs/sell/sell.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}
