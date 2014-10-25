var recognition = new webkitSpeechRecognition();
var audio;
recognition.continuous = true;
recognition.interimResults = false;
var text = false;
var time;
var timer;



recognition.onresult = function(event) {
    console.log(event);
    total = ""
    for (i = 0; i < event.results.length; i++) {
        for (k = 0; k < event.results[i].length; k++) { 
            total += event.results[i][k].transcript;
        }
    }
    
    $("#output").text(" " + total + " ")
    $("#badlist > a").each(function(){
        var phrase = $("b", this).text().replace("'s:", "").toLowerCase();
        if (phrase != ''){
            //console.log(phrase);
            var num = occurrences(total, phrase);
            console.log(phrase, num)
            
            $(".count", this).text(num);
        }
    });
    
    var objDiv = document.getElementById("output");
    objDiv.scrollTop = objDiv.scrollHeight;
    
    text = true;
    
    var wordCounts = { };
    var words = total.split(/\b/);

    for(var i = 0; i < words.length; i++)
        wordCounts["_" + words[i]] = (wordCounts["_" + words[i]] || 0) + 1;
    
    console.log(wordCounts, words)
    
    sortable = [];
    for (var tword in wordCounts)
          sortable.push([tword, wordCounts[tword]])
    sortable.sort(function(a, b) {return a[1] - b[1]})
    
    console.log(sortable)
    
    $("#mostused").text(sortable[sortable.length -2][0].replace("_",""));
    
    
}

$("#badlist > a").click(function(){
    var phrase = $("b", this).text().replace("'s:", "").toLowerCase();
    console.log(phrase, this);
    if (phrase != ''){
        nphrase = " " + phrase + " ";
        var newstr = replaceAll(phrase, "<span class='hl'>"+phrase+"</span>", $("#output").text())
        console.log(nphrase, newstr)
        $("#output").html(newstr);
    }
})

$(document).keypress(function(e) {
    console.log(e.which);
    if(e.which == 114) {
        $("#recbutton").click();
    } else if (e.which == 112){
        $("#playback").click();        
    }
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

var rnum = getCookie("rnum")
if(rnum == ''){
    rnum = 0;
    setCookie("rnum", rnum, 90);
}

$("#rnum").text(rnum);

function dotime(){

    var endTime = new Date();

    var timeDiff = endTime - time;
    
    var timeDiff =  timeDiff / 1000;

    
    var seconds = Math.round(timeDiff % 60);

    timeDiff = Math.floor(timeDiff / 60);

    var minutes = Math.round(timeDiff % 60);
    
    if((seconds + "").length == 1){
        seconds = "0" + seconds;   
    }
    
    format = minutes + ":"  + seconds;
    
    
    $("#timesince").text(format);
    
    
}


function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function occurrences(string, subString, allowOverlapping){
    
    allowOverlapping = true;
    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
}


function startrec(){
    recognition.start();
    $("#output h2").html("Recording <span id='aniwait'>...</span>");
    $("#recbutton").text("Stop Recording")
    $("#recbutton").attr("onclick", "stoprec()")
    startRecording()
    time = new Date();
    timer = setInterval(dotime, 1000);
}

function stoprec(){
    recognition.stop();   
    $("#recbutton").text("Start Recording")
    $("#recbutton").attr("onclick", "startrec()")
    stopRecording()
    clearInterval(timer);
    if (text == false){
        $("#output h2").html('Waiting <span id="aniwait">...</span>');
        setTimeout(function(){
            if (text == false){
                 $("#output h2").html('Press Record!');
            }
        }, 3000)
    }
    
    rnum = parseInt(rnum) + 1;
    setCookie("rnum", rnum, 90);
    $("#rnum").text(rnum);
}

function addword(){
    var word = prompt("What word would you like to add?");
    var word = word.replace("<","&lt;").replace(">","&gt;").replace("'s", "").replace(":",""); //Add more if needed.
    
    var num = occurrences($("#output").text(), word.toLowerCase());
    
    $("#badlist").prepend('<a class="btn btn-default"><b>'+word+'\'s:</b> <span class="count">'+num+'</span></a>')
    
    $("#badlist > a").click(function(){
    var phrase = $("b", this).text().replace("'s:", "").toLowerCase();
    console.log(phrase, this);
    if (phrase != ''){
        nphrase = " " + phrase + " ";
        var newstr = replaceAll(phrase, "<span class='hl'>"+phrase+"</span>", $("#output").text())
        console.log(nphrase, newstr)
        $("#output").html(newstr);
    }
})

}

function playback(){
    if (audio.paused){
        audio.play();
        $("#playback").text("Pause Recording");
    } else {
        audio.pause();
        $("#playback").text("Play Recording");
    }
}




var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    var point = audio_context.createGain()
    input.connect(point);

    recorder = new Recorder(point);
}

function startRecording() {
    recorder && recorder.record();
}

function stopRecording() {
    recorder && recorder.stop();

    // create WAV download link using audio data blob
    createDownloadLink();

    recorder.clear();
    
    $("#playback").removeClass("disabled");
    $("#audiodl").removeClass("disabled");
}

function createDownloadLink() {
    recorder && recorder.exportWAV(function (blob) {
        var url = URL.createObjectURL(blob);
        console.log(blob)
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.getElementById("audiodl");
        
        
        audio = new Audio(url);
        audio.addEventListener("ended",function() {$("#playback").text("Play Recording");})
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
    });
}

window.onload = function init() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({
        audio: true
    }, startUserMedia, function (e) {
    });
};