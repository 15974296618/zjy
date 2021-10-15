/*
原作者:Sunert

*****************************
中青任务安卓版 包含浏览赚&看看赚&&搜索赚
json版，请把配置文件放到同目录下，默认zqrw1.json
在环境变量export zqjson="zqrw1.json&zqrw2.json"，指定脚本执行的json文件，多账户请用&分割，不指定默认zqrw1.json
json格式如下： //用户名自己写，searchdatas：搜索赚body,startdatas：浏览赚body,lookdatas：看看赚body,每条一行
{
	"user":"夏天",
    "searchdatas":[
		"",
		"",
	],
	"startdatas":[
		"",
		"",
	],
    "lookdatas": [
		"",
		"",
	]
}
改写：jammy 20211014
改写主程序，改写支持安卓版，整合少林功夫猴搜索赚
*/

const $ = new Env("中青看点任务")

const notify = $.isNode() ? require('./sendNotify') : '';

let startArr = [], lookArr=[],searchArr=[],jsonArr=[];
let gainscore = 0, lookscore = 0, searchscore = 0;
let StartBody = [],LookBody = [], searchBody = [];

let usernmae="",zqjsons="",filename="";
let tsxx="";	//推送信息
let ists=true;	//推送开关


if  ($.isNode()){
	//配置文件读取需要执行的json
	let zqjson=process.env.zqjson||"zqrw1.json";
	if (zqjson&&zqjson.indexOf('&') == -1) {
		jsonArr.push(zqjson);
	}else if (zqjson&&zqjson.indexOf('&') > -1) {
        zqjsons = zqjson.split('&');
        console.log(`您设置了json文件名，使用"&"隔开\n`);
	}
	Object.keys(zqjsons).forEach((item) => {
        if (zqjsons[item]) {
            jsonArr.push(zqjsons[item]);
        }
    })
	/*
	const zqbody = require("./zqrw1.json");
	console.log(`您使用的是json文件模式\n`)
	startArr = zqbody.startdatas;
	lookArr = zqbody.lookdatas;
	searchArr=zqbody.searchdatas;
	username=zqbody.user;
	*/
}
else {
let startbodys = $.getdata('zqllzbody');
let lookbodys = $.getdata('zqlookStartbody');
let searchbodys = $.getdata('zqsszbody');
if (!$.isNode() && !startbodys.indexOf("&") == -1) {
    startArr.push(startbodys)
} else if (!$.isNode() && !lookbodys.indexOf("&") == -1) {
    lookArr.push(lookbodys)
} else {
    if (!$.isNode() && !startbodys.indexOf("&") > -1) {
        StartBody = startbodys.split('&');
    }
    if (!$.isNode() && !lookbodys.indexOf("&") > -1) {
        LookBody = lookbodys.split('&');
    }
    if (!$.isNode() && !searchbodys.indexOf("&") > -1) {
        searchBody = searchbodys.split('&');
    }
}
	Object.keys(StartBody).forEach((item) => {
        if (StartBody[item]) {
            startArr.push(StartBody[item])
        }
    });
    Object.keys(LookBody).forEach((item) => {
        if (LookBody[item]) {
            lookArr.push(LookBody[item])
        }
    })
	Object.keys(searchBody).forEach((item) => {
        if (searchBody[item]) {
            startArr.push(searchBody[item])
        }
    });
}
	

const zqheader={
    'device-platform': 'android',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': '1249',
    'Host': 'kandian.wkandian.com'
}

!(async () => {
	//多账户支持
	if ($.isNode()){
		if (jsonArr.length!==0){
			for (k=0;k<jsonArr.length;k++){
				filename=jsonArr[k];
				if (filename){
					$.log(`-------------------------\n🏠开始执行第${k+1}个账号任务,文件名：${filename}`);
					filename="./"+filename;
					const zqbody = require(filename);
					console.log(`您使用的是json文件模式\n`)
					startArr = zqbody.startdatas;
					lookArr = zqbody.lookdatas;
					searchArr=zqbody.searchdatas;
					username=zqbody.user;					
					await taskall();
				}
			}
			
		}
	}
	else{
		$.log(`-------------------------\n🏠本次使用v2p模式`);
		await taskall();
	}

})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

async function taskall(){
    $.log(`${username} 共提供了${startArr.length}次浏览赚任务`)
    if (startArr.length !== 0) {
		$.index=0;
        for (let i = 0; i < startArr.length; i++) {
            if (startArr[i]) {
                gainbody = startArr[i];
                $.index = i + 1;
                $.log(`-------------------------\n🏠开始浏览赚第${$.index}次任务`)
            }
            await GainStart();
        }
        console.log(`-------------------------\n\n中青看点共完成${$.index}次任务，共计获得${gainscore}个青豆，浏览赚任务全部结束`);
        tsxx+=`浏览赚共完成${$.index}次任务`+`  共计获得${gainscore}个青豆\n`;
    }

	console.log(`---休息一下，开始下一个任务。`);
	await $.wait(100000);


    $.log(`\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n${username}共提供${lookArr.length}次看看赚任务\n`)
    if (lookArr.length !== 0) {
		$.index=0;
        for (let k = 0; k < lookArr.length; k++) {
            if (lookArr[k]) {
                lookbody = lookArr[k];
                $.index = k + 1;
                $.log(`-------------------------\n🏠开始中青看点看看赚第${$.index}次任务`)
            }
            await lookStart();
        }
        console.log(`-------------------------\n\n中青看点共完成${$.index}次看看赚任务，共计获得${lookscore}个青豆，看看赚任务全部结束`);
        tsxx+=`看看赚共完成${$.index}次任务`+`  共计获得${lookscore}个青豆\n`;
    }
	
	console.log(`---休息一下，开始下一个任务。`);
	await $.wait(100000);

    console.log(`\n-------------------------\n\n${username}共提供了${searchArr.length}此搜索赚任务`);
	if (searchArr.length !== 0) {
		$.index=0;
		for (let k = 0; k < searchArr.length; k++) {
                zqsszbody1 = searchArr[k];
                console.log(`-------------------------\n🏠开始搜索赚第 ${k + 1} 次任务`)
                await sszStart();
                await $.wait(1000);
                //console.log("\n")
        }
		console.log(`-------------------------\n\n中青看点共完成${$.index}次搜索赚任务，共计获得${searchscore}个青豆，搜素赚任务全部结束`);
        tsxx+=`搜索赚共完成${$.index}次任务`+`  共计获得${searchscore}个青豆\n`;
    }	
	
	if (ists){
		if ($.isNode()){await notify.sendNotify($.name, tsxx );}
	}			
}

function GainStart() {
    return new Promise((resolve, reject) => {
        $.post(gainHost('task/browse_start.json', gainbody), async(error, resp, data) => {
		if (safeGet(data)){
            let startres = JSON.parse(data);
            if (startres.success == false) {
                let start=$.getdata('youth_start');
                if(start)
                {
                    smbody = $.getdata('youth_start').replace(gainbody + "&", "");
                    $.setdata(smbody, 'youth_start');
                    $.log(startres.message + "已自动删除")
                }
            } else {
                comstate = startres.items.comtele_state;
                if (comstate == 0) {
                    $.log("任务开始，" + startres.items.banner_id + startres.message);
                    await $.wait(10000);
                    await GainEnd()
                } else if (comstate == 1) {
                    $.log("任务:" + startres.items.banner_id + "已完成，本次跳过");
                }
            }
		}
        resolve()
        })
    })
}

function lookStart() {
    return new Promise((resolve, reject) => {
        $.post(gainHost('Nameless/adlickstart.json', lookbody), async(error, resp, data) => {
		if (safeGet(data)){
            startlk = JSON.parse(data);
            if (startlk.success == false) {
                let look=$.getdata('youth_look');
                if(look)
                {
                    smbody = $.getdata('youth_look').replace(lookbody + "&", "");
                    $.setdata(smbody, 'youth_look');
                    $.log(startlk.message + "已自动删除")
                }
            } else {
                comstate = startlk.items.comtele_state;
                if (comstate == 0) {
                    $.log("任务开始，" + startlk.items.banner_id + startlk.message);
                    for (let j = 0; j < startlk.items.see_num - startlk.items.read_num; j++) {
                        $.log("任务执行第" + parseInt(j + 1) + "次")
                        await $.wait(8000);
                        await lookstatus()
                    }
                    await $.wait(10000);
                    await lookEnd()
                } else if (comstate == 1) {
                    $.log("任务:" + startlk.items.banner_id + "已完成，本次跳过");
                }
            }
		}
            resolve()
        })
    })
}

function GainEnd() {
    return new Promise((resolve, reject) => {
        $.post(gainHost('task/browse_end.json', gainbody), (error, resp, data) => {
            let endres = JSON.parse(data);
            if (endres.success == true) {
                $.log("任务" + endres.items.banner_id + endres.message + "，恭喜获得" + endres.items.score + "个青豆");
                gainscore += parseInt(endres.items.score)
            } else {
                $.log(endres.message)
            }
            resolve()
        })
    })
}

function lookstatus() {
    return new Promise((resolve, reject) => {
        $.post(gainHost('Nameless/bannerstatus.json', lookbody), (error, resp, data) => {
            let endres = JSON.parse(data);
            if (endres.success == true) {
                $.log("任务" + endres.items.banner_id + endres.message);
            } else {
                $.log(endres.message)
            }
            resolve()
        })
    })
}

function lookEnd() {
    return new Promise((resolve, reject) => {
        $.post(gainHost('Nameless/adlickend.json', lookbody), (error, resp, data) => {
            let endres = JSON.parse(data);
            if (endres.success == true) {
                $.log("任务" + endres.items.banner_id + endres.message + "，" + endres.items.desc)
                lookscore += parseInt(endres.items.score)
            } else {
                $.log(endres.message)
            }
            resolve()
        })
    })
}

function gainHost(api, body) {
    return {
        url: 'https://kandian.wkandian.com/v5/' + api,
        headers: {
            'User-Agent': 'okhttp/3.12.2',
            'Host': 'kandian.wkandian.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'device-platform':'android'
        },
        body: body
    }
}

//搜索赚激活
function sszStart(timeout = 0) {
    return new Promise((resolve) => {
        let url = {
            url : 'https://kandian.wkandian.com/v5/Sousuo/playStart.json',
            headers : zqheader,
            body : zqsszbody1,}
        $.post(url, async (err, resp, data) => {
            try {
				if (safeGet(data)){
                const result = JSON.parse(data)
                if(result.success === true ){
                    console.log('激活搜索赚任务成功')
                    comstate = result.items.comtele_state
                    if(comstate === 1){
                        console.log('任务: '+ result.items.task_id+'已完成，跳过')
                    }else {
                        $.log("任务开始，" + result.items.task_id + result.message);
                        for(let i = 0;i<4;i++){
                            await $.wait(2000);
                        await look()
                        await $.wait(10000);
                        await look()
                        await $.wait(10000);
                        await end()
                        }

                    }
                    }

                else{
                    console.log('\n激活搜索赚任务失败')
                    smbody = $.getdata('zqsszbody').replace(zqsszbody1 + "&", "");
                    $.setdata(smbody, 'zqsszbody');
                    console.log("该搜索赚任务已自动删除")
                }
				}
            } catch (e) {
            } finally {
                resolve()
            }
            },timeout)
    })
}

function look(timeout = 0) {
    return new Promise((resolve) => {
        let url = {
            url : 'https://kandian.wkandian.com/v5/Sousuo/playStatus.json',
            headers : zqheader,
            body : zqsszbody1,}
        $.post(url, async (err, resp, data) => {
            try {

                const result = JSON.parse(data)
                console.log(result)
                // if(result.items.score !== "undefined" ){
                //     console.log('\n搜索赚获得：'+result.items.score + '金币')
                // }else{
                //     console.log('\n领取奖励失败')
                // }				
            } catch (e) {
            } finally {
                resolve()
            }
            },timeout)
    })
}
//搜索赚奖励
function end(timeout = 0) {
    return new Promise((resolve) => {
        let url = {
            url : 'https://kandian.wkandian.com/v5/Sousuo/playEnd.json',
            headers : zqheader,
            body : zqsszbody1,}
        $.post(url, async (err, resp, data) => {
            try {

                const result = JSON.parse(data)
                if(result.items.score !== "undefined" ){
                    console.log('\n搜索赚获得：'+result.items.score + '金币');
					searchscore += parseInt(result.items.score);
                }else{
                    console.log('\n领取奖励失败')
                }
            } catch (e) {
            } finally {
                resolve()
            }
            },timeout)
    })
}


function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}