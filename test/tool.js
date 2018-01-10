/**
 * @description        工具类js
 * @author            Taohailong
 * @date:            2016-5-17
 * @modify:            2016-5-30 zys 增加引用公用css
 * @version        1.0
 */
define(function (require, exports, module) {
    //引用公用css
    //require('../css/common.css');
    /**@description 判断鼠标是否移出事件
     * @parameter
     * @type        boolean;
     * @return        true/false
     */
    exports.isMouseOut = function () {
        if (e.type !== 'mouseout') {
            return false;
        }
        var reltg = e.relatedTarget ? e.relatedTarget : e.type === 'mouseout' ? e.toElement : e.fromElement;
        while (reltg && reltg !== handler) {
            reltg = reltg.parentNode;
        }
        return (reltg !== handler);
    };


    /**@description 获得URL中GET参数值
     * @parameter
     * @type        [[],[],[]];
     * @return        二维数组
     */
    exports.getGets = function () {
        var gets = window.location.href.split("?");
        var getParameters = [];
        if (gets[1]) {
            var GETs = gets[1].split("&");
            $.each(GETs, function (i, n) {
                getParameters.push(n.split('='));
            });
        }
        return getParameters;
    };

    /**@description 获取当前路径
     * @parameter
     * @type        String
     * @return        http://www.dongao.com/a/a.html
     */
    exports.getsThePath = function () {
        var currentPageUrl = "";
        if (typeof this.href === "undefined") {
            currentPageUrl = document.location.toString().toLowerCase();
        } else {
            currentPageUrl = this.href.toString().toLowerCase();
        }
        return currentPageUrl;
    };

    /**@description    返回顶部
     * @parameter    String
     *                backTop('goTop');
     */
    exports.backTop = function (btnId) {
        var btn = document.getElementById(btnId);
        var d = document.documentElement;
        var b = document.body;
        window.onscroll = set;
        btn.style.display = "none";
        btn.onclick = function () {
            btn.style.display = "none";
            window.onscroll = null;
            this.timer = setInterval(function () {
                d.scrollTop -= Math.ceil((d.scrollTop + b.scrollTop) * 0.1);
                b.scrollTop -= Math.ceil((d.scrollTop + b.scrollTop) * 0.1);
                if ((d.scrollTop + b.scrollTop) == 0) clearInterval(btn.timer, window.onscroll = set);
            }, 10);
        };
        function set() {
            btn.style.display = (d.scrollTop + b.scrollTop > 100) ? 'block' : "none"
        }
    };
    /*
     * 公共绑定左侧菜单事件
     */
    exports.onFun = function (eventsList) {
        var _this = this;
        var events = {
            //左侧导航当前状态切换
            title: function () {
                $('.b_title').on('click', function (e) {
                    if (!$(this).find('a').hasClass('cursor-def')) {
                        $(this).addClass('cur_b').siblings('.b_title').removeClass('cur_b');
                    }
                });
            },
            //二级菜单显示隐藏
            trans: function () {
                $('.trans').on('click', function (e) {
                    if (!$(this).find('a').hasClass('cursor-def')) {
                        if ($(this).next('ul').hasClass("show")) {
                            $(this).next('ul').removeClass('show').addClass('hide');
                            $(".ci-right").addClass('ci-right-rotate')
                        } else {
                            $(this).next('ul').removeClass('hide').addClass('show');
                            $(".ci-right").removeClass('ci-right-rotate');
                        }
                    }
                });
            },
            //三级菜单当前状态切换
            tree: function () {
                $('.h_tree').on('click', function (e) {
                    $('.h_tree').removeClass('s_cur');
                    $(this).addClass('s_cur');
                    $(".dot_s").removeClass('dot');
                    $(this).find('span:eq(0)').addClass('dot');
                });
            }
        };
        $.each(eventsList, function (i, n) {
            if (!_this.validation.isNull(n))events[n]();
        });
        //同步 导航列表 和右侧内容的背景色
        var $nav = $('.index_navL'),	//导航 菜单
            $ne = $nav.next('div'),	//内容div
            heig = 'min-height';	//设置 最小高度 ie时 设置高度
        if ($nav.length > 0 && $ne.length > 0) {
            //当两个内容同事存在时 调用
            if (navigator.appName == "Microsoft Internet Explorer") {
                var version = navigator.appVersion.split(";")[1].replace(/[ ]/g, "");
                if (version == "MSIE6.0")heig = 'height';
            }
            $ne.css(heig, $nav.outerHeight());//设置最小高度
            if ($('.index_navR').length > 0) {
                $('.index_navR').css(heig, $nav.outerHeight());
            }
        }

        _this.onFunMsg(); //绑定头部导航条 点击信息隐藏红点事件
        /*回到顶部*/
        if ($('#gotop').length > 0) {
            var calBackTop = function () {
                var left = $(window).width() - 36;
                if (left > 1180) {
                    left = $('.cp_footer').offset().left + 1190;
                }
                $('#gotop').css("left", left + 'px');
            };
            calBackTop();
            $(window).resize(function () {
                calBackTop();
            });
            _this.backTop('gotop');
        }
        /*ie6 一些hover不生效的情况下，做些处理*/

        _this.isIE(function (ie5, ie6) {
            if (ie5 || ie6) {
                $('.head_right_img').hover(function () {
                    $(this).find('.person_list').show();
                }, function () {
                    $(this).find('.person_list').hide();
                });
                $('.menu p').hover(function () {
                    $(this).addClass('act');
                }, function () {
                    $(this).removeClass('act');
                });
                $('.nav_person_modal,.pic_dt_modal').hide(); //头部头像，ie才不圆角  首页大头像，ie6 不圆角
                $('.head_right_img').hover(function () {
                    $('.person_list').show();
                }, function () {
                    $('.person_list').hide();
                })
            }
        });
    };
    /**
     * @description    绑定头部导航 跳转信息事件        点击元素 隐藏红点
     * @parameter
     * @type
     * @return
     * @author        zys        6-24
     */
    exports.onFunMsg = function () {
        //绑定头部导航条 点击信息隐藏红点事件
        $('.menu .father').off().on('click', function () {
            $(this).find('.spot1').hide();
        });
        //点击其他区域，给下拉框隐藏
        var $hide = $('<p>');
        $hide.on('hideSelect', function (e, type) {
            if (type === 0) {
                $('.select .select_ul:visible').find('.cur').trigger('click');
            } else if (type === 1) {
                $('.choice .select_ul1').hide();//for 答疑搜索
            }
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
        });
        $(document).on({
            click: function (e) {
                if ($(e.target).parents('.select').length === 0 && !$(e.target).hasClass('select') && $('.select .select_ul:visible').length > 0) {
                    $hide.trigger('hideSelect', 0); //下拉框
                } else if ($(e.target).parents('.select1').length === 0 && !$(e.target).hasClass('select1') && $('.select1 .select_ul1:visible').length > 0) {
                    $hide.trigger('hideSelect', 1); //选择框，for答疑搜索
                }
            }/*,
             selectstart: function(){
             return false;
             }*/
        }, 'body,#bodyMask>div').on({
            // placeholder 兼容ie
            click: function (e) {
                $(this).next().focus();
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
                }
            }/*,
             selectstart: function(){
             return false;
             }*/
        }, '.inp-bg-pl');

        var _this = this;
        $.each($('input[type=text]:visible'), function (i, n) {
            if (!_this.validation.isNull(n.value)) {
                $(n).prev('.inp-bg-pl').hide();
            }
        });
    };
    /**@description    表单验证
     * @parameter
     * @type        boolean
     * @return        true/false
     */
    exports.validation = {

        // 检查字符串是否为数字
        number: function (formString) {
            return /^[0-9]\d*$/.test(formString);
        },
        // 检查字符串是否为email
        email: function (formString) {
            //  return /^[a-zA-Z0-9]{1}([\._a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+){1,3}$/.test(formString);
            //邮箱验证前后台保持一致
            return /^([a-zA-Z0-9]*[_]*[a-zA-Z0-9]+)+@([a-zA-Z0-9]*[\.]?[_]?[a-zA-Z0-9]+)+[\.][A-Za-z]{2,3}$/.test(formString);
        },
        // 检查字符串是否为电话号码
        telephone: function (formString) {
            return /(\d{3}-|\d{4}-)?(\d{8}|\d{7})?/.test(formString);
        },
        // 检查字符串是否为手机号码
        phone: function (formString) {
            return /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/.test(formString);
        },
        // 检查用户名是否符合规定
        username: function (formString) {
            return /^[a-zA-z][a-zA-Z0-9_]{2,9}$/.test(formString);
        },
        // 检查是否是身份证号码，兼具15位和18位身份证
        idCard: function (formString) {
            return /(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(formString);
        },
        // 检查是否为拉丁字母
        latine: function (formString) {
            return /^[a-z\_\-A-Z]*$/.test(formString);
        },
        // 检查是否为中文字（Unicode）
        chinese: function (formString) {
            return /^[\u4e00-\u9fff]$/.test(formString);
        },
        // 检查是否为合法的URL
        url: function (formString) {
            return /^(\w+:\/\/)?\w+(\.\w+)+.*$/.test(formString);
        },
        // 检查是否为合法的邮编
        postCode: function (formString) {
            return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(formString);
        },
        // 检查是否为空
        isNull: function (formString) {
            formString.trim();
            return !formString || formString == '' || formString == 'null' || formString == 'undefined';
        },
        //中文、英文、数字但不包括下划线等符号
        checkCEN: function (formString) {
            return /^[\u4e00-\u9fffa-zA-Z0-9]+$/.test(formString);
        },
        //浮点数		保留两位小数
        checkIfFloat: function (formString) {
            return /^\d+(\.\d{1,2})?$/.test(formString);
        }
    };
    /*
     **@description 	弹出层蒙版 打开
     * @parameter{ele:'.class',callback}
     * @parameter	ele.isOpt	true/false 是否透明
     * @return
     */
    exports.showMask = function (opt) {
        var $body = $('body'),
            $mask = $body.find('#bodyMask');
        if (!$mask || $mask.length <= 0) {
            $body.append($('<div>', {
                id: 'bodyMask',
                'class': 'body_mask',
                click: function (e) {
                    //阻止冒泡
                    if (e && e.stopPropagation) {
                        e.stopPropagation()
                    } else {
                        window.event.cancelBubble = true;
                    }
                    //return false;
                }
            }).html($(opt.ele)));
        }
        if (!!opt.isOpt) {
            $body.find('#bodyMask').addClass('body_mask1');
        } else {
            $body.find('#bodyMask').removeClass('body_mask1');
        }
        $body.find('#bodyMask').show().find(opt.ele).show();
        this.isIE(function (ie5, ie6) {
            if (ie6) {
                var $top = $body.find('#bodyMask').show().find(opt.pop ? opt.pop : opt.ele),
                    top = $top.data('top') || parseInt($top.css('top'));
                $top.css('top', ($(window).scrollTop() + top) + 'px');
                $top.data('top', top);
            }
        });
        if (opt.callback)opt.callback();
        $('html').css('overflow', 'hidden');
    };
    /*
     **@description 	弹出层蒙版 打开	不禁止背景滚动
     * @parameter{ele:'.class',callback}
     * @parameter	ele.isOpt	true/false 是否透明
     * @return
     */
    exports.showMaskSco = function (opt) {
        var $body = $('body'),
            $mask = $body.find('#bodyMask');
        if (!$mask || $mask.length <= 0) {
            $body.append($('<div>', {
                id: 'bodyMask',
                'class': 'body_mask',
                click: function (e) {
                    //阻止冒泡
                    if (e && e.stopPropagation) {
                        e.stopPropagation()
                    } else {
                        window.event.cancelBubble = true;
                    }
                    //return false;
                }
            }).html($(opt.ele)));
        }
        if (!!opt.isOpt) {
            $body.find('#bodyMask').addClass('body_mask1');
        } else {
            $body.find('#bodyMask').removeClass('body_mask1');
        }
        $body.find('#bodyMask').show().find(opt.pop ? opt.pop : opt.ele).show();

        this.isIE(function (ie5, ie6) {
            if (ie6) {
                var $top = $body.find('#bodyMask').show().find(opt.pop ? opt.pop : opt.ele),
                    top = $top.data('top') || parseInt($top.css('top'));
                $top.css('top', ($(window).scrollTop() + top) + 'px');
                $top.data('top', top);
            }
        });
        if (opt.callback)opt.callback();
    };

    /*
     **@description 	弹出层蒙版 关闭
     * @parameter
     * @return
     */
    exports.hideMask = function () {
        $('body').append($('#bodyMask').children('div').hide());
        $('html').css('overflow', 'auto');
        $('#bodyMask').remove();
    };
    /*
     **@description 	弹出层蒙版 关闭 for电商
     * @parameter
     * @return
     */
    exports.hideMaskSco = function () {
        //$('body').append($('#bodyMask').children('div').hide());
        $('html').css('overflow', 'auto');
        $('#bodyMask').remove();
    };
    /*
     **@description     loading 效果
     * @parameter
     * @return
     */
    exports.showLoading = function () {
        var _this = this;
        _this.showMaskSco({
            isOpt: !0,
            pop: '.com-loading',
            ele: '<div class="com-loading"></div>'
        });
    };
    /*
     **@description     计算随屏left值
     * @parameter  type 1 电商 首页，购物车 电商详情页面;2 member 首页 我的订单；
     * @return
     */
    exports.calcFixedMenu = function (type) {
        var $mar, //左边距计算
            jw = 1244, //判断的width
            $fix = $('.fixed_menu'); //浮动元素
        if (type === 1) {
            $mar = $('.w');
        } else if (type === 2) {
            $mar = $('.warp');
        }
        function calcMenu() {
            var w = $(window).width() - $fix.width() - 8;
            w = w > jw ? $mar.offset().left + 1188 : w;
            $fix.css("left", w + 'px');
        };
        if (!!$mar.length && !!$fix.length) {
            $(window).on('resize', calcMenu);
            calcMenu();
            $(window).scroll(function(){
                var banner_hd=$(window).height();
                var w_scroll=$(window).scrollTop();
                if(w_scroll > banner_hd){
                    $(".fixed_menu .a_back").show(500);
                }else{
                    $(".fixed_menu .a_back").hide();
                }
            });
        }
    };
    /*
     **@description     购物车效果
     * @parameter
     * @return
     */
    exports.flyToCar = function (_this, _to, image, callback) {
        var start = _this[0].getBoundingClientRect();
        var end = _to[0].getBoundingClientRect();
        if (navigator.appName == "Microsoft Internet Explorer" && parseFloat(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace('MSIE', '')) < 9) {
            start = $.extend({}, start);
            start.width = _this[0].scrollWidth;
            start.height = _this[0].scrollHeight;
            end = $.extend({}, end);
            end.width = _to.width();
            end.height = _to.height();
        }
        new FlyToCar({
            staPos: {left: start.left + start.width / 2, top: start.top + start.height / 2},
            endPos: {left: end.left + end.width / 2, top: end.top + 10},
            height: 25,
            width: 20,
            image: image,
            complete: function (data) {
                !!callback && callback(data);
                data.remove();
            }
        });
    };
    /**
     * @description    ie版本判断
     * @parameter callback 回调函数，分别返回ie下的判断
     * */
    exports.isIE = function (callback) {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
        var isSafari = userAgent.indexOf("Safari") > -1; //判断是否Safari浏览器
        if (isIE) {
            var IE5 = IE55 = IE6 = IE7 = IE8 = false;
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            IE55 = fIEVersion == 5.5;
            IE6 = fIEVersion == 6.0;
            IE7 = fIEVersion == 7.0;
            IE8 = fIEVersion == 8.0;
            if (IE55 || IE6 || IE7 || IE8) {
                // 5 6 7 8
                callback(IE55, IE6, IE7, IE8);
            } else {
                //other
            }
        } else {
            //other
        }

    }

    /**
     * @description 返回公用弹框 html结构
     * @parameter flag true | false true>单个按钮弹框，false双个按钮弹框
     * @parameter msg1 消息提示1 展示错误消息，第一行
     * @parameter msg2 消息提示2 展示错误消息，第二行 （可不传，不传情况，仅展示第一行提示）
     * @data 2016/10/31
     * @return string
     * */
    exports.getAlertHtml = function (flag, msg1, msg2) {
        return ['<div class="com_pop_content">',
            '<div class="close"></div>',
            '<div class="tit"></div>',
            '<div class="text">',
            '<p class="marb12">' + msg1 + '</p>',
            '<p>' + (msg2 || '') + '</p>',
            (flag ? '<div class="yes">确定</div>' : ''),
            '</div>',
            (flag ? '' : '<div class="handle"><span class="cancel">取消</span><span class="sure">确定</span></div>'),
            '</div>'
        ].join('');
    }
    /**
     * 返回编写笔记的html结构
     * 2016/11/19
     * zys
     * */
    exports.getNoteHtml = function () {
        return ['<div class="pop editQues" style="display: block;">',
            '    <div class="pop_title">',
            '        <span class="pop_title_tip font16">修改笔记</span>',
            '        <div class="close"></div>',
            '    </div>',
            '    <div class="pop_container">',
            '        <div class="pop_content clearfix">',
            '            <div class="v_show mart20 clearfix">',
            '                <div class="clearfix">',
            '                    <div class="inp_label inp_label_tit">标题：</div>',
            '                    <span class="tit_info fr">30个字符以内</span>',
            '                </div>',
            '                <input id="title_text" class="ba_bor inp_text" maxlength="30" type="text">',
            '            </div>',
            '            <div class="mart16 clearfix">',
            '                <div class="clearfix">',
            '                    <div class="inp_label inp_label_tit">内容：</div>',
            '                    <span class="text-area-len fr">还可输入<label>500</label>个字</span>',
            '                </div>',
            '                <textarea id="content_text" class="ba_bor inp_area"></textarea>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="pop_bottom mart0 clearfix">',
            '        <div class="pop_btn p_concel fl">取&nbsp;消</div>',
            '        <div class="pop_btn p_sure fl">确&nbsp;定</div>',
            '    </div>',
            '</div>'].join("");
    }
    /**
     * 补充效果
     * 2016/11/19
     * zys
     * */
    exports.effect = {
        /*
         * 输入字符过长，闪烁效果
         * 2016/11/19
         * zys
         * @params _this 要闪烁的元素
         * */
        twink: function (_this) {
            var timer = null;
            if (!_this.data().animate) {
                _this.data({count: 0, flag: false, animate: true});
                timer = setInterval(function () {
                    if (_this.data().count >= 4) {
                        clearInterval(timer);
                        _this.data().animate = false;
                    } else {
                        if (_this.data().flag) {
                            _this.css('background', 'rgb(255,208,208)');
                            _this.data().flag = false;
                        } else {
                            _this.css('background', 'rgb(255,255,255)');
                            _this.data().flag = true;
                            _this.data().count += 1;
                        }
                    }
                }, 80);
            }
        }
    }
    /**
     *@description  String扩展
     *@return        newStr
     */
    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }

    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }

    String.prototype.LTrim = function () {
        return this.replace(/(^\s*)/g, "");
    }

    String.prototype.RTrim = function () {
        return this.replace(/(\s*$)/g, "");
    }
    String.prototype.startWith = function (str) {
        return this.indexof(str) == 0;
    }
    String.prototype.startWith = function (str, len) {
        var temp,
            icount = 0,
            patrn = /[^\x00-\xff]/,
            strre = "";

        for (var i = 0; i < str.length; i++) {
            if (icount < len - 1) {
                temp = str.substr(i, 1);
                if (patrn.exec(temp) == null) {
                    icount = icount + 1
                } else {
                    icount = icount + 2
                }
                strre += temp
            } else {
                break;
            }
        }
        return strre + "...";
    }


    /**
     *@description  Array扩展
     *@return        newArray
     */
    Array.prototype.insert = function (startIndex, data) {
        this.splice(startIndex, 0, data);
        return this;
    }
    Array.prototype.del = function (startIndex, delLen) {
        this.splice(startIndex, delLen);
        return this;
    }
    Array.prototype.replace = function (index, obj) {
        this.splice(index, 1, obj);
        return this;
    }
    Array.prototype.subArray = function (startIndex, len) {
        return this.slice(startIndex, startIndex + len);
    }

    /**
     *@description  Date扩展
     *@return        newArray
     */
    Date.prototype.getDateString = function () {  //鏄剧ず 骞存湀鏃?
        return this.toLocaleDateString();
    }
    Date.prototype.getTimeString = function () {  //鏄剧ず 鏃跺垎绉?
        return this.toLocaleTimeString();
    }


});