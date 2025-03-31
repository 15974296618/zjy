/*
使用方法：
注意：该脚本无破解离线功能,只是给新版115的App添加创建离线任务的方法。
1.在[Script]分组下添加下面这行配置
http-response ^http:\/\/115\.com\/lx.*$ script-path=https://raw.githubusercontent.com/15974296618/zjy/refs/heads/main/115lx.js, requires-body=true
http-response ^https:\/\/vip\.115\.com\/\?ct=order&ac=get_product_rate_sers.*$ script-path=https://raw.githubusercontent.com/15974296618/zjy/refs/heads/main/115lx.js, requires-body=true
2.[MITM]分组添加hostname = *.115.com
3.在115Aapp中通过网页打开http://115.com/lx?taskdg=1(可在记录中保存该地址打开, 也可添加下面的配置将首页的签到按钮跳转重定向到离线下载页面)
[URL Rewrite]
^https:\/\/vip\.115\.com\/\?ct=order&ac=get_product_rate_sers.*$ http://115.com/lx?taskdg=1 header
4.快速创建下载任务的快捷指令: https://www.icloud.com/shortcuts/31e3a877cec340a48192aa081e25c05e
*/

var body = $response.body;

// 拦截目标接口
if ($request.url.indexOf('ct=order&ac=get_product_rate_sers') != -1) {
    let json = JSON.parse(body);
    // 修改响应数据（根据实际需求）
    json.data.is_new_sign = false; // 示例：关闭签到提示
    body = JSON.stringify(json);
} 

// 处理离线任务页面
else {
    // 绕过客户端重定向检测
    body = body.replace("UDown", 'XXXXXXXXX');

    // 注入清空任务功能
    let clearJS = `<script type="text/javascript">
    $(function(){
        function actionSheetAction(index) {
            if (index == 4) { return; }
            $.ajax({
                url: '/web/lixian/?ct=lixian&ac=task_lists',
                dataType: 'json',
                data: {flag: index},
                type: 'POST',
                cache: false,
                success: function (r) {
                    window.location.reload();
                },
                error: function(){
                    console.log('清空失败');
                }
            });
        }
        function clearAction() { 
            OOFJS.common.actionSheet('选择清空的操作', ['清空已完成任务', '清空全部任务', '清空失败任务', '清空进行中任务'], actionSheetAction);
        }
        setTimeout(function(){OOFJS.common.addRightBarItem('清空', clearAction);}, 200);
    });
    </script>`;
    body = body.replace("</body>", clearJS + '\n</body>'); // 注入清空任务相关JS
}

$done({body});

