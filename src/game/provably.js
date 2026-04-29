class Provably {
  constructor() {
    this.clientSeed     = this._randomHex(16);
    this.serverSeedHash = null;   // received from /game/start
    this.serverSeed     = null;   // revealed by server after game ends
    this.nonce          = null;
  }

  // ✅ FIX 2: Just generates a fresh client seed — server handles the rest
  newRound() {
    this.clientSeed     = this._randomHex(16);
    this.serverSeed     = null;
    this.serverSeedHash = null;
    this.nonce          = null;
    return { clientSeed: this.clientSeed };
  }

  // Called after game ends with data from server response
  setServerReveal({ serverSeed, serverSeedHash, nonce }) {
    this.serverSeed     = serverSeed;
    this.serverSeedHash = serverSeedHash;
    this.nonce          = nonce;
  }

  // Verify the committed hash matches the revealed server seed
  async verifyCommitment() {
    if (!this.serverSeed || !this.serverSeedHash) return false;
    const computed = await this._sha256(this.serverSeed);
    return computed === this.serverSeedHash;
  }

  // Reproduce mine positions from seeds — player can verify server didn't cheat
  async verifyMines(totalTiles = 25, mineCount = 3) {
    if (!this.serverSeed || !this.clientSeed || this.nonce === null) return null;

    const combined  = `${this.clientSeed}:${this.nonce}`;
    const hashHex   = await this._hmacSha256(this.serverSeed, combined);
    const bytes     = hashHex.match(/.{2}/g).map(b => parseInt(b, 16));
    const indices   = Array.from({ length: totalTiles }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
      const byteIndex = (indices.length - 1 - i) % bytes.length;
      const j = bytes[byteIndex] % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices.slice(0, mineCount).sort((a, b) => a - b);
  }

  reveal() {
    return {
      serverSeed:     this.serverSeed,
      serverSeedHash: this.serverSeedHash,
      clientSeed:     this.clientSeed,
      nonce:          this.nonce
    };
  }

  async _sha256(message) {
    const buf  = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async _hmacSha256(key, message) {
    const enc        = new TextEncoder();
    const cryptoKey  = await crypto.subtle.importKey(
      'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig        = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  _randomHex(length) {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
}