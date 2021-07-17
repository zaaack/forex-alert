import axios from 'axios'
export interface Props {
  cropid: string
  secret: string
  agentid: string
  touser: string[]
}
export const conf={
    cropid: 'ww106deabb766e0926',
    secret: 'taL6rkN_udt4R5UVRlzTjuavIDrLkVXKGkjpd5WTSIM',
    agentid: '1000003',
    touser: ['Zack']
}
class WxPush {
    constructor(private props: Props) {
    }
    private async fetchAccessToken() {
        let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.props.cropid}&corpsecret=${this.props.secret}`)
        if (!res.data.access_token) {
            throw new Error(`invalid access token(${res.data.errcode} ${res.data.errmsg})`)
        }
        return res.data.access_token
    }
    async send(msg: string) {
        let at=await this.fetchAccessToken()
        await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${at}`, {
            "touser" : this.props.touser.join('|'),
            "msgtype" : "text",
            "agentid" : this.props.agentid,
            "text" : {
                "content" : msg
            },
            "safe":0,
            "enable_id_trans": 0,
            "enable_duplicate_check": 1,
            "duplicate_check_interval": 60
         })
    }
}

export const push = new WxPush(conf)
