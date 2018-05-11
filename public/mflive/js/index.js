
$(function () {
    var _data_ = {
        controlH: 50,
        titleH: 90,
        windowW: 0,
        windowH: 0,
        videoW: 0,
        videoH: 0,
        player: '',
        retry: {
            'getUserinfo': 0,
            'getInitConfig': 0,
            'getLiveSource': 0,
        },
        playerParams: {
            id: 'video-player',
            opt: {
                sources: [{
                    src: '//d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
                    type: 'application/x-mpegURL',
                }],
                width: 150,
                height: 100,
            },
            volume: 0.8,
            volumeBk: 0.8,
            playing: false,
            mouseInVolumeBar: false,
            volumeRodiaPosition: {
                transformY: 6 - 0.8 * 122,
            }
        }

    };
    var Func = {
        init: function() {
            this.getWH();
            // _data_.ajaxCount = 2;
            // this.getUserinfo();
            // this.getInitConfig();
            this.initVideo();
        },
        getInitConfig: function() {
            $.ajax({
                url: _data_.api + '/api/get_video_status',
                type: 'GET',
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                timeout: 10000,
                success: function(res) {
                    if (res.code === 1) {
                        
                    }
                },
                error: function (x, t, m) { 
                    _data_.retry['getInitConfig'] += 1;
                    if(_data_.retry['getInitConfig'] > 3) {
                        alert('网络状态不佳，请稍候重试');
                        console.log(err);
                    }
                 }
            })
        },
        getLiveSource: function () {
            $.ajax({
                url: _data_.api + '/api/get_video_status',
                type: 'GET',
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                timeout: 10000,
                success: function(res) {
                    if (res.code === 1) {
                        _data_.liveSource = res.info;
                    } else {

                    }
                },
                error: function (x, t, m) { 
                    _data_.retry['getLiveSource'] += 1;
                    if(_data_.retry['getLiveSource'] > 3) {
                        alert('网络状态不佳，请稍候重试');
                        console.log(err)
                    }
                 }
            })
        },
        getUserinfo: function() {
            $.ajax({
                url: '',
                data: '',
                type: 'GET',
                success: function(res) {
                    
                }, 
                error: {

                }
            })
        },
        getWH: function() {
            _data_.windowW = document.documentElement.clientWidth || window.innerWidth;
            _data_.windowH = document.documentElement.clientHeight || window.innerHeight;
            _data_.videoW = _data_.windowW;
            _data_.videoH = ~~(_data_.windowH - 70 * 2);
        },
        static: function() {
            var obj = {
                count: 0,
                cnt: function() {
                    obj.count += 1;
                    if (obj.count == _data_.ajaxCount) {
                        obj.done();
                    }
                },
                done: function() {
                    this.initVideo()
                }
            };            
            return obj;
        },
        initVideo: function() {
            var self = this;
            _data_.playerParams.opt.height = _data_.videoH;
            _data_.playerParams.opt.width = _data_.videoW;
            _data_.player = videojs(_data_.playerParams.id, _data_.playerParams.opt, function onready() {
                console.log('播放器初始化完成')
                this.on('play', function() {
                    _data_.playerParams.playing = true;
                    $('.video-control .start-end i').removeClass('play').addClass('pause')
                })
                this.on('pause', function() {
                    _data_.playerParams.playing = false;
                    $('.video-control .start-end i').removeClass('pause').addClass('play')
                }) 
                self.player();
            })
        },
        player: function() {  // 播放相关方法
            var player = _data_.player;
            bindEvent();
            function bindEvent() {

                // 暂停、播放
                $('.video-control .start-end i').click(function () {
                    if ($(this).hasClass('play')) {
                        _data_.playerParams.playing = true;
                        $(this).removeClass('play').addClass('pause');
                        play();
                    } else {
                        _data_.playerParams.playing = false;
                        $(this).removeClass('pause').addClass('play');
                        pause();
                    }
                })

                // 刷新
                $('.video-control .reload i').click(function () {
                    reload();
                })
                
                // 喇叭禁音
                $('.video-control .volume .speaker').click(function () {
                    
                    if($(this).hasClass('on')) {
                        setVolume(_data_.playerParams.volumeBk);
                        $(this).removeClass('on').addClass('off');
                        $(this).siblings('.volume-wrap').find('.volume-active').css('height',  (_data_.playerParams.volumeBk * 122) + 'px');
                        $(this).siblings('.volume-wrap').find('.volume-radio').css('transform',  'translate3d(0, '+ (6 - (_data_.playerParams.volumeBk * 122)) +'px, 0)');
                    } else {
                        _data_.playerParams.volume = 0
                        setVolume(_data_.playerParams.volume);
                        $(this).removeClass('off').addClass('on');
                        $(this).siblings('.volume-wrap').find('.volume-active').css('height',  (_data_.playerParams.volume * 122) + 'px');
                        $(this).siblings('.volume-wrap').find('.volume-radio').css('transform',  'translate3d(0, '+ (6 - (_data_.playerParams.volume * 122)) +'px, 0)');
                    }
                })
                // 喇叭悬浮   
                $('.video-control .volume .speaker').hover(function() {
                    $(this).siblings('.volume-wrap').show();
                    _data_.playerParams.mouseInVolumeBar = true;
                }, function() {
                    var self = this;
                    _data_.playerParams.mouseInVolumeBar = false;
                    setTimeout(function() {
                        if (!_data_.playerParams.mouseInVolumeBar) {
                            $(self).siblings('.volume-wrap').hide();
                        }
                    }, 2000)
                });

                // 音量控制条悬浮
                $('.video-control .volume .volume-wrap').hover(function() {
                    $(this).show();
                    _data_.playerParams.mouseInVolumeBar = true;
                }, function() {
                    var self = this;
                    _data_.playerParams.mouseInVolumeBar = false;
                    setTimeout(function() {
                        if (!_data_.playerParams.mouseInVolumeBar) {
                            $(self).hide()
                        }
                    },2000)
                })

                // 拖动音量处理
                $('.video-control .volume .volume-radio')[0].addEventListener('mousedown', function(e) {
                    _data_.playerParams.mouseInVolumeBar = true;
                    _data_.playerParams.volumeRodiaPosition.moving = true;
                    _data_.playerParams.volumeRodiaPosition.Y = e.pageY;
                    _data_.playerParams.volumeRodiaPosition.offsetY = 0;
                })

                $('.video-control .volume .volume-wrap')[0].addEventListener('mousemove', function(e) {
                      
                    if (!_data_.playerParams.volumeRodiaPosition.moving) return 
                    e.preventDefault();
                    _data_.playerParams.volumeRodiaPosition.offsetY += e.pageY - _data_.playerParams.volumeRodiaPosition.Y;
                    var temp;

                    if ($('.video-control .volume .speaker').hasClass('on')) { //  禁音状态拖动
                        temp = _data_.playerParams.volume - _data_.playerParams.volumeRodiaPosition.offsetY / 122;
                    } else { // 非禁音拖动
                        temp = _data_.playerParams.volumeBk - _data_.playerParams.volumeRodiaPosition.offsetY / 122;
                    }

                    if (temp > 0.5) {
                        $('.video-control .volume .speaker').addClass('more')
                    } else if (temp > 0) {
                        $('.video-control .volume .speaker').addClass('little off').removeClass('on more');
                    } else {
                        $('.video-control .volume .speaker').addClass('on').removeClass('off little more');
                    }
                    
                    if (temp > 1 || temp < 0) {
                        return 
                    }
                    _data_.playerParams.volumeBk = _data_.playerParams.volume = temp;
                    _data_.playerParams.volumeRodiaPosition.Y = e.pageY;
                    _data_.playerParams.volumeRodiaPosition.offsetY = 0;

                    $('.video-control .volume .volume-radio')[0].style.transform = 'translate3d(0, '+ (6 - _data_.playerParams.volume * 122) +'px, 0)';
                    $('.video-control .volume .volume-active')[0].style.height = (_data_.playerParams.volumeBk * 122) + 'px';
                    setVolume(_data_.playerParams.volume);
                })
                $.each(['mouseup', 'mouseleave'], function(index, item) {
                    (function(evt){
                        $('.video-control .volume .volume-wrap')[0].addEventListener(evt, function(e) {
                            e.preventDefault();
                            _data_.playerParams.volumeRodiaPosition.moving = false;
                            _data_.playerParams.mouseInVolumeBar = false;
                        })
                    })(item)
                });

                // 切换视频源
                $('.video-control .change-source .show').click(function() {
                    if($(this).siblings('.select-list').css('opacity') == 1) {
                        $(this).siblings('.select-list').css('opacity', 0);
                    } else {
                        $(this).siblings('.select-list').css('opacity', 1);
                    }
                })

                $('.video-control .change-source .select-list').mouseleave(function() {
                    $(this).css('opacity', 0);
                })
                $('.video-control .change-source .select-list').click(function() {
                    $(this).css('opacity', 0);
                    var sources = [{
                        src: $(this).data('src'),
                        type: 'application/x-mpegURL',
                    }]
                    reload(sources);
                })

                // 弹幕开关
                $('.video-control .danmu i').click(function() {
                    if($(this).hasClass('on')) {
                        $(this).addClass('off').removeClass('on');
                        //  开弹幕
                        
                    } else {
                        $(this).addClass('on').removeClass('off');
                        // 关弹幕

                    }
                })
            }
            
            function play() {
                player.play();
            }
            function pause() {
                player.pause();
            }
            function reload(sources) {
                player.src(sources || _data_.playerParams.opt.sources);
                if (_data_.playerParams.playing) {
                    play()
                }
            }
            function setVolume(float) { 
                player.volume(parseFloat(float.toFixed(2), 10))
            }
            function setWidth(num) {
                player.width(num)
            }
            function setHeiht(num) {
                player.height(num)
            }
        }
    };

    Func.init();
 })