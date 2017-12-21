/**
 * Created by 10975 on 2017/11/1.
 */
 if(!window.sessionStorage.getItem('user')){
     window.location = '../login.html'
 }


var server_base = 'http://47.97.96.152'
showWordCloud();
$('#search').click(function () {
    search();
});
$('#trans').click(function () {
    var inputs = $('.search-input');
    var keyWord = "";
    for (var i = 0; i < inputs.length; i++)
        if (inputs[i].value != "")
            keyWord += inputs[i].value + " ";
    console.log(keyWord);
    if (keyWord == "")
        $('#trans-res').html("请输入关键字！");
    else {
        $('#trans-res').html("");
        keyWordTrans(keyWord);
    }
});


//展示地图
function map(searchRes) {
    $("#map").css({ "display": "block" });
    var worldJson;

    //获取地图数据
    $.ajaxSettings.async = false;
    $.getJSON("../data/world.json", function(data) {
        worldJson = data;
    });

    //echarts显示地图
    var map = echarts.init(document.getElementById('map'));
    echarts.registerMap('world', worldJson);
    var option = {
        title: {
            text: '热点地图'
        },
        backroundColor: '#404a59',
        series: [{
            name: '热度',
            type: 'scatter',
            coordinateSystem: 'geo',
            encode: {
                label: 2
            },
            data: convertToMapData(searchRes),
            symbol: 'pin',
            symbolSize: function(val) {
                var result = val[2] / 8;
                return result > 100 ? 100 : result;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function (obj) {
                        //console.log(obj);
                        var name = obj.data.name;
                        var value = obj.data.value[2];
                        return name + "\n结果数量: " + value;
                    },
                    position: 'right'
                }
            }
        }, ],
        geo: {
            map: 'world',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            roam: false,
            itemStyle: {
                normal: {
                    //color: '#044161',
                    areaColor: '#004981',
                    borderColor: '#029fd4'
                },
                emphasis: {
                    areaColor: '#029fd4',
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                }
            }
        }

    }
    map.setOption(option);
}

//将返回结果转为地图上显示的数据
function convertToMapData(searchRes) {
    var country;
    var countryTable;
    $.ajaxSettings.async = false;

    //国家经纬度信息
    $.getJSON("../data/capitalLL.json", function(data) {
        country = data;
    });
    $.getJSON("../data/capitalTable.json", function(data) {
        countryTable = data;
    });
    for (x in searchRes)
        country[countryTable[searchRes[x].key]].value[2] = searchRes[x].doc_count;
    //console.log(country);
    return country;
}


var unicode2utf8 = function(unicode) {
    return unicode.replace(/%u([0-9a-fA-F]+)/g, function(match, hex) {
      var utf8CharCodes = [];
      c = parseInt(hex, 16);
      if (c < 128) {
        utf8CharCodes.push(c);
      } else if (c < 2048) {
        utf8CharCodes.push((c >> 6) | 192, (c & 63) | 128);
      } else if (c < 65536) {
        utf8CharCodes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
      } else {
        utf8CharCodes.push((c >> 18) | 240, ((c >> 12) & 63) | 128, ((c >> 6) & 63) | 128, (c & 63) | 128);
      }
      for (var i=utf8CharCodes.length-1;i>=0;i--) {
        utf8CharCodes[i] = '%' + utf8CharCodes[i].toString(16);
      }
      return utf8CharCodes.join('');
    });
};

//翻译关键字
function keyWordTrans(keyWord) {
    var languageName = {
        'en': '英文',
        'jp': '日文',
        'kor': '朝鲜文',
        'fra': '法文',
        'spa': '拉丁文',
        'th': '泰文',
        'ara': '阿拉伯文',
        'ru': '俄文',
        'pt': '葡萄牙文',
        'de': '德文',
        'it': '意大利文',
        'el': '希腊文',
        'nl': '荷兰文',
        'pl': '波兰文',
        'bul': '保加利亚文',
        'est': '西班牙文',
        'dan': '丹麦文',
        'fin': '芬兰文',
        'cd': '刚果文',
        'rom': '罗马尼亚文',
        'slo': '斯洛文尼亚文',
        'swe': '瑞典文',
        'hu': '克罗地亚文',
        'cht': '中文繁体',
        'vie': '越南文'
    };
    var result = "";
    $("#trans-res").html("");
    var appid = '2015063000000001';
    var key = '12345678';
    var salt = (new Date).getTime();
    var query = unicode2utf8(keyWord);
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'auto';
    var to = ['en', 'jp', 'kor', 'fra', 'spa', 'th', 'ara', 'ru', 'pt', 'de', 'it', 'el', 'nl',
        'pl', 'bul', 'est', 'dan', 'fin', 'cs', 'rom', 'slo', 'swe', 'hu', 'cht', 'vie'
    ];
    var str1 = appid + query + salt + key;
    var sign = MD5(str1);
    // f1的任务代码
    for (x in to) {
        trans(x);
    }
    

    function trans(x) {
        console.log(x)
        $.ajax({
            async: false,
            url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
            type: 'get',
            dataType: 'jsonp',
            data: {
                q: query,
                appid: appid,
                salt: salt,
                from: from,
                to: to[x],
                sign: sign
            },
            success: function(data) {
                //console.log(data);
                $("#trans-res").html($("#trans-res").html() + languageName[to[x]] + ": " + data.trans_result[0].dst + '  ----  ');
            }
        });
    }

}

//词云图
function wordCloud(data) {
    var option = {
        title: {
            text: '搜索历史',
            x: 'center',
            textStyle: {
                fontSize: 23
            }
        },
        backgroundColor: '#F7F7F7',
        series: [{
            name: '搜索历史',
            type: 'wordCloud',
            sizeRange: [12, 80],
            rotationRange: [-45, 90],
            textPadding: 0,
            autoSize: {
                enable: true,
                minSize: 6
            },
            textStyle: {
                normal: {
                    color: function() {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        }]
    };
    var wordCloud = echarts.init(document.getElementById('wordCloud'));
    wordCloud.setOption(option);
}

//词云图显示
function showWordCloud() {
    var url = server_base+'/api/moh/history';

    $.ajax({
        async: true,
        url: url,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            var wordCloudData = [];
            var key;
            //console.log(data);
            for (key in data)
                wordCloudData.push({ "name": key, "value": data[key] });
            wordCloud(wordCloudData);
        }
    });
}

//整合请求信息
function createRequestData(size, from, should) {
    var sort = $("#sort option:selected").val();
    var type = $("#attachment option:selected").val();
    var nation = [];
    var language = [];

    if ($('#nation').val() == "")
        nation.push("all");
    else
        nation = ((String)($('#nation').val())).split(" ");

    if ($('#language').val() == "")
        language.push("all");
    else
        language = ((String)($('#language').val())).split(" ");

    var requestData = {
        "should": should,
        "size": size,
        "from": from,
        "sort": sort,
        "filters": [
            {"name": "type", "value": [type]},
            {"name": "nation", "value": nation},
            {"name": "language", "value": language}
            ]
    };
    return JSON.stringify(requestData);
}

//递交搜索请求，得到结果后分页显示
function searchRes(searchDataJson) {
    var url = server_base+'/api/moh/es/search';
    //var num = 20;
    console.log(searchData);
    var searchData = JSON.parse(searchDataJson);

    $.ajax({
        async: true,
        url: url,
        contentType: 'application/json',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(searchData),
        success: function(requestRes) {
            var mapData = requestRes['nation_distribution'];
            //var data = requestRes['records'];
            var pageNum = Math.ceil(requestRes['total'] / searchData['size']);
            pageNum = pageNum < 1 ? 1 : pageNum;
            //console.log(mapData);
            map(mapData);

            var showData = function(currentPage) {
                currentPage = (currentPage - 1) * searchData['size'];
                searchData.from = currentPage;
                console.log(searchData);

                $.ajax({
                    async: true,
                    url: url,
                    type: 'post',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(searchData),
                    success: function(requestRes_2) {
                        var data = requestRes_2['records'];
                        //console.log(createRequestData(num, currentPage));
                        //console.log(requestRes_2);
                        var str = '';

                        for (var i = 0; i < data.length; i++) {
                            str += '<tr class="row">';
                            str += '<th><a href="'+server_base+'/'+ data[i]['local_url'] +
                                '">' + data[i]['title'] + '</a></th>';
                            str += '<th id="trans' + i + '"></th>';
                            str += '<th><a href="' + data[i]['url'] + '">原地址</a></th>';
                            str += '<th>' + data[i]['nation'] + '</th>';
                            str += '<th>' + data[i]['language'] + '</th>';
                            str += '</tr>';
                        }
                        $('#data_table').html(str);
                        str = '';
                        for (var i = 0; i < data.length; i++) {
                            tranTitle(i);
                        }(i);

                        function tranTitle(i) {
                            var appid = '2015063000000001';
                            var key = '12345678';
                            var salt = (new Date).getTime();
                            var query = data[i]['title'];
                            var from = 'auto';
                            var to = 'zh';
                            var str1 = appid + query + salt + key;
                            var sign = MD5(str1);
                            $.ajax({
                                url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
                                type: 'get',
                                dataType: 'jsonp',
                                data: {
                                    q: query,
                                    appid: appid,
                                    salt: salt,
                                    from: from,
                                    to: to,
                                    sign: sign
                                },
                                success: function(data) {
                                    console.log(data)
                                    $("#trans" + i).html(data.trans_result[0].dst);
                                }
                            });
                        }
                    }
                });
            }

            laypage({
                cont: 'laypage',
                pages: pageNum,
                jump: function(obj) {
                    showData(obj.curr);
                    //console.log(obj);
                }
            });
        }

    });
}

//逆波兰式解析字符串至数组
function textToArr(text) {
    var start = 0;
    var end;
    var stringArr = [];
    var stack = [];
    var postfix = [];
    var result = [];
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == '&' || text.charAt(i) == ' ') {
            end = i;
            stringArr.push(text.substring(start, end));
            stringArr.push(text.charAt(i));
            start = i + 1;
        }
    }
    stringArr.push(text.substring(start, text.length));
    //return stringArr;
    for (var i = 0; i < stringArr.length; i++) {
        if (stringArr[i] == '&' || stringArr[i] == ' ') {
            if (stack.length == 0)
                stack.push(stringArr[i]);
            else {
                while (compare(stack[stack.length - 1], stringArr[i])) {
                    postfix.push(stack.pop());
                }
                stack.push(stringArr[i]);
            }
        } else
            postfix.push(stringArr[i]);
    }
    while (stack.length > 0) {
        postfix.push(stack.pop());
    }
    //return postfix;

    for (var i = 0; i < postfix.length; i++) {
        if (postfix[i] == '&') {
            var tmp1 = stack.pop();
            var tmp2 = stack.pop();
            if (tmp1 instanceof Array && tmp2 instanceof Array)
                stack.push(tmp1.concat(tmp2));
            else if (tmp1 instanceof Array) {
                tmp1.push(tmp2);
                stack.push(tmp1);
            } else if (tmp2 instanceof Array) {
                tmp2.push(tmp1);
                stack.push(tmp2);
            } else
                stack.push([tmp2, tmp1]);
        } else if (postfix[i] == ' ') {} else
            stack.push(postfix[i]);
    }
    for (var i = 0; i < stack.length; i++) {
        if (!(stack[i] instanceof Array))
            stack[i] = [stack[i]];
    }
    //console.log(stringArr);
    //console.log(postfix);
    //console.log(stack);
    return stack;

    //比较符号优先级
    function compare(a, b) {
        if (a == '&' && b == '&' || a == '&' && b == ' ' || a == ' ' && b == ' ')
            return true;
        else if (a == ' ' && b == '&')
            return false;
    }
}

function toSearchWordsArr() {
    var inputs = $('.search-input');
    //console.log(inputs);
    var result = [];

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value != "")
            result.push(((String)(inputs[i].value)).split("&"));
    }

    return result;
}

//对关键字进行翻译，然后进行搜索
function search() {
    console.log("reach");
    //var wordsArr = textToArr($('#search-key').val());
    var wordsArr = toSearchWordsArr();
    console.log(wordsArr);
    var result = [];

    var appid = '2015063000000001';
    var key = '12345678';
    var salt = (new Date).getTime();
    var from = 'auto';
    var to = ['en', 'jp', 'kor', 'fra', 'spa', 'th', 'ara', 'ru', 'pt', 'de', 'it', 'el', 'nl',
        'pl', 'bul', 'est', 'dan', 'fin', 'cs', 'rom', 'slo', 'swe', 'hu', 'cht', 'vie'
    ];
    var str, sign;
    var request = 0;
    var response = 0;

    for (var i = 0; i < wordsArr.length; i++) {
        (function(i) {
            for (var k = 0; k < to.length; k++) {
                (function(k) {
                    var tmp = [];
                    for (var j = 0; j < wordsArr[i].length; j++) {
                        (function(j) {
                            if (wordsArr[i][j] != '') {
                                request++;
                                str = appid + wordsArr[i][j] + salt + key;
                                sign = MD5(str);
                                $.ajax({
                                    async: true,
                                    url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
                                    type: 'get',
                                    dataType: 'jsonp',
                                    data: {
                                        q: wordsArr[i][j],
                                        appid: appid,
                                        salt: salt,
                                        from: from,
                                        to: to[k],
                                        sign: sign
                                    },
                                    success: function(data) {
                                        //console.log(data);
                                        response++;
                                        tmp.push(data.trans_result[0].dst);
                                        if (response == request) {
                                            result.push(tmp);
                                            for (var i = 0; i < result.length; i++) {
                                                if (result[i].length == 0) {
                                                    remove(result, i);
                                                    i--;
                                                }
                                            }
                                            console.log(result);
                                            searchRes(createRequestData(20, 0, result));
                                        }
                                    }
                                });
                            }
                        })(j);
                    }
                    result.push(tmp);
                })(k);
            }
            result.push(wordsArr[i]);
        })(i);
    }

    //setTimeout()

    //return result;
}

function remove(arr, i) {
    for (var j = i; j < arr.length - 1; j++)
        arr[j] = arr[j + 1];
    arr.pop();
}