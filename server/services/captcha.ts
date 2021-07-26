import { Request, Response } from 'express'
import crypto from 'crypto'
import http from 'http'
import { Encoder } from './encoder'
import { uniqueId } from 'smoldash'
import dayjs, { Dayjs } from 'dayjs'
var svgCaptcha = require('svg-captcha')
import QuickLRU from 'quick-lru'

class CaptchaService {
  map = new QuickLRU<string, string>({ maxSize: 10000 }) // 同时最多1w人注册
  // private encoder = new Encoder(
  //   '22d16230-e9fc-11eb-9c15-47cda8d6b91e',
  //   '81b61f7d-647a-431b-962c-975c6492f8ff',
  // )
  constructor() {
  }

  handler = (req: Request, res: Response) => {
    var captcha = svgCaptcha.create()
    // res.cookie('cp', this.encoder.encode(captcha.text))
    const id = uniqueId()
    res.cookie('cp', id)
    this.map.set(id, captcha.text, { maxAge: 1 * 60 * 60 * 1000 })
    res.type('svg')
    res.status(200).send(captcha.data)
  }
  clearTimer: any

  check(req: Request, text: string) {
    return text === this.map.get(req.cookies.cp)
  }
}

export const captcha = new CaptchaService()
