// import { HDKEY, DID, fulaJWT } from "../../src/index.js"

// async function TestJWT() {
//     const hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
//     const ed = new HDKEY(hexSeed);
//     const alice = ed.createEDKey();

//     const aliceDID = new DID(ed._secretKey.slice(0, 32), alice.publicKey);
//     const a = await aliceDID.getDID();
//     console.log('did: ', a.did);

//     let jwt = await new fulaJWT.createJWT({ aud: a.did, iat: undefined, box: 'uPort Developer' })
//     .setIssuedAt()
//     .setNotBefore(Math.floor(Date.now() / 1000))
//     .setIssuer(a.did)
//     .setAudience(a.did)
//     .setExpirationTime('24h')
//     .create(ed.getEd2519Signer())

//     // let jwt = await createJWT(
//     //     { aud: a.did, iat: undefined, box: 'uPort Developer' },
//     //     { issuer: a.did, signer: ed.getEd2519Signer() }
//     // )
//     console.log('jwt: ', jwt)

//     let res = await fulaJWT.decode(jwt);
//     console.log('decode res: ', res);
// }
// TestJWT();