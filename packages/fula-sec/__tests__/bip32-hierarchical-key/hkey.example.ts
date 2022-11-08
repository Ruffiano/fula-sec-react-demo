import { HDKEY } from '../../src/did/hkey/key.js';
import { DID } from '../../src/did/did.js'
import * as u8a from 'uint8arrays'
import sha3 from 'js-sha3'
import splitKey from 'shamirs-secret-sharing'

function _splitKey(prime: Uint8Array) {
    let _splitKey: Array<string> = []
    const shares = splitKey.split(Buffer.from(prime), { shares: 2, threshold: 2 })
    shares.forEach((element: Buffer) => {
        _splitKey.push(element.toString('hex'))
    });
    return _splitKey
}

(async()=> {
    let secretKey = '123456789' // 1
    
    let keys = _splitKey(u8a.fromString(secretKey))
    console.log('keys: ', keys)
    
    // 2 getSignature(keys[0]) => signature
    let signature = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
    let hexSeed = sha3.keccak256(JSON.stringify({
        secretKey: keys[1],
        signature
    }));
    
    const ed = new HDKEY(hexSeed)
    const master = ed.createEDKey()
    console.log('master key: ', master)
    const idid = new DID(ed._secretKey.slice(0, 32), master.publicKey);
    const did = await idid.getDID();
    console.log('ParentDID: ', did)

    const sub = ed.deriveKeyPath("m/0'/0'");
    console.log('child Key: ', sub)
    let subDID = await idid.getDID(ed._secretKey.slice(0, 32))
    console.log('subDID: ', subDID)
})()    