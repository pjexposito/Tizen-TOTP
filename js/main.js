var keyItems = [];

var UpdateRemainTimeInner;
var remainTime;
var progressBarWidget;
var snapListComponent;

var tokenList = document.getElementById("Tokens");

window.onload = Redraw();

function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
function hex2dec(s) { return parseInt(s, 16); }

function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";
    var i;
    for (i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }

    for (i = 0; i+4 <= bits.length; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;

}

function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
}

function updateOtp(dato) {
	var key = base32tohex(dato); 
    var epoch = Math.round(new Date().getTime() / 1000.0);
    var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
    // updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
    var shaObj = new jsSHA("SHA-1", "HEX");
    shaObj.setHMACKey(key, "HEX");
    shaObj.update(time);
    var hmac = shaObj.getHMAC("HEX");
    var offset = hex2dec(hmac.substring(hmac.length - 1));
    var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
    otp = (otp).substr(otp.length - 6, 6);
    return otp;
}


function UpdateRemainTime(nextTime){
  var currentTime = Math.round(new Date().getTime() / 1000.0);
  var calc_time = Math.floor(currentTime / 30);
  nextTime = 30 - (currentTime % 30);
  UpdateRemainTimeInner(nextTime);
  return calc_time;
}

function UpdateRemainTimeCircle(nextTime){
  progressBarWidget.value(nextTime);
}


function InitList() {
  for(var i=0; i<keyItems.length; i++){
    var item = keyItems[i];
    var a = String(updateOtp(item.key));
    var item_id = "item_"+i;
    var newelm = MakeLiItem(item_id, a,item.service, item.id);
    tokenList.appendChild(newelm);
  }
}

function Update() {
  var calc_time = UpdateRemainTime();
  for(var i=0; i<keyItems.length; i++){
    var item = keyItems[i];
    var a = String(updateOtp(item.key));
    var item_id = "item_"+i;
    var oldelm =  document.getElementById(item_id);
    oldelm.childNodes[0].textContent = a;
  }
}

function MakeLiItem (elem_id , token , service, id){
  var li = document.createElement("li");
  li.setAttribute("class","li-has-multiline");
  li.setAttribute("style","text-align:center;");
  li.setAttribute("id", elem_id);
  li.innerHTML = token;

  var span = document.createElement("div");
  span.setAttribute("class","ui-li-sub-text li-text-sub");
  span.innerHTML = "[ " + service + " ] ";// + id;

  li.appendChild(span);

  return li;
}

function init(result) {
  keyItems = result;

  var footer = document.getElementById("footer");
  var progress = document.getElementById("progress");

  if (result.example) {
    var li= document.createElement("li");
    var msg = document.createElement("div");
    msg.setAttribute("class","ui-marquee ui-marquee-gradient");
    msg.setAttribute("onclick", "tau.changePage('caution');");
    msg.innerHTML = "auth_keyinfo.txt not found. You need create and put auth_keyinfo.txt to documents folder";
    li.appendChild(msg);
    tokenList.appendChild(li);
    tau.helper.SnapListMarqueeStyle.create(tokenList, { marqueeDelay: 1000, marqueeStyle: "endToEnd" });
    tau.changePage("caution");
    }

    footer.style.display="none";
    progressBarWidget = new tau.widget.CircleProgressBar(progress, {size: "full"});
    UpdateRemainTimeInner = UpdateRemainTimeCircle;
    InitList();
    snapListComponent = tau.widget.SnapListview(tokenList);
    circle_helper(tau);


  window.setInterval(Update,1000);
}

function Redraw() {
  tokenList.innerHTML = "";
  document.getElementById("Title").innerHTML="Claves";
  ReadItems(init);
}
