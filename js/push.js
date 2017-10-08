//监听消息开始
document.addEventListener("plusready", function() {
	
	var vInfo = plus.push.getClientInfo();
	//{"id":"igexin","token":"89371e52ea422aa2eb029c5600bd8668","clientid":"89371e52ea422aa2eb029c5600bd8668","appid":"pPyZWvH3Fa6PXba10aJ009","appkey":"b7dOGlNPHR7pqwUxDhpTi4"}
 
    // 监听点击消息事件
    plus.push.addEventListener("click", function(msg) {
        //alert("进入Click事件");
        //alert(msg);
        var vData = JSON.stringify(msg);
        //alert(vData);
        var vInfo = plus.push.getClientInfo();
        //alert(vInfo);
        var vInfoData = JSON.stringify(vInfo);
        //alert(vInfoData);
        // 判断是从本地创建还是离线推送的消息
        switch (msg.payload) {
            case "LocalMSG":
                outSet("点击本地创建消息启动：");
                break;
            default:
                outSet("点击离线推送消息启动：");
                break;
        }
        // 提示点击的内容
        plus.ui.alert(msg.content);
        console.log(msg.content);
    }, false);
    
    // 监听在线消息事件  推送通知的
    plus.push.addEventListener("receive", function(msg) {
    	getNum()//修改角标
        //alert("进入receive事件");
        //alert(msg);
        var vData = JSON.stringify(msg);
        //alert(vData);
        var vInfo = plus.push.getClientInfo();
        //alert(vInfo);
        var vInfoData = JSON.stringify(vInfo);
        //alert(vInfoData);
        if (msg.aps) { // Apple APNS message
            //alert("接收到在线APNS消息：");
        } else {
		var json = {"data":{"selectDatas":[{"queryMode":"custom","dataSource":"Query_WF_GetTaskAgentByUserId","queryFrom":"NAME","selectExpression":"Query_WF_GetTaskAgentByUserId","conditionParams":{"taskName":{"paramName":"taskName","paramValue":null},"loginUserId":{"paramName":"loginUserId","paramValue":"000adminUserId"},"state":{"paramName":"state","paramValue":"Complete"},"processName":{"paramName":"processName","paramValue":null},"procInstState":{"paramName":"procInstState","paramValue":null},"executionState":{"paramName":"executionState","paramValue":null}},"extraCondition":"1 = 1","recordStart":-1,"pageSize":-1}]}};
		json.data.selectDatas[0].conditionParams.loginUserId.paramValue=usedAccountInfo.userId;
		json.data.selectDatas[0].pageSize=15;
		json.data.selectDatas[0].recordStart=1;
		var jsonStr = encodeURI(JSON.stringify(json));
		$.ajax({
			  type: 'POST',
			  url: ip+"module-operation!executeOperation?moduleId=0f56b5142c5f4181820a5251be26b498",
			  data: {
				  'moduleId':'0f56b5142c5f4181820a5251be26b498',
				  'operation':'Find',
				  'ajaxRequest':'true',
				  'token':jsonStr
			  },
			  success: function(result){
				  var param = result.data.resultDatas[0].datas
				  console.log(JSON.stringify(param))
				  console.log(JSON.stringify(result.data.resultDatas[0].datas))
				  mui.openWindow({
				  	url:'listParent.html',
				  	id:'listParent',
				  	extras:{
				  		listInfo:param,
				  		status:'yiban'
				  	}
				  })
			  },
			  dataType: "json"
			});	
        }
    }, false);
}, false);


//click事件处理
function clickMsg(msg) {
	if (msg.aps) { // Apple APNS message
		return;
	}
	// 处理推送数据
	logoutPushMsg(msg);
}
//receive事件处理
function receiveMsg(msg) {
	if (msg.aps) { // Apple APNS message
		//在线aps，直接退出
		return;
	}
	if(typeof msg=='string'){
		//不符合格式的安卓推送进入receive事件中
		logoutPushMsg(JSON.parse(msg));
		return;
	}
	logoutPushMsg(msg);
}

//清空所有消息
function clearAllPush(){
    plus.push.clear();
}

//创建本地消息
function createLocalPushMsg(msg){
	if(pushFlag){
        	var options = {cover:false};
		plus.push.createMessage( msg, "", options );
	}
}


//处理推送消息内容
function logoutPushMsg( msg ) {
	var infoJson	 = null;
	if ( msg.payload ) {
		if ( typeof msg.payload =="string" ) {
			//不符合格式的透传消息，进入消息中心,不再创建本地消息
			infoJson = JSON.parse(msg.payload);
		}else{
			//透传消息，创建本地通知消息
			infoJson = msg.payload;
		}
		switch(infoJson.type){
			case "im":
//				imMessage(infoJson);
				break;
		}
		createLocalPushMsg(infoJson.content);
	}
}
/*处理聊天内容(此处暂时没有用到)
 * 因为在用户不在线的时候只是在通知栏提示用户有一小消息，当用户点击打开app的时候会自动接收消息
 */
function imMessage(message){
	var senderId = message.sender;
	var data = {
		sender: senderId,
		time: message.time,
		content: message.info
	};
	var selfView = plus.webview.getWebviewById('pages/self.html');
	// 判断消息类型
	switch (message.contentType) {
		case 'text':
			data.type="text";
			info = message.info;
			selfView.evalJS('save("'+senderId+'",'+JSON.stringify(data)+')');
			break;
		case 'image':
			data.type = "image";
			info = "[图片]";
			selfView.evalJS('downLoad("image", '+JSON.stringify(data)+')');
			break;
		case 'sound':
			data.type = "sound";
			info = "[语音]";
			selfView.evalJS('downLoad("sound", '+JSON.stringify(data)+')');
			break;
	}
	
}
