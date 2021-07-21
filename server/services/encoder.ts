import crypto from 'crypto'

export class Encoder {
  constructor(
    private token1 = '7260bff6-b390-47d7-8fbe-ea02c363ba4d',
    private token2 = 'a4ed267c-b9ce-4bbb-b773-e4732c8caf4d',
  ) {}

  encode(str: string) {
    return crypto
      .createHmac('sha256', this.token1)
      .update(str + this.token2, 'utf8')
      .digest('hex')
  }
}


export const encoder = new Encoder()
