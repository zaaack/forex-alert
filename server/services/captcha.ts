import {Request, Response} from 'express'
import crypto from 'crypto'
import http from 'http'
import { Encoder } from './encoder';
var svgCaptcha = require('svg-captcha');
class CaptchaService {
  private encoder = new Encoder(
    '22d16230-e9fc-11eb-9c15-47cda8d6b91e',
    '81b61f7d-647a-431b-962c-975c6492f8ff'
  )


  handler(req: Request, res: Response) {
    var captcha = svgCaptcha.create();
    res.cookie('cp', this.encoder.encode(captcha.text))
    res.type('svg');
    res.status(200).send(captcha.data);
  }

  check(req: Request, text: string) {
    return req.cookies.cp === this.encoder.encode(text)
  }

}

export const captcha = new CaptchaService();
