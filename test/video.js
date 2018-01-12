/**
 * @description        js与flash交互公共js
 * @author            zwr
 * @date:                2016-6-15
 * @modify:
 * @version            1.0
 */
define(function (require, exports, module) {
    url = "./video/test/ReconstructPlayer.swf";
    alert(url);
    var video = {
        init: function (obj) {
            alert("cccc");
            $.extend(this.conf, obj);
            $('#videoContainer').html($('<div>', {
                id: obj.flash,
                'class': 'fla-no',
                html: ['<div class="fla-no-con"><h1>您的Flash插件已过期，无法播放视频�?</h1>',
                    '<a target="_blank" href="http://www.adobe.com/go/getflashplayer"><img src="' + rp + rv + '/static/course/img/flash.png" alt="Get Adobe Flash player">',
                    '</a><p>建议您升级Flash插件</p></div>'].join("")
            }));
            var _this = this;
            var flashvars = {};
            flashvars.awardCount = "1";
            flashvars.userID = "2011045860000049";
            flashvars.postURL = "http://lq.dongao.com/api/retrainAward.html";
            var params = {};
            params.play = "true";
            params.movie = url;
            params.loop = "true";
            params.menu = "true";
            params.salign = "";
            params.quality = "high";
            params.scale = "showall";
            params.bgcolor = "#fff";
            params.devicefont = "false";
            params.allowfullscreen = "true";
            params.allowscriptaccess = "always";
            params.allowFullScreenInteractive = "true";
            params.wmode = "transparent";
            var attributes = {};
            attributes.name = obj.flash;
            attributes.align = "left";
            swfobject.embedSWF(url, obj.flash, "100%", "100%", "9.0.0", rp + rv + "/static/course/js/expressInstall.swf", flashvars, params, attributes, function (obje) {
                if (obje.success) {
                    _this.conf.flash = obje.ref;
                }
            });
        },
        /*
         * flash 对象
         */
        flash: function () {
            return this.conf.falsh;
        },
        /*
         * 参数配置
         */
        conf: {
            url: '',//flash路径
            flash: {},//flash对象
            initialised: null//flash初始化完�? 回调事件
        },
        /*
         * 枚举�?
         */
        menu: {
            play: 'play',//播放状�?
            pause: 'pause',//暂停状�?
            playComplete: 'playComplete',//播放完毕
            bigVideo: 'bigWindow',//大屏
            threeVideo: 'threeWindow',//三分�?
            smallVideo: 'fWindow'//小屏
        },
        /*
         * 播放器的类型发生改变
         * @param type 播放器的类型
         * m3u8Three,m3u8,fWindow
         * 对应"三分�?"|"大视�?"|"悬浮�?"
         *
         */
        changeVideoType: function (type) {
            this.conf.flash.changeWindowType(type);
        },
        /*
         * 播放视频
         */
        playVideo: function () {
            alert("playVideo");
            //判断当前视频为播放完毕的�? 不进行播�?
            if (this.getVideoStatus() === video.menu.playComplete) {
                return false;
            }
            this.conf.flash.playVideo();
        },
        /*
         * 暂停视频
         */
        pauseVideo: function () {
            alert("pauseVideo");
            //判断当前视频为播放完毕的�? 不进行暂�?
            if (this.getVideoStatus() === video.menu.playComplete) {
                return false;
            }
            this.conf.flash.pauseVideo();
        },
        /*
         * 暂停或播放视�?
         */
        togglePlay: function () {
            alert("togglePlay");
            var status = this.getVideoStatus();
            if (status === this.conf.menu.play) {
                this.pauseVideo();
            } else if (status === this.conf.menu.pause) {
                this.playVideo();
            }
        },
        /*
         * 停止视频
         */
        stopVideo: function () {
            alert("stopVideo");
            this.conf.flash.stopVideo();
        },
        /*
         * 将视频调整到对应的时间点
         */
        seekVideo: function (time) {
            this.conf.flash.seekVideo(time);
        },
        /*
         * 退出全�?
         */
        exitFullScreen: function () {
            this.conf.flash.exitFullScreen();
        },
        /*
         * 返回当前视频播放的时间点，以秒为单位
         */
        getCurrentVideoTime: function () {
            alert("getCurrentVideoTime");
            return this.conf.flash.getCurrentVideoTime();
        },
        /*
         * 返回当前视频的总时�?
         */
        getCurrentVideoTotalTime: function () {
            alert("getCurrentVideoTotalTime");
            return this.conf.flash.getCurrentVideoTotalTime();
        },
        /*
         * 返回视频当前的播放状�?
         */
        getVideoStatus: function () {
            alert("getVideoStatus");
            return this.conf.flash.getVideoStatus();
        },
        /*
         * 返回视频的当前倍�?
         */
        getVideoSpeed: function () {
            return this.conf.flash.getVideoSpeed();
        },
        /*
         * 设置视频的有效时�?
         */
        setValidPlayTime: function (time) {
            alert("time");
            this.conf.flash.setValidPlayTime(time);
        },
        /*
         * 设置falsh宽高
         */
        setVideoSize: function (width, height) {
            alert("setVideoSize");
            this.conf.flash.setVideoSize(width, height);
        },
        /*
         * 处理flash调用函数
         */
        forFlash: {
            //flash初始化完�?
            playerIsReady: function () {
                alert("playerIsReady");
            },
            /*
             * 视频播放时调用，间隔100毫秒调用一�?
             */
            mediaRefresh: function (param) {

            },
            /*
             * 视频播放完毕调用
             */
            flashFinishPlayVideo: function (param) {

            },
            /*
             * 视频倍数改变
             */
            speedChange: function (param) {

            },
            /*
             * 返回"获取播放器参数列表的URL"
             */
            getParamURL: function () {
                return video.conf.url;
            },
            /*
             * 三分屏切换按钮点击事�?
             */
            falshSizeChange: function (param) {

            },
            /*
             * 下一�?
             */
            nextVideo: function (param) {

            },
            /*
             * 知识点实际时�?
             */
            setRealTime: function (param) {
                alert("setRealTime");
            }
        }
    };

    /*
     * 初始化flash调用函数
     */
    window.funcForFlash_Reconstruct = function () {
        alert("funcForFlash_Reconstruct");
        if (arguments.length > 0) {
            var param = arguments;
            if (video.forFlash[param[0]]) {
                return video.forFlash[param[0]](param);
            } else {
                console.log(param[0] + ' is not a function!');
            }
        } else {
            console.log('arguments is null!');
        }
    };
    /*
     * 调用flash对象
     */
    $.extend(exports, video);
});