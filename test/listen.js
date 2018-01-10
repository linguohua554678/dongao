var video;
var listenView;
var nextPlayFlag = true;
//讲义美观评分
var beautifulScore = 5;
//讲师讲课吸引度评分
var attractScore = 5;
//课程和力度评分
var reasonableScore = 5;
/**
 * @description		听课页面js逻辑
 * @author 			zwr
 * @date:				2016-6-15
 * @modify:
 * @version 			1.0
 */
define(function(require, exports, module) {
    require('./swfobject');
    var tool = require('./tool');
    video = require('./video.js');
    function bindFirst(){
        $.getJSON('https://esp-resource-service.beta.101.com/v1.0/groupkey', function (json) {
            var lst = eval(json);
            $("#first").html("");
            for (i = 0; i < lst.length; i++) {
                var tname = lst[i].name;
                var tid = lst[i].id;
                $("#first").append("<option value='" + tid + "'>" + tname + "</option>");
            }
        });
    };
    function bindSecond(id){
        $.getJSON('https://esp-resource-service.beta.101.com/v1.0/groupitem?id='+id, function (json) {
            var lst = eval(json);
            $("#second").html("");
            for (i = 0; i < lst.length; i++) {
                var tname = lst[i].name;
                var tid = lst[i].id;
                $("#second").append("<option value='" + tid + "'>" + tname + "</option>");
            }
        });
    };
    function init(){
       var  initType = "big";
        //请求服务获取播放参数
        listenView.init({
            pageType:initType,
            url:"https://esp-resource-service.beta.101.com/v1.0/lecture_content?id="+$("#requestURL").val(),
            flash:'DongAoPlayer'
        });
    }
    //听课页面对象
    listenView = {
        //页面参数配置
        conf:{
            //初始化flash请求路径
            url:'',
            //初始化flashname
            flash:'',
            //初始化大小屏类型
            initPageType:'',
            //大小屏幕配置
            screen:{
                moveflog : true,//true为可拖拽区域滚动条移动不新设置属性；false为恢复视频原位置；
                videoType : ''
            }
        },
        //页面数据
        data:{
            curHandout:{},//当前播放的讲义
            flag: 0, //点击知识点 双击讲义的时候，标识，存储时间；
            isHead: true,//是片头
            curWindow:''
        },
        //初始化方法
        init:function(param){
            if(param && param.pageType && param.flash && param.url){
                listenView.conf.initPageType = param.pageType;
                listenView.conf.flash = param.flash;
                listenView.conf.url = param.url;
                listenView.data.curWindow = param.pageType;
                this.onFun();
                //提问，设置回答发邮件通知
                $('.email_icon').on('click',function(){
                    $(this).toggleClass('email_icon_act')
                });
                $.each(this.inits,function(i,n){
                    n();
                });
                /*没有flash 插件的元素
                 * 在没有flash 插件的时候，复写这四个方法，防止页面保存
                 * */
                if($('.fla-no').is(':visible')){
                    video.playVideo = function(){};
                    video.pauseVideo = function(){};
                    video.getVideoStatus = function(){};
                    video.skipTitleAndSeek = function(){};
                }
            }
        },
        inits:{
            //初始化数据
            initDate:function(){
                //三分屏讲义最大高度
                listenView.data.threeHandoutMaxHeight = Math.max($(window).height() - 181,480);
                //初始化弹窗
                $('.lister_pop_box').css({'margin-top':($(window).height()-480)/2});
            },
            //初始化页面
            initPage:function(){
                listenView.handler.drawPage(listenView.conf.initPageType);
            },
            //初始化播放器
            initPlay:function(){
                //初始化
                video.init({
                    url:listenView.conf.url,
                    flash:listenView.conf.flash
                });
                //视频播放完毕
                video.forFlash.flashFinishPlayVideo = function(param){
                    var play = $('.playing');
                    play.removeClass('playing select_listen');
                    $(" p:first",play).removeClass('little_p').children('.lecture_title').remove();
                }
                //flash时时调用每100毫秒
                video.forFlash.mediaRefresh = function(param){
                    if (listenView.data.flag != 0 && (listenView.data.flag - param[1]) > 0
                        && (listenView.data.flag - param[1]) < 10) {
                        //有flag 标识 并且小于 10 s
                    } else {
                        listenView.data.flag = 0;
                        listenView.handler.initHandout(param);
                    }
                }
                //flash知识点实际时间
                video.forFlash.setRealTime = function (param) {
                    listenView.data.flag = param[1];
                    listenView.handler.initHandout(param);
                }
                //flash大小改变
                video.forFlash.falshSizeChange = function(param){
                    if(param[1] === video.menu.bigVideo){
                        listenView.data.curWindow = 'big';
                        listenView.handler.drawPage('big');
                    }else if(param[1] === video.menu.threeVideo){
                        listenView.data.curWindow = 'three';
                        listenView.handler.drawPage('three');
                    }
                }
                //flash初始化完毕
                video.forFlash.playerIsReady = function(param){
                    if(listenView.conf.screen.videoType === video.menu.bigVideo){
                        //显示播放列表
                        $('#video_list').show();
                    }
                    //初始化视频大小类型
                    video.changeVideoType(listenView.conf.screen.videoType);
                }

            }
        },
        //页面处理事件工具类
        handler: {
            //改变页面布局
            drawPage: function (type) {
                listenView.data.small = false;
                if (type.indexOf('big') > -1) {
                    if(listenView.isbig === true){
                        return false;
                    }
                    listenView.isbig = true;
                    //设置小窗为可滚动
                    listenView.conf.screen.moveflog = true;
                    //设置视频大小
                    $('#videoContainer').css({width: 1180, height: 525});
                    //改变播放类型为大视频
                    try {
                        video.changeVideoType(video.menu.bigVideo);
                        //显示播放列表
                        $('#video_list').show();
                    } catch (e) {
                        listenView.conf.screen.videoType = video.menu.bigVideo;
                    }
                    if(type === 'big'){
                        $('html,body').scrollTop(1);
                    }
                } else {
                    //隐藏播放列表
                    $('#video_list').hide();
                    listenView.isbig = false;
                }
                //大屏
                if (type == 'big') {
                    //需要缓存视频播放格式为大视频
                    putCacheInitPlayType("big");
                    $('#threeScreen').hide();
                    $('#bigHandoutTitle').show();
                    $('#threeHandoutTitle').hide();
                    $('.B_fixed').removeClass('B_fixed_three');
                    //讲义设置
                    /*$('.Nlist_left').css({
                     width: '65%'
                     });*/
                    $('#lecture').attr('style', '').css('overflow-y', 'hidden');
                    /*$('.right_big').show();*/
                    $('.three_left_down').hide();

                    $('.warp').removeClass('warp-thr');//三分屏 全屏
                    if(!!listenView.conf.ulFlag){
                        //如果大视频的  答疑 试题 笔记
                        $('.Nlist_left').css({
                            width: $('.Nlist_left').parent().width() - 20 + 'px'
                        });
                    }else{
                        $('.right_big').show();
                        $('.Nlist_left').css({
                            width: '65%'
                        });
                    }
                    listenView.data.threeScreeLock = false;
                }
                //三分屏
                else if (type == 'three') {
                    //缓存视频播放格式为三分屏
                    putCacheInitPlayType("three");
                    listenView.data.threeScreeLock = true;
                    var lecture = $('#lecture');
                    lecture.css('overflow-y', 'auto');
                    $('.warp').addClass('warp-thr');//三分屏 全屏
                    listenView.conf.screen.moveflog = false;
                    //设置视频大小
                    $('#videoContainer').css({width: 455, height: 280});
                    //设置flash大小类型
                    try {
                        video.changeVideoType(video.menu.threeVideo);
                    } catch (e) {
                        listenView.conf.screen.videoType = video.menu.threeVideo;
                    }
                    $('#bigHandoutTitle').hide();
                    $('#threeHandoutTitle').show();
                    $('.B_fixed').addClass('B_fixed_three');
                    $('#threeScreen').show();
                    //讲义设置
                    $('.Nlist_left').css({
                        width: function () {
                            return $('#bigScreen').width() - 515;
                        }
                    });
                    $('#lecture').css('height', listenView.data.threeHandoutMaxHeight);
                    $('.right_big').hide();
                    $('.three_left_down').show();
                    //初始化左侧选项卡高度
                    $('#three_left_tab_panl .text').each(function () {
                        var height = $(window).height() - $('#three_left_tab_panl .text:first').offset().top - 20;
                        height = Math.max(height, 183);
                        if ($(this).height() > height) {
                            $(this).css({height: height, 'overflow-y': 'auto'})
                        }
                    });
                    //设置视频悬浮右侧边
                    $('#box').css({width: 'auto', position: "static"});
                    //显示视频title
                    $('.audio_title').hide();
                    if($('.playing:first').length > 0){
                        lecture.animate({scrollTop:$('.playing:first').offset().top+lecture.scrollTop()-lecture.offset().top}, 100);
                    }
                } else if (type == 'smalltobig') {
                    //设置视频悬浮右侧边
                    $('#box').css({width: 'auto', position: "static"});
                    //显示视频title
                    $('.audio_title').hide();
                } else if (type == 'small') {
                    listenView.data.small = true;
                    //设置flash大小类型
                    try {
                        video.changeVideoType(video.menu.smallVideo);
                        listenView.conf.screen.videoType = video.menu.smallVideo;
                    } catch (e) {
                        listenView.conf.screen.videoType = video.menu.smallVideo;
                    }
                    //设置视频大小
                    $('#videoContainer').css({width: 400, height: 225});
                    //设置视频悬浮右侧边
                    $('#box').css({
                        width: 400,
                        position: "fixed",
                        bottom: 40,
                        right: 10,
                        left: "inherit",
                        top: "inherit"
                    });
                    //显示视频title
                    $('.audio_title').show();
                    //弹框
                    listenView.handler.dragBox($('#box'));
                }
                //关闭
                else if (type == 'smallclose') {
                    listenView.handler.drawPage('smalltobig');
                    $(document).scrollTop(0);
                }
            },
            //初始化讲义位置
            initHandout: function (param) {
                var lects = $('#lecture .section');
                lects.each(function(i,n){
                    if(Math.round(parseTime2Second($(n).attr('time'))) >param[1]){
                        listenView.handler.setCurHandout($(n).prev());
                        return false;
                    }else if(i === lects.length-1){
                        listenView.handler.setCurHandout($(n));
                    }
                });
                var $cataBig = $('#video_list'), //大屏目录
                    $cataThr = $('.listen_course_list'), //三分屏目录
                    $activi = $cataBig.find('[time]'); //大屏选知识点
                if($activi.length == 0){//大屏目录q
                    $activi = $cataThr.find('[time]');
                }
                $activi.each(function(i,n){
                    if(Math.round(parseTime2Second($(n).attr('time'))) >param[1]){
                        if(!$($activi[i-1]).hasClass('activity')){
                            $cataBig.find('.activity').removeClass('activity cur_play');//清空选中的
                            $cataBig.find('.cur_play').removeClass('cur_play activity');//清空选中的
                            $cataThr.find('.cur_play').removeClass('cur_play activity');//清空选中的
                            $($activi[i-1]).addClass('activity cur_play'); //大屏
                            $cataThr.find('[time="'+$($activi[i-1]).attr('time')+'"]:last').addClass('cur_play cur_play');//三分屏 根据时间选中
                        }
                        return false;
                    }else if(i === $activi.length-1){
                        if(!$($activi[i]).hasClass('activity')){
                            $cataBig.find('.activity').removeClass('activity cur_play');//清空选中的
                            $cataBig.find('.cur_play').removeClass('cur_play activity');//清空选中的
                            $cataThr.find('.cur_play').removeClass('cur_play activity');//清空选中的
                            $(n).addClass('activity cur_play'); //大屏
                            $cataThr.find('[time="'+$(n).attr('time')+'"]:last').addClass('cur_play cur_play');//三分屏 根据时间选中
                        }
                    }
                });
            },
            //视频调整后设置对应讲义
            setCurHandout: function (type) {
                if(!type.hasClass('playing')){
                    var pre = type.addClass('playing select_listen').siblings('.playing').removeClass('playing select_listen');
                    $(" p:first", pre).removeClass('little_p').children('.lecture_title').remove();
                    $(" p:first", type).addClass('little_p').prepend('<span class="iconfont lecture_title"></span>');
                    listenView.data.curLecture = type;
                    if(listenView.data.small){
                        $('html,body').animate({scrollTop:type.offset().top}, 100);
                    }else{
                        var lecture = $('#lecture');
                        lecture.animate({scrollTop: type.offset().top+lecture.scrollTop() - lecture.offset().top}, 100);
                    }
                    /*
                     * 回选目录列表
                     * video_list 大屏
                     * listen_course_list 三分屏
                     * */
                    /*var $cataBig = $('#video_list'), //大屏目录
                     $cataThr = $('.listen_course_list'); //三分屏目录
                     $cataBig.find('.activity').removeClass('activity');	//清空选中的
                     $cataBig.find('[time="'+type.attr('time')+'"]').addClass('activity'); //根据时间选中
                     $cataThr.find('.cur_play').removeClass('cur_play'); //清空选中的
                     $cataThr.find('[time="'+type.attr('time')+'"]').addClass('cur_play'); //根据时间选中
                     */
                }
            },
            //开启弹窗
            //0：题 1：详细  2：笔记  3：针对该题提问  4:删除笔记  5：针对该题提问无答疑 6：提问成功  7:提问  8：提问无答疑
            showBox: function (type) {
                video.pauseVideo();
                if (type === 4) {
                    //弹起遮罩层
                    tool.showMaskSco({ele: $('.cancelAsk')});
                } else {
                    if(type>4){
                        --type;
                    }
                    if (type == 0) {
                        //听完课程去做题的页面展示
                        $('.question .pop_box_content>p:first,.question .pop_box_content>div:first').show();
                        $('.question .pop_box_content>p:first').addClass('show');
                    }
                    //展示弹窗
                    $('.lister_pop_box').show().children(':eq(' + type + ')').show().siblings().hide();
                    //弹起遮罩层
                    tool.showMask({ele: $('.lister_pop_box')});
                }
            },
            //关闭弹窗
            closeBox: function () {
                video.playVideo();
                //隐藏遮罩层
                tool.hideMask();
                //隐藏弹窗
                $('.lister_pop_box').hide();
            },
            //视屏窗口拖拽
            dragBox: function (box) {
                var title = box.children('div:first');
                var disX = 0, disY = 0;
                var posX = 0, posY = 0;
                var maxW, maxH;
                title.off('mousedown').on('mousedown', function (event) {
                    if ($(event.target).hasClass('audio_title_img') || event.target.tagName.toLowerCase() == 'img') {
                        return false;
                    }
                    /* 判断是否是已经开始播放，如果没有开始播放 ，则说明目前是 正在播放片头*/
                    if($('.fla-no').is(':visible') || (video.getVideoStatus() != 'play' && listenView.data.isHead == true)){
                        //正在播放片头 设置标识 并且不暂停
                        listenView.data.isHead = true;
                    }else{
                        //不是片头，暂停播放
                        video.pauseVideo();
                        listenView.data.isHead = false;//去掉片头的标识
                    }
                    var event = event || window.event;
                    disX = event.offsetX;
                    disY = event.offsetY;
                    maxW = $(window).width() - box.width() - 4;
                    maxH = $(window).height() - box.find('.audio_title').height() - box.find('#container').height() - 4;
                    $(document).on({
                        mousemove: function (event) {
                            var event = event || window.event;
                            posX = event.clientX - disX;
                            posY = event.clientY - disY;
                            posX = Math.max(posX, 0);
                            posY = Math.max(posY, 0);
                            posX = Math.min(posX, maxW);
                            posY = Math.min(posY, maxH);
                            box.css({
                                left: posX,
                                top: posY,
                                right: 'initial',
                                margin: "0"
                            });
                        },
                        mouseup: function () {
                            /*判断是否是已经开始播放，如果没有开始播放 ，则说明目前是 正在播放片头*/
                            if($('.fla-no').is(':visible') || (video.getVideoStatus() != 'play' && listenView.data.isHead == true)){
                                //正在播放片头 设置标识 并且不暂停
                                listenView.data.isHead = true;
                            }else{
                                //不是片头，开始播放
                                video.playVideo();
                                listenView.data.isHead = false;//去掉片头的标识
                            }
                            $(document).off('mousemove');
                            $(document).off('mouseup');
                        }
                    });
                });
            },
            //编写笔记绑定事件
            editNote: function (_this) {
                kpName = _this.attr("name");
                if(kpName == undefined || kpName == 'undefined'){
                    kpName = "";
                }
                //获取笔记框html
                var sectionid = _this.parent().parent().attr('id'),
                    box = listenView.handler.getNoteBoxHtml({
                        sectionid:sectionid,
                        action:'add',
                        title:kpName,
                        hanConId:_this.val()
                    });
                //var before = _this.parent().prev();
                /*if(before.hasClass('que_answer')){
                 before.before(box);
                 }else{
                 before.after(box);
                 }*/
                tool.showMaskSco({
                    ele: box,
                    pop: '.editQues',
                    callback: function () {
                        //编写/修改笔记行内框-保存按钮
                        $('.editQues .p_sure').off().on('click', function () {
                            //video.playVideo();
                            listenView.handler.noteBoxSure($(this), sectionid);
                        });
                        //编写/修改笔记行内框-取消按钮/关闭按钮
                        $('.editQues .close,.editQues .p_concel').off().on('click', function () {
                            video.playVideo();
                            listenView.handler.noteBoxCanl($(this));
                        });
                        $('.editQues .inp_area').off().on({
                            'input propertychange': function () {
                                var $this = $(this),
                                    val = this.value;
                                $('.text-area-len label').html(500 - val.length);
                                /*if (val.length > 500) {
                                 this.value = val.substring(0, 500);
                                 $('.text-area-len label').html(0);
                                 }*/
                            }
                        });
                        $('.editQues').on('click','.erro_SH',function(){
                            $(this).parent().remove();
                            $(".Gexa_span").html($(".load_imgD").length);
                        });
                        listenView.dragBox($('.editQues'));
                    }
                })
                _this.hide().next().show();
                //_this.off().addClass('btn_gray');
            },
            //获取行内笔记框html
            getNoteBoxHtml:function(param){
                /*var box = '\
                 <div class="note_box">\
                 <div class="note_box_title clearfix">\
                 <span class="fl">编写笔记</span>\
                 <span class="fr note_box_close" action="'+param.action+'" sectionid="'+param.sectionid+'">关闭</span>\
                 </div>\
                 <div class="note_box_content">\
                 <div class="note_box_content_title ">\
                 <span>标题：</span>\
                 <input type="text" maxlength="30" value="'+(param.title || '' )+'"/>\
                 <b>（30个字符以内）</b>\
                 <p class="register_tip_err clearfix">\
                 <span class="register_tip_icon register_tip_icon_error"></span>\
                 <span class="register_tip_info">标题不能为空</span>\
                 </p>\
                 </div>\
                 <div class="note_box_content_content clearfix">\
                 <span class="fl">内容：</span>\
                 <textarea class="fl">'+(param.content || '')+'</textarea>\
                 <p class="register_tip_err clearfix fl">\
                 <span class="register_tip_icon register_tip_icon_error"></span>\
                 <span class="register_tip_info">内容不能为空</span>\
                 </p>\
                 </div>\
                 </div>\
                 <div class="note_box_footer clearfix">\
                 <div class="note_box_btn_canl" action="'+param.action+'" sectionid="'+param.sectionid+'">取&nbsp;消</div>\
                 <div id="'+param.noteId+'" class="note_box_btn_save" value="'+param.hanConId+'" action="'+param.action+'" sectionid="'+param.sectionid+'">保&nbsp;存</div>\
                 </div>\
                 </div>';*/
                var noteArr =  ['<div class="pop pop_box_content editQues">',
                    '        <div class="pop_title">',
                    '            <span class="pop_title_tip font16">'+(param.action == 'add'?'编写笔记':'修改笔记')+'</span>',
                    '            <div class="close" action="' + param.action + '" sectionid="' + param.sectionid + '"></div>',
                    '        </div>',
                    '        <div class="pop_container">',
                    '            <div class="pop_content clearfix">',
                    '                <div class="v_show mart20 clearfix">',
                    '                <div class="clearfix">',
                    '                    <div class="inp_label inp_label_tit">标题：</div>',
                    '                    <span class="tit_info fr">30个字符以内</span>',
                    '                </div>',
                    '                    <input id="title_text" class="ba_bor inp_text" maxlength="30" value="' + (param.title || '') + '" type="text">',
                    '                </div>',
                    '                <div class="mart16 clearfix">',
                    '                <div class="clearfix">',
                    '                    <div class="inp_label inp_label_tit">内容：</div>',
                    '                    <span class="text-area-len fr">还可输入<label>500</label>个字</span>',
                    '                </div>',
                    '                    <textarea id="content_text" class="ba_bor inp_area">' + (param.content || '') + '</textarea>',
                    '                </div>',
                    '            </div>',
                    '			<div class="">',
                    '				<div class="exa_upload clearfix">',
                    '					<p class="Bexa_p">添加图片：</p>',
                    '					<p class="Gexa_p"><span class="Gexa_span">0</span>/3，每张图片文件小于4M，仅支持JPG、PNG、JPEG、BMP格式。</p>',
                    '				</div>',
                    '				<div class="mr15 clearfix">',
                    '					<div class="ulL_img">',
                    '						<img src="'+rp + rv +'/static/questions/images/jiahao.png" class="fil_img">',
                    '						<form id="picForm"  method="post"  action="'+basePath+'/note/uploadNotePic" enctype="multipart/form-data">',
                    '						    <input type="file" class="fil_ex" name="picFile" id="doc" accept="image/jpeg,image/jpg,image/bmp,image/png">',
                    '						</form >',
                    '					</div>',
                    '					<div id="localImag" class="fl">'];
                //加载笔记上传的图片
                if(param.imglist && param.imglist.length>0){
                    $.each(param.imglist,function(i){
                        var img = param.imglist[i];
                        noteArr.push('<div class="load_imgD fl">',
                            '   <div class="erro_SH hide">',
                            '	    <img class="load_cha" src="'+rp+rv+'/static/questions/images/cha.png">',
                            '       <div class="load_zhe"></div>',
                            '   </div>',
                            '   <img style="display: block; width: 36px; height: 36px;" src="'+img+'" class="load_pic">',
                            '</div>');
                    });
                }

                noteArr.push('					</div>',
                    '					<p class="erro_ti">',
                    '						<span class="three_pic">最多可添加3张图片</span>',
                    '						<span style="display:none;">上传图片文件请在4M以内</span>',
                    '					</p>',
                    '				</div>',
                    '			</div>',
                    '        </div>',
                    '        <div class="pop_bottom mart0 clearfix">',
                    '            <div class="pop_btn p_concel fl" action="' + param.action + '" sectionid="' + param.sectionid + '">取&nbsp;消</div>',
                    '            <div id="'+param.noteId+'" class="pop_btn p_sure fl" action="' + param.action + '" value="'+param.hanConId+'" sectionid="' + param.sectionid + '">确&nbsp;定</div>',
                    '        </div>',
                    '    </div>');
                return noteArr.join("");
            },
            //获取panal空时html
            getPanalNoHtml:function(){
                return '\
					<div class="panal_no_content">\
						<img src = "'+rp+rv+'/static/course/img/listen_panal_no_content.png"/>\
						<p>未发现本讲的相关内容</p>\
					</div>';
            },
            //行内框添加笔记确认事件
            noteBoxSure: function (_this, id) {
                var content = _this.parent().prev(),
                    infos = [];
                content.find('.pop_content input,textarea').each(function () {
                    if ($(this).val() == '') {
                        $(this).addClass('border_red');
                    }else{
                        infos.push($(this).val());
                        $(this).siblings('.register_tip_err').hide();
                    }
                });
                //添加笔记校验通过
                if(infos.length === 3 || infos.length===2){
                    //title空
                    if(infos[0].trim()==""){
                        DA.showFailMask("笔记标题不能为空！");
                        return;
                    }
                    //内容空
                    if(infos[1].trim()==""){
                        DA.showFailMask("笔记内容不能为空！")
                        return;
                    }
                    if(infos[1].trim().length>500){
                        //DA.showFailMask("笔记内容不能超过500字");
                        content.find('textarea').addClass('border_red');
                        return;
                    }
                    /******调用新增笔记接口保存数据库start********/
                    var tempNoteId = null;
                    var courseId = $("#courseId").val();
                    var lectrueId = $("#lectureId").val();
                    var hanConId = _this.attr("value");
                    var noteId = _this.attr("id");
                    var title = infos[0];
                    var playedTime = Math.round(video.getCurrentVideoTime());
                    var sSubjectId = $('#sSubjectId').val();
                    playedTime = formatTime(playedTime);
                    var imgSrcs="";
                    $("#localImag").find(".load_pic").each(function(i){
                        imgSrcs += $(this).attr("src")+",";
                    });
                    if (imgSrcs.length > 0) {
                        imgSrcs = imgSrcs.substr(0, imgSrcs.length - 1);
                    }
                    if(hanConId == 'undefined' || hanConId == undefined){
                        hanConId = null;
                    }
                    if(noteId == 'undefined' || noteId == undefined){
                        noteId = null;
                    }
                    $.ajax({
                        url: basePath+'/note/add',
                        type: 'POST',
                        dataType: 'JSON',
                        async: false,
                        data: {
                            'id':noteId,
                            'courseId':courseId,
                            'lectrueId':lectrueId,
                            'hanConId':hanConId,
                            'content':infos[1],
                            'coursewareTime':playedTime,
                            'title':title,
                            'sSubjectId':sSubjectId,
                            'picPaths':imgSrcs
                        },
                        error: function() {  },
                        success: function(result) {
                            if(result.success){
                                //设置笔记id值
                                tempNoteId = result.obj;

                            }else{
                                DA.showFailMask(result.msg);
                            }
                        }
                    });
                    /******调用新增笔记接口保存数据库end********/
                    var sectionid = id;
                    var noteImgs="";
                    if($("#localImag").find(".load_pic").length>0){
                        noteImgs += '<div class="small_pic clearfix">';
                        $("#localImag").find(".load_pic").each(function(i){
                            var attr = $(this).attr("src");
                            noteImgs += '<img src="'+attr+'" class="small_img">&nbsp;';
                        });
                        noteImgs += '</div>'
                    }
                    //新增功能
                    if(_this.attr('action') === 'add'){
                        //笔记列表增加笔记
                        var noteTitle = infos[0].length>20?infos[0].substring(0,18)+"...":infos[0];
                        var note = '\
						<li class="clearfix" id="'+tempNoteId+'" sectionid="'+sectionid+'">\
							<p class="fl note_detail_text" title="'+infos[0]+'">'+noteTitle+'</p>\
							<p class="fr clearfix note_icon_btns">\
								<span class="note_update_btn"></span>\
								<span class="note_delete_btn"></span>\
							</p>\
						</li>';
                        var noteList = $('.listen_note_panl>.note_list');
                        if(noteList.length > 0){
                            noteList.prepend(note);
                        }else{
                            $('.listen_note_panl').html($('<ul>',{
                                html:note
                            }).addClass('note_list'));
                        }
                        //讲义增加笔记
                        note = '\
						<div class="note_detail" sectionid="'+sectionid+'">\
							<div class="note_detail_title">\
								<span class="icon">学习笔记</span>\
								<!--<a  value="'+tempNoteId+'" class="note_detail_update_btn">修改</a>-->\
								<!--<span>|</span>-->\
								<a id="deleteNoteBtn" value="'+tempNoteId+'" class="note_delete_btn"></a>\
							</div>\
							<div class="note_detail_content">\
								<p>'+infos[0]+'</p>\
								<p>'+infos[1]+'</p>'+noteImgs+'\
							</div>\
						</div>';
                        $('#' + id).find('.chico').before(note);
                        $('#' + id).find('.chico li:eq(3)').hide().next().show().attr('value',tempNoteId);
                        //content.parent().after(note);
                        //content.parent().remove();
                        tool.hideMaskSco();
                        video.playVideo();
                    }
                    //修改功能
                    else if(_this.attr('action') === 'update'){
                        //移除框
                        //content.parent().remove();
                        tool.hideMaskSco();
                        video.playVideo();
                        //开始修改值
                        $('#bigScreen [sectionid='+sectionid+']').each(function(){
                            if($(this).hasClass('note_detail')){
                                $('p:first',$(this)).html(infos[0]);
                                $('p:last',$(this)).html(infos[1]);
                                $('p:last',$(this)).next().remove();
                                $('p:last',$(this)).after(noteImgs);
                                $(this).show();
                            }else{
                                var noteTitle = infos[0].length>20?infos[0].substring(0,18)+"...":infos[0];
                                $(this).children(':first').attr("title",infos[0]);
                                $(this).children(':first').html(noteTitle);

                            }
                        });
                    }
                }
            },
            //删除笔记
            noteDelte:function(_this){
                //删除数据库该笔记
                $.ajax({
                    url: basePath+'/note/del',
                    type: 'POST',
                    dataType: 'JSON',
                    async: false,
                    data: {
                        'id':$("#deleteNoteBtn").val()
                    },
                    error: function() {  },
                    success: function(result) {
                        if(result.success){

                        }
                    }
                });
                $('#bigScreen [sectionid='+listenView.data.deleteNoteSectionId+']').remove();
                /*$('#'+listenView.data.deleteNoteSectionId+' .chico .btn_gray').removeClass('btn_gray').on('click',function(){
                 video.pauseVideo();
                 listenView.handler.editNote($(this));
                 });*/
                $('#' + listenView.data.deleteNoteSectionId + ' .chico li:eq(3)').show().next().hide();
                if($('.note_list>li').length === 0){
                    $('.listen_note_panl').html(listenView.handler.getPanalNoHtml());
                }
                listenView.handler.closeBox();
            },
            //行内添加笔记取消事件
            noteBoxCanl:function(_this){
                var section = $('#'+_this.attr('sectionid'));
                var box = section.children('.note_box');
                if(_this.attr('action') === 'add'){
                    /*section.children('.chico').children('.btn_gray').removeClass('btn_gray').on('click',function(){
                     video.pauseVideo();
                     listenView.handler.editNote($(this));
                     });*/
                    section.children('.chico').children('li:last').hide().prev().show()
                }else if(_this.attr('action') === 'update'){
                    section.children('.note_detail').show();
                }
                //box.remove();
                tool.hideMaskSco();
            },
            //行内修改笔记
            noteLineUpdate:function(_this){
                var parent = _this.parent();
                var imgArr = [];
                var imgs = parent.prevAll('.note_detail').find('img');
                if(imgs!=null){
                    imgs.each(function(i){
                        imgArr.push($(this).attr("src"));
                    });
                }
                var param = {
                    action:'update',
                    noteId:_this.attr("value"),
                    sectionid: parent.prevAll('.note_detail').attr('sectionid'),
                    title: parent.prevAll('.note_detail').find('.note_detail_content').children(':first').html(),
                    content: parent.prevAll('.note_detail').find('.note_detail_content').children('p:eq(1)').html(),
                    imglist:imgArr
                };
                var box = listenView.handler.getNoteBoxHtml(param);
                //parent.parent().after(box);
                tool.showMaskSco({
                    ele: box,
                    pop: '.editQues',
                    callback: function () {
                        //编写/修改笔记行内框-保存按钮
                        $('.editQues .p_sure').off().on('click', function () {

                            listenView.handler.noteBoxSure($(this), param.sectionid);
                        });
                        if(!tool.validation.isNull(param.content)){
                            $('.editQues .text-area-len label').html(500 - param.content.length);
                        }
                        //编写/修改笔记行内框-取消按钮/关闭按钮
                        $('.editQues .close,.editQues .p_concel').off().on('click', function () {
                            video.playVideo();
                            listenView.handler.noteBoxCanl($(this));
                        });
                        $('.editQues .inp_area').off().on({
                            'input propertychange': function () {
                                var $this = $(this)
                                    ,$limt = $('.text-area-len');
                                if($limt.length > 0){
                                    $limt.find('label').html(500 - this.value.length);
                                }
                            }
                        });
                        //删除图片
                        $('.editQues').on('click','.erro_SH',function(){
                            $(this).parent().remove();
                            $(".Gexa_span").html($(".load_imgD").length);
                        });
                        //图片个数
                        $(".Gexa_span").html($(".load_imgD").length);
                        listenView.dragBox($('.editQues'));
                    }
                });
                parent.prevAll('.note_detail').hide();
            },
            //icon修改笔记
            noteIconUpdate:function(_this){
                listenView.data.deleteNoteSectionId = _this.parent().parent().attr('sectionid');
                //listenView.handler.showBox(2);
                var note = $('#'+listenView.data.deleteNoteSectionId+' div[sectionid='+listenView.data.deleteNoteSectionId+']');
                var imgArr = [];
                var imgs = note.find('img');
                if(imgs!=null){
                    imgs.each(function(i){
                        imgArr.push($(this).attr("src"));
                    });
                }
                var param = {
                    action: 'update',
                    noteId: _this.parent().parent().attr('id'),
                    sectionid: listenView.data.deleteNoteSectionId,
                    title: note.find('p:first').html(),
                    content: note.find('p:last').html(),
                    imglist:imgArr
                };
                var title = $('#note_pop_box_title');
                //var noteId = _this.parent().parent().attr('id');
                var box = listenView.handler.getNoteBoxHtml(param);
                tool.showMaskSco({
                    ele: box,
                    pop: '.editQues',
                    callback: function () {
                        //编写/修改笔记行内框-保存按钮
                        $('.editQues .p_sure').off().on('click', function () {
                            //video.playVideo();
                            listenView.handler.noteBoxSure($(this), param.sectionid);
                        });
                        if(!tool.validation.isNull(param.content)){
                            $('.editQues .text-area-len label').html(500 - param.content.length);
                        }
                        //编写/修改笔记行内框-取消按钮/关闭按钮
                        $('.editQues .close,.editQues .p_concel').off().on('click', function () {
                            video.playVideo();
                            listenView.handler.noteBoxCanl($(this));
                        });
                        //删除图片
                        $('.editQues').on('click','.erro_SH',function(){
                            $(this).parent().remove();
                            $(".Gexa_span").html($(".load_imgD").length);
                        });
                        //图片个数
                        $(".Gexa_span").html($(".load_imgD").length);
                        listenView.dragBox($('.editQues'));
                        $('.editQues .inp_area').off().on({
                            'input propertychange': function () {
                                var $this = $(this),
                                    val = this.value;
                                $('.text-area-len label').html(500 - val.length);
                                /*if (val.length > 500) {
                                 this.value = val.substring(0, 500);
                                 $('.text-area-len label').html(0);
                                 }*/
                            }
                        });
                        listenView.dragBox($('.editQues'));
                    }
                });

                /*if(note.find('p:first').html() === '无标题'){
                 title.parent().addClass('pop_box_note_title_hidden');
                 title.siblings('#add_note_title').html('+增加标题');
                 }else{
                 title.parent().removeClass('pop_box_note_title_hidden');
                 title.siblings('#add_note_title').html('-删除标题');
                 }*/
                //title.val(note.find('p:first').html());
                //$('#note_pop_box_content').val(note.find('p:last').html());
                $("#noteSave").val(noteId);
            },
            //弹框修改笔记确认按钮
            noteBoxUpdateSure:function(){
                var content = $('.pop_box_note .pop_box_content'),
                    infos = [];
                content.find('input,textarea').each(function () {
                    if ($(this).val() == '') {
                        $(this).siblings('.register_tip_err').show();
                    }else{
                        infos.push($(this).val());
                        $(this).siblings('.register_tip_err').hide();
                    }
                });
                if(infos.length === 2){
                    if(infos[1] && infos[1].length>500){
                        listenView.handler.closeBox();
                        DA.showFailMask("笔记内容不能超过500字");
                        return false;
                    }
                    //修改的笔记信息保存数据库
                    $.ajax({
                        url: basePath+'/note/add',
                        type: 'POST',
                        dataType: 'JSON',
                        async: false,
                        data: {
                            'id':$("#noteSave").val(),
                            'content':infos[1],
                            'title':infos[0]
                        },
                        error: function() {  },
                        success: function(result) {
                            if(!result.success){
                                DA.showFailMask(result.msg);
                            }
                        }
                    });
                    //开始修改值
                    $('#bigScreen [sectionid='+listenView.data.deleteNoteSectionId+']').each(function(){
                        if($(this).hasClass('note_detail')){
                            $('p:first',$(this)).html(infos[0]);
                            $('p:last',$(this)).html(infos[1]);
                            $(this).show();
                        }else{
                            var noteTitle = infos[0].length>20?infos[0].substring(0,18)+"...":infos[0];
                            $(this).children(':first').attr("title",infos[0]);
                            $(this).children(':first').html(noteTitle);
                        }
                    });
                    listenView.handler.closeBox();
                }
            },
            //点击笔记对应 滚动到对应讲义
            noteScroll:function(_this){
                var curWindow = listenView.data.curWindow || listenView.conf.initPageType,
                    sectionid = _this.parent().attr('sectionid');
                if (curWindow === 'big') {
                    window.scrollTo(0, $('.note_detail[sectionid=' + sectionid+']').offset().top - 40);
                } else if (curWindow === 'three') {
                    $('#lecture').animate({
                        scrollTop: ($('#lecture').scrollTop() + $('.note_detail[sectionid=' + sectionid+']').offset().top - $('#lecture').offset().top - 40 + 'px')
                    });
                }
            },
            //视频列表目录悬浮事件
            videoNameHover:function(_this){
                var _thisW = _this[0].scrollWidth,
                    pl = parseInt(_this.css('padding-left')),
                    pr = parseInt(_this.css('padding-right'));
                var text = _this.html();
                _this.attr({
                    html:text
                });
                var html = '\
					<span course style="position: relative;color:#FEC08A;margin:0;height:36px;line-height:36px;top:0;left:-'+pl+'px;display: block;width:'+(_thisW*2)+'px">\
						<span style="padding-left:'+pl+'px">'+text+'</span>\
						<span style="padding-left:'+pl+'px">'+text+'</span>\
					</span>';
                _this.html(html);
                listenView.handler.videoNameMove(_this,_thisW,pl,pr);
            },
            //视频列表目录离开事件
            videoNameLive:function(_this){
                _this.html(_this.attr('html'));
            },
            //视频名称滚动
            videoNameMove:function(_this,_thisW,pl,pr){
                _this.children(':first').animate({left:'-=1px'},20,function(){
                    if(Math.abs(parseInt(_this.children(':first').css('left'))+pl+pr) >= _thisW){
                        _this.children(':first').css('left',-pl);
                    }
                    if(_this.children().length == 0){
                        return false;
                    }
                    listenView.handler.videoNameMove(_this,_thisW,pl,pr);
                });
            }
        },
        //页面绑定事件
        onFun : function(){
            $("#first").change(function(){
                var val = $(this).children('option:selected').val();
                if(val) {
                    bindSecond(val);
                }
            });
            $("#load").on('click',function(){
                var requestURL = $('#second option:selected').val();
                if(requestURL) {
                    $("#requestURL").val(requestURL);
                    init();
                }
            });
            //评价提示框文字
            $('.pop_lesson_evaluate textarea').on('input propertychange',function(){
                var _this = $(this);
                _this.siblings('.lesson_alt_t').hide();
                $('.pop_lesson_evaluate textarea').removeClass('err-les'); //清掉错误边框
                var val=_this.val();
                $('.lesson_alt_n>b').html(140-val.length);
                if(tool.validation.isNull(val)){
                    $('.lesson_alt_t').show();
                }else{
                    $('.lesson_alt_t').hide();
                }
            })
            //评价星
            $('.erro_star a').on('click',function(){
                $(this).addClass('star_cur').prevAll('a').addClass('star_cur');
                $(this).nextAll('a').removeClass('star_cur');
                //判断对哪项评分
                var attrName = $(this).parent().attr("name");
                var score = $(this).index();
                if(attrName=="beautiful"){
                    beautifulScore = 1;
                    beautifulScore += score;
                }else if(attrName=="attract"){
                    attractScore = 1;
                    attractScore += score;
                }else if(attrName=="reasonable"){
                    reasonableScore = 1;
                    reasonableScore += score;
                }
            })
            //点击评价
            $('.lesson_evaluate_pop').on('click', function () {
                if($('.lesson_evaluate_pop_icon ').hasClass('lesson_evaluate_active')){
                    $('.lesson_evaluate_pop').off("click");
                }else{
                    video.pauseVideo();
                    $('.pop_opcity').show();
                }
            });
            //评价关闭
            $('.lesson_title_close').on('click',function(){
                $(this).parents('.pop_opcity').hide();
                video.playVideo();
            })
            //提交提示
            $('.lesson_evaluate_btn').on('click',function(){
                var val= $('.pop_lesson_evaluate textarea').val();
                $('.pop_lesson_evaluate textarea').removeClass('err-les'); //清掉错误边框
                if(val.length==0){
                    $('.pop_lesson_cont_alt').eq(0).show();
                    $('.pop_lesson_evaluate textarea').addClass('err-les'); //增加错误边框
                    setTimeout(function(){$('.pop_lesson_cont_alt').eq(0).hide();},3000);
                }else
                if(val.length>0 && val.length<=140){
                    var examId = $("#examId").val();
                    var subjectId = $("#subjectId").val();
                    var sSubjectId = $("#sSubjectId").val();
                    var courseId = $("#courseId").val();
                    var lectureId = $("#coursewareId").val();
                    //保存课程评价数据
                    $.ajax({
                        url: basePath+'/courseEvaluate/save',
                        type: 'POST',
                        dataType: 'JSON',
                        async: false,
                        data : {
                            "examId":examId,
                            "subjectId":subjectId,
                            "sSubjectId":sSubjectId,
                            "courseId":courseId,
                            "lectureId":lectureId,
                            "beautifulScore":beautifulScore,
                            "attractScore":attractScore,
                            "reasonableScore":reasonableScore,
                            "content":val
                        },
                        error: function() {  },
                        success: function(result) {
                            if(result.success){
                                $('.pop_lesson_cont').hide();
                                $('.pop_lesson_cont1').show();
                                //设置评价按钮
                                $('.lesson_evaluate_pop_icon ').addClass("lesson_evaluate_active");
                                $('.lesson_evaluate_pop_icon ').next().html("课程已评价");
                                setTimeout(function(){
                                    $('.pop_opcity').hide();
                                    //视频开始播放
                                    video.playVideo();
                                }, 3000);
                            }else{
                                $('.pop_lesson_cont_alt').eq(1).show();
                                setTimeout(function(){$('.pop_lesson_cont_alt').eq(1).hide();},3000);
                            }
                        }
                    });
                    /*$('.pop_lesson_cont').delay(10000).show();
                     $('.pop_lesson_cont1').delay(10000).hide();*/
                }else{
                    $('.pop_lesson_evaluate textarea').addClass('err-les'); //增加错误边框
                    /*$('.pop_lesson_cont_alt').eq(1).show();
                     setTimeout(function(){$('.pop_lesson_cont_alt').eq(1).hide();},3000);*/
                }
            });
            //评价标题字数控制
            var min_num=7;
            if($('.lesson_names').text().length>min_num){
                $('.lesson_names').text($('.lesson_names').text().substring(0, min_num));
                $('.lesson_names').text($('.lesson_names').text()+"...");
            };

            var max_num=10;
            if($('.lesson_name_n').text().length>max_num){
                $('.lesson_name_n').text($('.lesson_name_n').text().substring(0, max_num));
                $('.lesson_name_n').text($('.lesson_name_n').text()+"...");
            };
            //点击三分屏时的目录节点
            $('.listen_course_list').on("click","a[time]",function(){
                var time = $(this).attr("time"),
                    ft = Math.round(parseTime2Second(time));
                listenView.data.flag = ft;
                listenView.handler.initHandout(['clickthree',ft+1]);
                video.seekVideo(ft);
            });

            //视频列表悬浮滚动事件 章 第一级
            $('.video_list>ul>li>p').on('mouseenter',function(){
                var _this = $(this);
                testW(function(w){
                    if(w <= 265){
                        $(this).addClass('hover-color');
                    }else{
                        listenView.handler.videoNameHover(_this);
                    }
                },_this,14);
            });
            // 讲	第二级
            $('.video_list>ul>li>ul>li>p').on('mouseenter',function(){
                var _this = $(this);
                testW(function(w){
                    if(w <= 244){
                        $(this).addClass('hover-color');
                    }else{
                        listenView.handler.videoNameHover(_this);
                    }
                },_this,12);
            });
            //知识点
            $('.video_list a').on('mouseenter',function(){
                var _this = $(this);
                testW(function(w){
                    if(w <= 210){
                        $(this).addClass('hover-color');
                    }else{
                        listenView.handler.videoNameHover(_this);
                    }
                },_this,12);
            });
            function testW(callback,_this,fontsize){
                var $p = null,$list = $('#video_list');
                if($('#testWidth').length > 0){
                    $p = $('#testWidth');
                    $p.css('font-size',fontsize+'px');
                    $p.html(_this.html());
                }else{
                    $p = $('<p>',{
                        id:'testWidth',
                        'class': 'hidden',
                        html: _this.html(),
                        'style':'font-size:'+fontsize+'px'
                    }).appendTo('body');
                }
                callback($p.width()+($list.find('.firstul').height() > 450? 10:0));
                //$p.remove();
            }
            //视频列表离开事件
            $('.video_list p,.video_list a').on('mouseleave',function(){
                $(this).removeClass('hover-color');
                listenView.handler.videoNameLive($(this));
            });
            //跳转计算器页面
            $('.head_right p:eq(1)').click(function(){
                window.open(rp+rv+'/static/common/html/calculator.html');
            });
            //跳转提建议页
            $('.head_right p:eq(2)').click(function(){
                window.open(basePath+'/suggest');
            });
            //编写笔记按钮
            $('li:eq(3)',$('.chico')).on('click',function() {
                video.pauseVideo();
                listenView.handler.editNote($(this));
            });
            //修改笔记-行内
            $('li:last', $('.chico')).on('click', function () {
                video.pauseVideo();
                listenView.handler.noteLineUpdate($(this));
            });
            /*$('#bigScreen').on('click','.note_detail_update_btn',function(){
             video.pauseVideo();
             listenView.handler.noteLineUpdate($(this));
             });*/
            //编写/修改笔记行内框-保存按钮
            $('.section').on('click','.note_box_btn_save',function(){
                //video.playVideo();
                listenView.handler.noteBoxSure($(this));
            });
            //编写/修改笔记行内框-取消按钮/关闭按钮
            $('.section').on('click','.note_box_btn_canl,.note_box_close',function(){
                video.playVideo();
                listenView.handler.noteBoxCanl($(this));
            });
            //修改笔记-tab_icon
            $('#bigScreen').on('click','.note_update_btn',function(){
                video.pauseVideo();
                listenView.handler.noteIconUpdate($(this));
            });
            /*//修改笔记弹窗增加title按钮
             $('#add_note_title').on('click',function(){
             if($(this).parent().hasClass('pop_box_note_title_hidden')){
             $(this).prev().prev().val('');
             $(this).html('-删除标题').parent().removeClass('pop_box_note_title_hidden');
             }else{
             $(this).prev().prev().val('');
             $(this).html('+增加标题').parent().addClass('pop_box_note_title_hidden');
             $(this).siblings('.register_tip_err').hide();
             }
             });*/
            //修改笔记弹窗确认事件
            $('.pop_box_note_btns>.pop_box_note_btn_save').on('click',function(){
                video.playVideo();
                listenView.handler.noteBoxUpdateSure();
            });
            //修改笔记弹窗取消事件
            $('.pop_box_note_btns>.pop_box_note_btn_canl').on('click',function(){
                video.playVideo();
                listenView.handler.closeBox();
            });
            //删除笔记按钮-tab_icon/行内
            $('#bigScreen').on('click','.note_delete_btn,.note_detail_delete_btn',function(){
                //将要删除的笔记的id赋值给删除按钮
                if($(this).attr("value") == null){
                    $("#deleteNoteBtn").val($(this).parent().parent().attr("id"));
                }else{
                    $("#deleteNoteBtn").val($(this).attr("value") );
                }
                video.pauseVideo();
                listenView.data.deleteNoteSectionId = $(this).parent().parent().attr('sectionid');
                listenView.handler.showBox(4);
            });
            //删除笔记弹窗-确认按钮
            $('.p_sure').on('click',function(){
                video.playVideo();
                listenView.handler.noteDelte(this);
            });
            //删除笔记弹窗-取消按钮/关闭按钮
            $('.p_concel,.pop_title_close').on('click',function(e){
                video.playVideo();
                listenView.handler.closeBox();
                if ( e && e.stopPropagation ){
                    e.stopPropagation();
                }else{
                    window.event.cancelBubble = true;
                }
            });
            //点击笔记对应 滚动到对应讲义
            $('.listen_note_panl').on('click','.note_detail_text',function() {
                listenView.handler.noteScroll($(this));
            });
            //习题详解弹框-收藏/已收藏按钮
            $('.collection1,.collection_text',$('.box_content_question_type')).on('click',function(){
                var _this = $(this);
                if(_this.hasClass('collection_text')){
                    _this = _this.next();
                }
                if(_this.hasClass('collection1_act')){
                    _this.prev().html('收藏');
                }else{
                    _this.prev().html('已收藏');
                }
                _this.toggleClass('collection1_act');
            });
            //直接提问
            $('.now_ask2').on('click',function(){
                var $per = $(this).parents('.pop_box_question_content');
                $per.find('.qr_help_btn').children('a').addClass('open');
                $per.find('.qr_help_btn').next().show();
                //$('.qr_help_btn').click();
                $per.animate({
                    scrollTop:$per.find('.qr_edit').offset().top
                });
            });

            //展开提问
            $('.qr_help_btn').on('click',function(){
                var $per = $(this).parents('.pop_box_question_content');
                $(this).children('a').toggleClass('open');
                $(this).next().toggle();
                $per.animate({
                    scrollTop: $per.find('.qr_edit').offset().top
                });
            });
            //弹窗修改邮箱按钮
            $('.qrm_change').on('click',function(){
                $('.email_change').show();
            });
            //弹窗修改邮箱按钮
            $('.email_change .sure_btn').on('click',function(){
                //更新邮箱
                email = $(this).parent().prev().find(".email_change_inp").val();
                $.ajax({
                    url: basePath+'/listenLecture/updateEmail',
                    type: 'POST',
                    dataType: 'JSON',
                    async: false,
                    data : {
                        'email' : email
                    },
                    error: function() {  },
                    success: function(result) {
                        if(result.success){
//			    		   $("#answerDate").html(result.obj+"内");
//			    		   listenView.handler.showBox(6);
                        }
                    }
                });

                $('.email_change').hide();
                var box = $(this).parent().parent();
                $('.email_number',box.prev()).text($('.email_change_inp',box).val());
            });
            $('.qr_edit .inp_area').on({
                'input propertychange': function () {
                    var $this = $(this),
                        val = this.value;
                    $this.parent().find('.text-area-len label').html(500 - val.length);
                    /*if (val.length > 500) {
                     this.value = val.substring(0, 500);
                     $this.parent().find('.text-area-len label').html(0);
                     }*/
                }
            });
            //提问弹窗取消
            $('.qr_btn .cancel_btn').on('click',function(){
                listenView.handler.closeBox();
            });
            //提问弹窗确认
            $('.qr_btn .sure_btn').on('click',function(){
                //答疑回复后，是否邮件通知
                if($(this).parent().prev().find("a").hasClass("email_icon_act")){
                    sendStatus = 1;
                }else{
                    sendStatus = 0;
                }

                //提交提问的答疑信息
                handoutDetailId = $("#hanConId").val();
                qaTitle = $(this).parent().parent().prev().find(".inp_text").val();
                qaContent = $(this).parent().parent().prev().find(".inp_area").val();
                lectureId = $("#lectureId").val();
                lectureName = $("#lectureName").val();
                courseId = $("#courseId").val();
                courseName = $("#courseName").val();
                sSubjectId = $("#sSubjectId").val();
                examId = $("#examId").val();
                if(null!=qaTitle && qaTitle!="" && null!=qaContent && qaContent!=""){
                    $.ajax({
                        url: basePath+'/lecture/section/qa/add',
                        type: 'POST',
                        dataType: 'JSON',
                        async: false,
                        data : {
                            'hanConId' : handoutDetailId,
                            'title' : qaTitle,
                            'content' : qaContent,
                            'coursewareId' : lectureId,
                            'coursewareName' : lectureName,
                            'courseId' : courseId,
                            'sSubjectId' : sSubjectId,
                            'examId' : examId,
                            'courseName' : courseName,
                            'sendStatus' : sendStatus
                        },
                        error: function() {  },
                        success: function(result) {
                            if(result.success){
                                //清空填写的数据
                                $("#title").val("");
                                $("#content").val("");
                                $("#answerDate").html(result.obj+"内");
                                listenView.handler.showBox(6);
                            }
                        }
                    });

                }
            });
            //三分屏跳转答疑页面
            $('#threeQaList').on('click','.to_answer',function(){
                var qaId = $(this).attr("qaId");
                video.pauseVideo();
                window.open(toQaDetailUrl+qaId);
            });
            //大视频跳转答疑页面
            $('#rightQaList').on('click','.to_answer',function(){
                var qaId = $(this).attr("qaId");
                video.pauseVideo();
                window.open(toQaDetailUrl+qaId);
            });
            //跳转试题知识点
            $('#bigScreen').on('click','.tab_panal_tests p',function(){
                var sSubjectId = $(this).attr("sSubjectId");
                var kpId = $(this).attr("kpId");
                video.pauseVideo();
                var questionUrl = doQuestionByKpIdUrl.replace("${sSubjectId}",sSubjectId).replace("${kpid}",kpId);
                window.open(questionUrl);
            });
            //跳转笔记页面
            $('.to_note').on('click',function(){
                window.location.href = '../course/note.html';
            });
            //展开讲义答疑详情
            /*$('.qr_has_ask').on('click',function(){
             if($(this).children('i').hasClass('open')){
             $(this).children('span').html('展开');
             }else{
             $(this).children('span').html('收起');
             }
             $(this).children('i').toggleClass('open');
             $(this).parent().find('div.qr_detail').toggle();
             });*/
            //上一讲
            $('.prev_question').on('click',function(){
                var cur = $('.question .pop_box_content>p.show');
                var prev = cur.prev().prev();
                if(prev.length > 0){
                    cur.removeClass('show').hide().next().hide()
                    prev.show().addClass('show').next().show();
                }
            });
            //下一题
            $('.next_question').on('click',function(){
                var cur = $('.question .pop_box_content>p.show');
                var next = cur.removeClass('show').hide().next().hide().next();
                if(next.length > 0){
                    next.show().addClass('show').next().show();
                }else{
                    listenView.handler.showBox(1);
                }
            });
            //播放本段视频
            $('li.chico_play',$('.chico')).on({
                dbclick : function(e){
                    //非IE浏览器
                    if ( e && e.stopPropagation ){
                        e.stopPropagation();
                    }
                    //使用IE的方式来取消事件冒泡
                    else{
                        window.event.cancelBubble = true;
                    }
                    return false;
                },
                click : function() {
                    var time = $(this).parent().parent().attr('time');
                    ft = Math.round(parseTime2Second(time));
                    listenView.data.flag = ft;
                    listenView.handler.initHandout(['clickthree',ft+1]);
                    video.seekVideo(ft);
                },
                mouseover : function(e){
                    var section = $(this).parent().parent();
                    section.data({title:section.attr('title')}).attr('title','');
                },
                mouseout : function(){
                    var section = $(this).parent().parent();
                    section.attr('title',section.data().title);
                }
            });
            //展示隐藏答案
            $('li.chico_answer',$('.chico')).on('click',function(){
                var $obj = $(this);
                var s = $obj.html();
                $obj.html(s == '显示答案' ? '隐藏答案' : '显示答案');
                //答案部分
                $obj.parent().prevAll(".que_answer").toggle();
                return false;
            });
            //提问
            $('li.chico_question',$('.chico')).on({
                dbclick : function(e){
                    //非IE浏览器
                    if ( e && e.stopPropagation ){
                        e.stopPropagation();
                    }
                    //使用IE的方式来取消事件冒泡
                    else{
                        window.event.cancelBubble = true;
                    }
                    return false;
                },
                //点击讲义段的提问按钮，弹框显示答疑页面
                click : function() {
                    video.pauseVideo();
                    //页面对讲义段进行提问的入口，需要查询该讲义段的相关答疑
                    var handoutDetailId = $(this).val();
                    $("#hanConId").attr("value",handoutDetailId);
                    $("#hanDetailId").attr("value",handoutDetailId);
                    var detailContent = $(this).next().val();

                    //$('#qa_questionId').val(1);
                    tool.showMask({
                        ele:'.double_pop',
                        callback:function(){
                            $('.double_pop').css({
                                top: '50%',
                                left: '50%',
                                'margin-left': '-400px',
                                'margin-top': '-300px'
                            });
                            $("#qaInfoForm").attr('action',relateQaRul);
                            $("#qaInfoForm").submit();
                        }
                    });
                    listenView.dragBox($('.double_pop'));//提问拖拽
                },
                hover : function(e){
                    //非IE浏览器
                    if ( e && e.stopPropagation ){
                        e.stopPropagation();
                    }
                    //使用IE的方式来取消事件冒泡
                    else{
                        window.event.cancelBubble = true;
                    }
                    return false;
                },
                mouseover : function(e){
                    var section = $(this).parent().parent();
                    section.data({title:section.attr('title')}).attr('title','');
                },
                mouseout : function(){
                    var section = $(this).parent().parent();
                    section.attr('title',section.data().title);
                }
            });

            //针对该题提问弹框
            $('.que_answer .qu').on('click',function(){
                listenView.handler.showBox(3);
            });

            //小屏关闭按钮
            $('.audio_title_img').on('click',function(e){
                listenView.handler.drawPage('smallclose');
                return false;
            });
            //三分屏左侧tab切换
            $('#three_left_tab tr:first>td').on('click',function(){
                var flag = $(this).attr("flag");
                var lectureId = $("#lectureId").val();
                var subjectId = $("#subjectId").val();

                //加载试题列表
                if(flag=="question"){
                    if(StringUtils.isEmpty($("#threeKpInfos").html().trim())){
                        $("#threeKpInfos").load(basePath+"/lecture/findKpInfos?lectureId="+lectureId,function(){
                            //初始化左侧选项卡高度
                            var _this = $('#three_left_tab_panl .text:eq(2)')
                            var height = $(window).height() - _this.offset().top - 20;
                            height = Math.max(height, 183);
                            if (_this.height() > height) {
                                _this.css({height: height, 'overflow-y': 'auto'})
                            }
                        });
                    }
                }
                //加载笔记列表
                if(flag=="note"){
                    if(StringUtils.isEmpty($("#threeKpNotes").html().trim())){
                        $("#threeKpNotes").load(basePath+"/lecture/findMyNotes?lectureId="+lectureId+"&subjectId="+subjectId,function(){
                            //初始化左侧选项卡高度
                            var _this = $('#three_left_tab_panl .text:eq(3)')
                            var height = $(window).height() - _this.offset().top - 20;
                            height = Math.max(height, 183);
                            if (_this.height() > height) {
                                _this.css({height: height, 'overflow-y': 'auto'})
                            }
                        });
                    }
                }
                //加载答疑列表
                if(flag=="qa"){
                    if(StringUtils.isEmpty($("#threeQaList").html().trim())){
                        $("#threeQaList").load(basePath+"/lecture/findQaInfoList?lectureId="+lectureId,function(){
                            //初始化左侧选项卡高度
                            var _this = $('#three_left_tab_panl .text:eq(1)')
                            var height = $(window).height() - _this.offset().top - 20;
                            height = Math.max(height, 183);
                            if (_this.height() > height) {
                                _this.css({height: height, 'overflow-y': 'auto'})
                            }
                        });
                    }
                }
                $(this).addClass('L_cur').siblings().removeClass('L_cur');
                $('#three_left_tab').nextAll('div.text:eq('+$(this).index()+')').show().siblings('div.text').hide();
            });
            //全屏右侧tab切换
            $('#full_right_tab tr:first>td').on('click',function(){
                var flag = $(this).attr("flag");
                var lectureId = $("#lectureId").val();
                var subjectId = $("#subjectId").val();
                //加载试题列表
                if(flag=="question"){
                    if(StringUtils.isEmpty($("#rightKpInfos").html().trim())){
                        $("#rightKpInfos").load(basePath+"/lecture/findKpInfos?lectureId="+lectureId);
                    }
                }
                //加载笔记列表
                if(flag=="note"){
                    if(StringUtils.isEmpty($("#rightNotes").html().trim())){
                        $("#rightNotes").load(basePath+"/lecture/findMyNotes?lectureId="+lectureId+"&subjectId="+subjectId);
                    }
                }
                $(this).addClass('L_cur').siblings().removeClass('L_cur');
                $('#full_right_tab').nextAll('div.full_right_tab_panal:eq('+$(this).index()+')').show().siblings('div.full_right_tab_panal').hide();
            });
            //点击展示，收起相关答疑
            $('.drawal').click(function(){
                var $this = $(this),
                    $pars = $('.right_big'),
                    $left = $(".Nlist_left");
                listenView.conf.ulFlag = !listenView.conf.ulFlag;
                $pars.animate({width: 0},500,function(){
                    $pars.toggle();
                    $(".right_show").show();
                    $('.drawal').hide();
                });
                $left.animate({width:$left.parent().width()-20+'px'},500);
            });
            //点击展示，展示相关答疑
            $('.right_show').click(function(){
                var $this = $(this),
                    $pared = $('.right_big');
                listenView.conf.ulFlag = !listenView.conf.ulFlag;
                $pared.animate({width: '32%'},500,function(){
                    $pared.toggle();
                    $('.drawal').show();
                    $(".right_show").hide();
                    $(".Nlist_left").css('width','65%');
                });
            });

            //讲义字体大小设置
            $('.font_size_select').hover(
                function(){
                    $(this).find('.select_ul').toggle();
                    var $_c=$(this).children('i');
                    if($_c.hasClass('open')){
                        $_c.removeClass('open');
                    }else{
                        $_c.addClass('open');
                    }
                },
                function(){
                    var $_c=$(this).children('i');
                    if($_c.hasClass('open')){
                        $_c.removeClass('open');
                        $(this).find('.select_ul').hide();
                    }
                }
            );

            //展示 隐藏所有答案
            $('.show_all_answer').on('click',function(){
                if($(this).hasClass('show')){
                    $(this).removeClass('show').html('展示全<br/>部答案');
                    $('.que_answer').hide();
                }else{
                    $(this).addClass('show').html('隐藏全<br/>部答案');
                    $('.que_answer').show();
                }
            });
            /*选择框选中选项*/
            $('.select_ul li').on('click',function(){
                var _this=$(this);
                var index = _this.index();
                $('.select_ul').each(function(i,n){
                    $('li:eq('+index+')',n).addClass('cur').siblings().removeClass('cur').parent().hide().siblings('span').html(_this.text()).next('a').removeClass('open');
                });
                var fz = $('.section').css('font-size');
                if (!fz){
                    fz = 14;
                }else{
                    fz = parseInt(fz.substring(0, fz.length - 2));
                }
                $('#zoomBigBtn,#zoomNormalBtn,#zoomSmallBtn').removeAttr('style');
                if ($(this).attr('value') == 'big') {
                    fz=16;
                    $('#zoomBigBtn').css({'color':'#F38209','font-weight':'bold'});
                } else if ($(this).attr('value') == 'small') {
                    fz=12;
                    $('#zoomSmallBtn').css({'color':'#F38209','font-weight':'bold'});
                } else if ($(this).attr('value') == 'normal') {
                    fz = 14;
                    $('#zoomNormalBtn').css({'color':'#F38209','font-weight':'bold'});
                } else
                    return;
                $('.section').css('font-size', fz + 'px');
                $('.section span[class!=content]').css('font-size', fz + 'px');
                $('.section').css('line-height', (fz + 11) + 'px');
                return false;
            });
            //关窗绑定事件
            $('.box_head_close').on('click',function(){
                listenView.handler.closeBox();
            });
            //开关灯效果
            $('.day_or_night').on('click',function(){
                if($(this).attr('night') == 'true'){
                    $(this).removeClass('night').attr('night','false');
                    $('body').removeClass('dark');
                    $('.head_left img:first').attr('src',rp+rv+'/static/course/img/logo.png');
                }else{
                    $(this).addClass('night').attr('night','true');
                    $('body').addClass('dark');
                    $('.head_left img:first').attr('src',rp+rv+'/static/course/img/dark_logo.png');
                }
            });
            //禁止选择 取消禁止选择 2017.1.11
            /*$(document).on('selectstart','#lecture',function(){
             return false;
             });*/
            //绑定页面滚动小窗随着滚动事件
            $(window).on('scroll',function () {
                if(listenView.data.threeScreeLock){
                    return false;
                }
                var t = document.documentElement.scrollTop || document.body.scrollTop;
                if (t > 540 && listenView.conf.screen.moveflog == true) {
                    listenView.handler.drawPage('small');
                }else if(t < 540 && listenView.conf.screen.moveflog == true){
                    listenView.handler.drawPage('smalltobig');
                }
            });
            $(window).on('resize',function(){
                if(listenView.data.threeScreeLock){
                    //讲义设置
                    $('.Nlist_left').css({
                        width:function(){
                            var width = $('#bigScreen').width() - 505
                            if(508 < width){
                                return width;
                            }else{
                                return 508;
                            }
                        }
                    });
                }
                listenView.inits.initDate();
            });
            /* lecture init * */
            // 讲义 双击播放事件
            $('.section').on({
                //双击事件
                dblclick : function(){
                    var time = $(this).attr("time"),
                        ft = Math.round(parseTime2Second(time));
                    listenView.data.flag = ft;
                    listenView.handler.initHandout(['clickthree',ft+1]);
                    video.seekVideo(ft);
                },
                //鼠标离开
                mouseleave : function() {
                    if(!$(this).hasClass('playing')){
                        $(this).removeClass('select_listen');
                    }
                    $(" .chico",$(this)).hide();
                },
                //鼠标悬浮
                mouseenter : function(){
                    $(this).addClass('select_listen');
                    $(" .chico",$(this)).show();
                }
            });

            //点击视频列表，展示视频列表
            $('.video_list>span').click(function(){
                var courseId = $("#courseId").val();
                var lectureId = $("#lectureId").val();
                //获取课程目录
                if(StringUtils.isEmpty($("#courseCatalog").html().trim())){
                    $("#courseCatalog").load(basePath+'/lecture/findCourseCatalogs?courseId='+courseId+"&lectureId="+lectureId);
                }
                var w = listenView.conf.ulFlag1?26:270,
                    $this = $(this),
                    $par = $this.parent('.video_list');
                if (w == 270)$par.addClass('video_list_act');
                listenView.conf.ulFlag1 = !listenView.conf.ulFlag1;
                $par.animate({width: w},500,function(){
                    $this.hide()
                        .siblings('span').show()
                        .parent('.video_list')//.toggleClass('video_list_show')
                        .children('ul').toggle();
                    if (w == 26)$par.removeClass('video_list_act');
                });
            });
            /*点击章节展开列表 -- 一级*/
            $('.video_list>ul>li>p').click(function(){
                var $this = $(this);
                $this.next('ul').toggle();
                $this.parent('li').siblings('li').children('ul').hide();
            });
            /*点击章节展开列表 -- 二级*/
            $('.video_list>ul>li>ul>li>p').click(function(){
                var $this = $(this);
                $this.next('ul').toggle();
                $this.parent('li').siblings('li').children('ul').hide();
            });
            /*知识点*/
            $('.know_point').hover(function(){
                $(this).children('a').show();
            },function(){
                $(this).children('a').hide();
            });
            //多选题
            $('.sub_seclet_bg').on('click',function(){
                $(this).toggleClass('sub_seclet_bg1');
            });
            //点选题
            $('.sub_radio_bg').on('click',function(){
                if($(this).toggleClass('sub_radio_bg1').hasClass('sub_radio_bg1')){
                    $(this).parent().siblings('.multiselect_select').find('.sub_radio_bg1').removeClass('sub_radio_bg1');
                }
            });
            //答疑详情列表hover
            /* 答疑列表 */
            $('.answers_content>div').hover(function (e){
                $(this).addClass('color_orange');
            },function (e){
                $(this).removeClass('color_orange');
            });
            $('.answer_zhi').hover(function(e){
                $(this).parents('.color_orange').removeClass('color_orange').addClass('color_orange_cancle');
            },function(e){
                $(this).parents('.color_orange_cancle').removeClass('color_orange_cancle').addClass('color_orange')
            });
            /*$('.answers_content>div').hover(function (){
             $(this).addClass('color_orange');
             },function (){
             $(this).removeClass('color_orange');
             });*/

            //大视频左侧列表点击播放视频
            /*$('#video_list a:not([time])').on('click','a[course]',function(){
             var href = $(this).parent(':not([time])').attr('href');
             if(href){
             window.location.href = href;
             }
             var lectureId = $(this).parent().attr("lectureId");
             var startTime = $(this).parent().attr("startTime");
             var endTime = $(this).parent().attr("endTime");
             //post方式请求播放视频(大视频左侧的列表的知识点不是当前播放讲次的情况)

             subFromToListenLecture(document.body,lectureId,startTime,endTime,"m3u8");
             });*/
            //大视频左侧列表点击播放视频
            $('#video_list').on('click','li[lectureId]',function(){
                var lectureId = $(this).attr("lectureId");
                var startTime = "00:00:00";
                var endTime = null;
                //post方式请求播放视频(大视频左侧的列表的讲次不是当前播放讲次的情况)
                subFromToListenLecture(document.body,lectureId,startTime,endTime,"m3u8");
            });
            //视频列表点击
            $('#video_list').on('click','a[time]',function(){
                //$(this).addClass('activity').parent().siblings().children('a').removeClass('activity');
                var time = $(this).attr("time"),
                    ft = Math.round(parseTime2Second(time));
                listenView.data.flag = ft;
                listenView.handler.initHandout(['clickthree',ft+1]);
                video.seekVideo(ft);
            });
            /*//三分屏列表目录
             $('.listen_course_list li[time]').on('click',function(){
             var time = $(this).attr("time"),
             ft = Math.round(parseTime2Second(time));
             listenView.data.flag = ft;
             listenView.handler.initHandout(['clickthree',ft+1]);
             video.seekVideo(ft);
             });*/
        }, //修改笔记拖拽
        dragBox: function (box) {
            var title = box.children('div:first');
            var disX = 0, disY = 0;
            var posX = 0, posY = 0;
            var maxW, maxH;
            title.off('mousedown').on('mousedown', function (event) {
                var event = event || window.event;
                if (!$(event.target).hasClass('close')) {
                    disX = event.offsetX;
                    disY = event.offsetY;
                    maxW = $(window).width() - box.width();
                    maxH = $(window).height() - box.height();
                    $(document).on({
                        mousemove: function (event) {
                            var event = event || window.event;
                            posX = event.clientX - disX;
                            posY = event.clientY - disY;
                            posX = Math.max(posX, 0);
                            posY = Math.max(posY, 0);
                            posX = Math.min(posX, maxW);
                            posY = Math.min(posY, maxH);
                            box.css({
                                left: posX,
                                top: posY,
                                right: 'initial',
                                margin: "0"
                            });
                        },
                        mouseup: function () {
                            $(document).off('mousemove');
                            $(document).off('mouseup');
                        }
                    });
                }
            });
        }
    };
    //获取请求播放地址
    var requestURL = $("#requestURL").val();
    if(isPreview){
        initType = "big";
    }
    bindFirst();
    exports.listen = listenView;
    init();

});

/**
 * 将 时:分:秒 格式数据转换为秒
 */
function parseTime2Second(playTime){
    var timeArr = playTime.split(':');
    seconds = timeArr[0]*60*60+timeArr[1]*60+parseInt(timeArr[2]);
    return seconds;
}

/**
 * 将秒转换为hh：mm：ss格式
 */
function formatTime(leftTime) {
    var resultTime = "";
    if(leftTime < 0){
        leftTime = Math.abs(leftTime);
        resultTime = "-";
    }
    //小时数
    var hours = leftTime / 60 / 60;
    //对小时余
    var hoursRound = Math.floor(hours);
    //剩余分钟数
    var minutes = leftTime / 60  - (60 * hoursRound);
    //对分钟取余
    var minutesRound = Math.floor(minutes);
    //秒数
    var seconds = leftTime - (60 * 60 * hoursRound) - (60 * minutesRound);
    //个位数的小时显示为00:00:00小时的格式
    if(hoursRound < 10){
        hoursRound = "0" + hoursRound;
    }
    //个位数的分钟显示为00:00:00分钟的格式
    if(minutesRound < 10){
        minutesRound = "0" + minutesRound;
    }
    //个位数秒显示为00:00:00分钟的格式
    if(seconds < 10){
        seconds = "0" + seconds;
    }
    //拼接显示格式
    resultTime += hoursRound + ":" + minutesRound + ":" + seconds;
    return resultTime
}

/**
 * 重新听本讲
 */
function reListen(){
    //重新设置视频播放时间
    video.seekVideo(0);
    //调用视频播放方法
    video.playVideo();
}

/**
 * 缓存学员最后一次听课的播放格式
 */
function putCacheInitPlayType(initType){

}

$().ready(function () {
    if(isPreview){
        // 预览视频处理
        preparePreview();
    }
});

/**
 * 处理预览视频
 * */
function preparePreview() {
    var lectureId = $("#lectureId").val();
   /* // 加载三分屏目录
    $("#threeCatalogs").load(basePath+"/exp/preview3Catalog?lectureId="+lectureId);
    //设置听课相关属性内容
    setCourseRelateContent();
    // 隐藏提问按钮以及编写笔记
    $(".chico_question").hide();
    $(".chico_question").next().hide();
    // 隐藏收藏按钮
    $(".handout_collection_btn").hide();
    // 去掉缓存用户视频方式的功能
    putCacheInitPlayType = function (initType) {};
    // 隐藏flash中查看课程目录的按钮
    $('.video_list>span').hide();
    //隐藏评价按钮
    $('.lesson_evaluate_pop').hide();*/
}

function setCourseRelateContent(){
   /* var noContent = '<div class="panal_no_content"><img src="'+rp+rv+'/static/course/img/listen_panal_no_content.png"><p>未发现本讲的相关内容</p></div>';
    // 加载试卷
    $("#rightKpInfos").append(noContent);
    $("#threeKpInfos").append(noContent);
    // 加载答疑
    $("#rightQaList").append(noContent);
    $("#threeQaList").append(noContent);
    // 加载笔记
    $("#rightNotes").append(noContent);
    $("#threeKpNotes").append(noContent);*/
}