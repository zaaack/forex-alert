import { Request, Response } from 'express'
import crypto from 'crypto'
import http from 'http'
import { Encoder } from './encoder'
import dayjs, { Dayjs } from 'dayjs'
var svgCaptcha = require('svg-captcha')
import QuickLRU from 'quick-lru'
import { logger } from 'foy'
import { nanoid } from 'nanoid'

class CaptchaService {
  map = new QuickLRU<string, string>({ maxSize: 1000 }) // 同时最多1w人注册
  // private encoder = new Encoder(
  //   '22d16230-e9fc-11eb-9c15-47cda8d6b91e',
  //   '81b61f7d-647a-431b-962c-975c6492f8ff',
  // )
  constructor() {
  }

  handler = (req: Request, res: Response) => {
    var captcha = svgCaptcha.create()
    // res.cookie('cp', this.encoder.encode(captcha.text))
    const id = nanoid()
    res.cookie('cp', id)
    this.map.set(id + "", captcha.text)
    console.log('handle', this.map)
    res.type('svg')
    res.status(200).send(captcha.data)
  }
  clearTimer: any

  check(req: Request, text: string) {
    logger.log('captcha', req.cookies.cp, this.map, this.map.get(req.cookies.cp), text)
    let result = text.toLowerCase() === this.map.get(req.cookies.cp)?.toLowerCase()
    this.map.delete(req.cookies.cp)
    return result
  }
}

export const captcha = new CaptchaService()
