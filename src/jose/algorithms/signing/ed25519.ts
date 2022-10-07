import * as Ed25519 from '@noble/ed25519';
import { base64url } from 'multiformats/bases/base64';

import type { PrivateJwk, PublicJwk, Signer } from '../../types';

function validateKey(jwk: PrivateJwk | PublicJwk): void {
  if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519') {
    throw new Error('invalid jwk. kty MUST be OKP. crv MUST be Ed25519');
  }
}

function publicKeyToJwk(publicKeyBytes: Uint8Array): PublicJwk {
  const x = base64url.baseEncode(publicKeyBytes);

  const publicJwk: PublicJwk = {
    alg : 'EdDSA',
    kty : 'OKP',
    crv : 'Ed25519',
    x
  };

  return publicJwk;
}

export const ed25519: Signer = {
  sign: (content: Uint8Array, privateJwk: PrivateJwk): Promise<Uint8Array> => {
    validateKey(privateJwk);

    const privateKeyBytes = base64url.baseDecode(privateJwk.d);

    return Ed25519.sign(content, privateKeyBytes);
  },

  verify: (content: Uint8Array, signature: Uint8Array, publicJwk: PublicJwk): Promise<boolean> => {
    validateKey(publicJwk);
    const publicKeyBytes = base64url.baseDecode(publicJwk.x);

    return Ed25519.verify(signature, content, publicKeyBytes);
  },

  generateKeyPair: async (): Promise<{publicJwk: PublicJwk, privateJwk: PrivateJwk}> => {
    const privateKeyBytes = Ed25519.utils.randomPrivateKey();
    const publicKeyBytes = await Ed25519.getPublicKey(privateKeyBytes);

    const d = base64url.baseEncode(privateKeyBytes);

    const publicJwk = publicKeyToJwk(publicKeyBytes);
    const privateJwk: PrivateJwk = { ...publicJwk, d };

    return { publicJwk, privateJwk };
  },

  publicKeyToJwk: async (publicKeyBytes: Uint8Array): Promise<PublicJwk> => {
    return publicKeyToJwk(publicKeyBytes);
  }
};