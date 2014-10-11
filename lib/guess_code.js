
function GetEscapeCodeType(str){
	if(/%u[0-9A-F]{4}/i.test(str))return "Unicode";
	if(/%([0-9A-DF][0-9A-F]%[8A]0%|E0%80|[0-7][0-9A-F]|C[01])%[8A]0|%00|%[7F]F/i.test(str))return "UTF16LE";
	if(/%E[0-9A-F]%[8A]0%[8A]0|%[CD][0-9A-F]%[8A]0/i.test(str))return "UTF8";
	if(/%F[DE]/i.test(str))return /%8[0-9A-D]|%9[0-9A-F]|%A0/i.test(str)?"UTF16LE":"EUCJP";
	if(/%1B/i.test(str))return /%[A-D][0-9A-F]/i.test(str)?"JIS8":"JIS7";
	var S=str.substring(0,6143).replace(/%[0-9A-F]{2}|[^ ]| /ig,function(s){
		return s.length<3?"40":s.substring(1)
	}),c,C,i=0,T;
	while(0<=(c=parseInt(S.substring(i,i+=2),16))&&i<4092)if(128<=c){
		if((C=parseInt(S.substring(i,i+2),16))<128)i+=2;
		else if(194<=c&&c<240&&C<192){
			if(c<224){T="UTF8";i+=2;continue}
			if(2==parseInt(S.charAt(i+2),16)>>2){T="UTF8";i+=4;continue}
		}
		if(142==c&&161<=C&&C<224){if(!T)T="EUCJP";if("EUCJP"==T)continue}
		if(c<161)return "SJIS";
		if(c<224&&!T)
			if((164==c&&C<244||165==c&&C<247)&&161<=C)i+=2;
			else T=224<=C?"EUCJP":"SJIS";
		else T="EUCJP"
	}
	return T?T:"EUCJP"
};

function URI_escape(array, asRFC2396) {
	var s="",i,il=array.length,c;
	if (asRFC2396) {
			for(i=0;i<il;i++) s+=(c=array[i])<58&&c>38||64<c&&c<91||96<c&&c<123&&c!=43&&c!=44&&c!=47||c===33||c===95||c===126?String.fromCharCode(c):(c<16?"%0":"%")+c.toString(16).toUpperCase();
	} else {
		for(i=0;i<il;i++) s+=(c=array[i])<58&&c>47||64<c&&c<91||96<c&&c<123||c===45||c===46||c===95||c===126?String.fromCharCode(c):(c<16?"%0":"%")+c.toString(16).toUpperCase();
	}
	return s;
};

function guess_code(array) {
  var i,il=array.length,c=array[0],cs=null,p,a,m,u7,mu7,pm,am,b64,mb64;
  //BOM 0xEFBBBF:UTF8, 0xFEFF:UTF16BE, 0xFFFE:UTF16LE
  cs=c===239&&array[1]===187&&array[2]===191?"UTF8":c===255&&array[1]===254?"UTF16LE":c===254&&array[1]===255?"UTF16BE":null;
  if(cs!=null) return cs;

  //Unicode or ASCII(maybe UTF7,MUTF7) or ...?
  cs="ASCII",p=a=m=-1,u7=mu7=true,pm=am=b64=mb64=0;
  for(i=0;i<il;i++){
    c=array[i];
    //console.log(c);
    if(255<c){cs="Unicode";break;}
    if(c<32&&c!==9&&c!==10&&c!==13||126<c){cs=null;break;} //未定
    if (!u7&&!mu7) continue; //UTF-7でもModified UTF-7でもないならこの先を省略
    c===126&&(u7=false); //UTF-7は~を符号化するがModifiedUTF-7は~をそのまま印字する
    8<c&&c<11||c===13 && (mu7=false); //Modified UTF-7は\t\n\rを符号化する
    //"+-" or "\+[A-Za-z0-9\+\/]+-" があればUTF7 "&" ならMUTF7
    if (c===45) { // [+&]- の出現数をカウント
      p>=0&&u7 ? (i===p+1&&(pm++),(p=-1)) : a>=0&&mu7 && (i===a+1&&(am++),(a=-1));
      p = a = -1;
    } else {
      if (u7&&p>=0) { //Base64 [A-Za-z0-9+/] かどうか
        (u7 = (c===43||46<c&&c<58||64<c&&c<91||96<c&&c<123)) ? b64++ : (p=-1);
      }
      if (mu7&&a>=0) { //Modified Base64 [A-Za-z0-9+,] かどうか
        (mu7 = (42<c&&c<45||47<c&&c<58||64<c&&c<91||96<c&&c<123)) ? mb64++ : (a=-1);
      }
    }
    c===43&&p<0 ? (p=i) : c===38&&a<0 ? (a=i) : c===45 && (m=i);
  }
  if (cs==="ASCII") {
    cs = u7&&(b64>0||pm>0) ? "UTF7" : mu7&&(mb64>0||am>0) ? "MUTF7" : "ASCII";
  }
  //TODO: GetEscapeCodeTypeの代替処理が未実装
  return cs?cs:GetEscapeCodeType(URI_escape(array));
};

