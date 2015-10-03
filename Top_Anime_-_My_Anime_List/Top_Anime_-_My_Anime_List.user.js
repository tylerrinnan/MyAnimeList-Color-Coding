// ==UserScript==
// @name       MyAnimeList - Top Anime
// @namespace   my.anime.list.top.anime
// @description Visual indicator of what has been watched on the top anime list and the rating that was given for each watched item. 
// @include     http://myanimelist.net/topanime.php*
// @version     1
// @require     https://code.jquery.com/jquery-2.1.4.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/raty/2.7.0/jquery.raty.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.1/spectrum.min.js
// @resource    https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.1/spectrum.min.css
// @resource    https://cdnjs.cloudflare.com/ajax/libs/raty/2.7.0/jquery.raty.min.css
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==
// Constants
//var kissLogo = 'http://fc04.deviantart.net/fs70/f/2013/039/1/f/dragon_ball___kid_goku_20_by_superjmanplay2-d5pprcy.png';

var kissLogo = 'http://blog.soutade.fr//images/2013/01/goku_nuage.jpg';

var kissSearch = 'http://kissanime.com/Search/Anime/';
var starOn = "https://cdnjs.cloudflare.com/ajax/libs/raty/2.7.0/images/star-on.png";
var starOff = "https://cdnjs.cloudflare.com/ajax/libs/raty/2.7.0/images/star-off.png";

// Storage Keys
var storageComplete = 'MAL-color-complete';
var storagePlanToWatch = 'MAL-color-planToWatch';
var storageWatching = 'MAL-color-watching';
var storageDropped = 'MAL-color-dropped';
var storageOnHold = 'MAL-color-onHold';

// Default Colors
var defaultComplete = '#B9FFB9';
var defaultPlanToWatch = '#E9E9E9';
var defaultWatching = '#CCF2FF';
var defaultDropped = '#FFBCBC';
var defaultOnHold = '#FEFEBE';

var complete = GM_getValue(storageComplete);
if (complete == null) {
    complete = defaultComplete;
    GM_setValue(storageComplete, complete);
}

var planToWatch = GM_getValue(storagePlanToWatch);
if (planToWatch == null) {
    planToWatch = defaultPlanToWatch;
    GM_setValue(storagePlanToWatch, planToWatch);
}

var watching = GM_getValue(storageWatching);
if (watching == null) {
    watching = defaultWatching;
    GM_setValue(storageWatching, watching);
}

var onHold = GM_getValue(storageOnHold);
if (onHold == null) {
    onHold = defaultOnHold;
    GM_setValue(storageOnHold, onHold);
}

var dropped = GM_getValue(storageDropped);
if (dropped == null) {
    dropped = defaultDropped;
    GM_setValue(storageDropped, dropped);
}

var getAnimeXMLFromServerAndCallback = function(animeTitle, $target, callback) {
    var prep = animeTitle.split(' ').join('+');
    $.ajax({
        url: "http://myanimelist.net/api/anime/search.xml?q=" + prep,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("rinnanstimpy:bringit2"));
        },
        type: 'GET',
        dataType: 'xml',
        processData: true,
        success: function(data) {
            var anime = data.getElementsByTagName('anime')[0];
            if (anime) {
                callback(anime, $target, animeTitle);
            } else {
                console.log("Malformed XML, or result did not meet expectations");
            }
        },
        error: function(e) {
            //if an xml object was not sent, it's still possible the xml was sent as a string.
            if (e.responseText.indexOf('<anime>') > -1) {
                //parse the document
                var data = null;
                try {
                    data = $.parseXML(e.responseText);
                } catch (e) {
                    //parsing failed, but we can handle it.
                }

                //get anime node
                if (data !== null) {
                    var anime = data.getElementsByTagName('anime')[0];
                    if (anime) {
                        callback(anime, $target, animeTitle);
                        return;
                    }
                } else {
                    callback(data, $target, animeTitle);
                }
            }
        }
    });
}

// Styles
GM_addStyle('.legendDaddy {font-family: Arial,Verdana; height:15px; font-size: 12px; padding-left:11px; margin-top: -15px; margin-bottom:15px;} .legend { display: inline-block; color: #1d439b; font-weight: bold; margin-right: 3px;} .label {padding-left:10px; border:1px; border-style:outset;}');
GM_addStyle('.kissLogo {height:40px; position:relative; top:33px; margin-top:-45px}');
GM_addStyle('.watchNow { position:relative; font-size: 11px; top:29px; cursor:pointer;}');
GM_addStyle('.complete {background-color: ' + complete + ';} .planToWatch {background-color: ' + planToWatch + ';} .watching {background-color: ' + watching + ';} .dropped {background-color: ' + dropped + ';} .onHold {background-color: ' + onHold + ';}')
GM_addStyle('.colorPicker {height: 17px; width: 30px; padding:0px; cursor: pointer;} .hint{font-style: italic; font-size:11px; font-weight: normal;} .reset{height:25px; position: relative; top:8px; cursor: pointer;}')
var highlightStatus = function(status, $target, $rankingDisplay) {
    // MyAnimeList does not have a value of 5 in their status dropdown.
    switch (status) {
        case '1': // Watching
            $target.addClass('watching');
            $target.append($rankingDisplay);
            break;
        case '2': // Completed
            $target.addClass('complete');
            $target.append($rankingDisplay);
            break;
        case '3': // On-Hold
            $target.addClass('onHold');
            $target.append($rankingDisplay);
            break;
        case '4': // Dropped
            $target.addClass('dropped');
            $target.append($rankingDisplay);
            break;
        case '6': // Plan to Watch
            $target.addClass('planToWatch');
            $target.append($rankingDisplay);
            break;
    }
};

var generateRanking = function(index, ranking) {
    return $('<div id="raty_' + index + '"></div>').raty({
        number: 10,
        score: ranking,
        readOnly: true,
        starOn: starOn,
        starOff: starOff
    });
};

var handleTitle = function(url, index, $target) {
    $.get(url, function(data) {
        var status = $('#status', data).val();
        var ranking = $('select[name="score"]', data).find('option[selected=""]').val();
        if (ranking == undefined) {
            ranking = 0;
        }
        highlightStatus(status, $target, generateRanking(index, ranking));
    });
};

var generateLegend = function() {
    $(`<div class="legendDaddy">Legend:
    <div class="legend complete">Complete <input id="completeColor" type="color" data-show-alpha="true" class="colorPicker" value="` + complete + `"/></div>
    <div class="legend watching">Watching <input id="watchingColor" type="color" class="colorPicker" value="` + watching + `"/></div>
    <div class="legend planToWatch">Plan To Watch <input id="planToWatchColor" type="color" class="colorPicker" value="` + planToWatch + `"/></div>
    <div class="legend onHold">On Hold <input id="onHoldColor" type="color" class="colorPicker" value="` + onHold + `"/></div>
    <div class="legend dropped">Dropped <input id="droppedColor" type="color" class="colorPicker" value="` + dropped + `"/></div>
    <div class="legend"><img id="reset" class="reset" alt="Reset to defaults..." src="http://nccd.cdc.gov/dhdspatlas/images/CDC_Icons_Black/POWER%20-%20RESTART.png"></div>
    <div class="legend hint">Click the label to edit...</div>
  </div>`).insertAfter($('#horiznav_nav'));

    $("#completeColor").change(function() {
        complete = $(this).spectrum("get").val();
        $(this).parent().attr('style', 'background-color: ' + complete + ';');
        $('.complete').attr('style', 'background-color: ' + complete + ';');
        GM_setValue(storageComplete, complete);
    });
    $("#watchingColor").change(function() {
        watching = $(this).spectrum("get").val();
        $(this).parent().attr('style', 'background-color: ' + watching + ';');
        $('.watching').attr('style', 'background-color: ' + watching + ';');
        GM_setValue(storageWatching, watching);
    });
    $("#planToWatchColor").change(function() {
        planToWatch = $(this).spectrum("get").val();
        $(this).parent().attr('style', 'background-color: ' + planToWatch + ';');
        $('.planToWatch').attr('style', 'background-color: ' + planToWatch + ';');
        GM_setValue(storagePlanToWatch, planToWatch);
    });
    $("#onHoldColor").change(function() {
        onHold = $(this).spectrum("get").val();
        $(this).parent().attr('style', 'background-color: ' + onHold + ';');
        $('.onHold').attr('style', 'background-color: ' + onHold + ';')
        GM_setValue(storageOnHold, onHold);
    });
    $("#droppedColor").change(function() {
        dropped = $(this).spectrum("get").val();
        $(this).parent().attr('style', 'background-color: ' + dropped + ';');
        $('.dropped').attr('style', 'background-color: ' + dropped + ';');
        GM_setValue(storageDropped, dropped);
    });
    $("#reset").click(function() {
        complete = defaultComplete;
        watching = defaultWatching;
        planToWatch = defaultPlanToWatch;
        onHold = defaultOnHold;
        dropped = defaultDropped;

        //reset colors
        //TODO: fix attrocity
        $('.complete').attr("style", "background-color: " + complete + ";");
        $('.watching').attr("style", "background-color: " + watching + ";");
        $('.planToWatch').attr("style", "background-color: " + planToWatch + ";");
        $('.onHold').attr("style", "background-color: " + onHold + ";");
        $('.dropped').attr("style", "background-color: " + dropped + ";");

        //TODO: fix selector box not resetting... right now it's a sudo 'feature' to see what the last selection was.
        //     $('#completeColor').spectrum("set", complete);
        //     $("#completeColor").attr("value", complete);
        //     $('#watchingColor').spectrum("set", watching);
        //     $('#planToWatchColor').spectrum("set", planToWatch);
        //     $('#onHoldColor').spectrum("set", onHold);
        //     $('#droppedColor').spectrum("set", dropped);

        GM_setValue(storageComplete, complete);
        GM_setValue(storageWatching, watching);
        GM_setValue(storagePlanToWatch, planToWatch);
        GM_setValue(storageOnHold, onHold);
        GM_setValue(storageDropped, dropped);
    })
};

// Start
generateLegend();
var all_titles = $('.Lightbox_AddEdit');
$.each(all_titles, function(k, v) {
    var $title = $(v);
    var $parent = $title.parent();
    var title = $($parent.find('a')[0]).html().replace('<strong>', '').replace('</strong>', '');
    getAnimeXMLFromServerAndCallback(title, $parent, function(data, $target, originalTitle) {
        //result is expected xml document node
        if (data && data !== null) {
            var engNode = data.getElementsByTagName('english')[0];
            var synNode = data.getElementsByTagName('synonyms')[0];
            var title;
            if (engNode && engNode.innerHTML !== '') {
                title = engNode.innerHTML;
            } else if (synNode.innerHTML !== '') {
                var synonyms = synNode.innerHTML.split(';');
                title = synonyms[0];
            } else {
                title = originalTitle;
            }
        } else {
            title = originalTitle;
        }
        //var url = kissSearch + title;
        //var $anchor = $('<a id="ka_'+k+'" href="'+url+'"><img src="'+kissLogo+'" class="kissLogo"/><span class="watchNow">Watch</span></a>');
      var $anchor = $('<a id="ka_' + k + '"><img src="'+kissLogo+'" class="kissLogo"/><span class="watchNow">Watch</span></a>');

        $($anchor).click(function() {
            alert('hey!');
        });
        var url = kissSearch + title;
        // $target.prev().prev().append($anchor);
        var $anchor = $('<a id="ka_' + k + '" href="' + url + '"><img src="' + kissLogo + '" class="kissLogo"/><span class="watchNow">Watch</span></a>');
        $target.prev().prev().append($anchor);
    });

    if ($title.hasClass('button_edit')) {
        handleTitle($title.attr('href'), k, $parent);
    }
});

//    var $anchor =   $('<a id="ka_'+k+'"><img src="'+kissLogo+'" class="kissLogo"/><span class="watchNow">Watch</span></a>');
//     $($anchor).click(function(title){
//         $.ajax({
//           url:"http://kissanime.com/Search/Anime",
//           type:"POST",
//           beforeSend: function(xhr){
//             xhr.setRequestHeader("Host", "kissanime.com");
//             xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
//             xhr.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
//             xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0");
//             xhr.setRequestHeader("Cookie", "__cfduid=db900b65bb63cde6530958552fa34332d1443591569; cf_clearance=6a79d42661c15b32a1159f71d2b830806f56eafe-1443593703-604800; __utma=248210461.557142271.1443593727.1443673215.1443813727.3; __utmz=248210461.1443813727.3.2.utmcsr=myanimelist.net|utmccn=(referral)|utmcmd=referral|utmcct=/topanime.php; __atuvc=27%7C39; ASP.NET_SessionId=qs4q2o3105lnc4fj2do22jbs; __utmb=248210461.35.10.1443813727; __utmc=248210461; __utmt=1; __atuvs=560ee759cfb78f7e003");
//           },
//           data:{keyword: "keyword=" + encodeURIComponent(title)},
//           success: function(data){
//             alert(data); 
//           }
//       });  
//     });