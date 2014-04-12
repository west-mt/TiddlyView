//TODO:
//  編集画面のリサイズ対応
//  保存時のコーディング変換(現在はutf-8で保存される)
//  Ajaxを使ったローカルファイル読み込み(ローカルファイルに対するAjaxの挙動を確認する必要あり)
//  インデキシング、検索システムとの結合




var modified = false;
var footer_height = 0;
var footer_hidden = 0;

function update_editor() {
  var html = markdown.toHTML($('#text-input').val(), 'Tiddly');

  if(html.length > 2){
	modified = true;
	$('#notice').hide();
	$('#preview').html(html);
  }
}

$(function(){
	Add_Tiddly(markdown.Markdown);

	footer_height = $('.footer').height();
	footer_hidden = ($('.footer').css('bottom')[0] == '-');

	//jQueryのイベントにはデフォルトでdataTransferが存在しないため、追加
	$.event.props.push('dataTransfer');
	$(window).bind('beforeunload', function(event) {
					 if(modified)
					   return '内容が変更されています。ページを移動しますか？';
					 return undefined;
				   });

	function doNothing(evt) {
      evt.stopPropagation();
      evt.preventDefault();

	  return false;
	}

	function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

	  if(modified && !window.confirm('変更内容が保存されていません。\nファイルを読み込みますか？')){
		return;
	  }

      var files = evt.dataTransfer.files; // FileList object.

      // files is a FileList of File objects. List some properties.
	  var f = files[0];

	  //output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
	  //			f.size, ' bytes, last modified: ',
	  //			f.lastModifiedDate.toLocaleDateString(), '</li>');
	  $('#text-filename').val(f.name);

	  var reader = new FileReader();

	  // エラー発生時の処理
	  reader.onerror = function (evt) {
        alert("読み取り時にエラーが発生しました。");
	  };

      // ファイル読取が完了した際に呼ばれる処理
      reader.onload = function (evt) {
		// FileReaderが取得したテキストをそのままdivタグに出力
		print(reader.result);

		//ドロップしたファイルの内容をWikiテキストとしてパース、表示
		var html = markdown.toHTML(reader.result, 'Tiddly');

		if(html.length > 2){
		  $('#notice').hide();
		  $('#preview').html(html);
		  $('#text-input').val(reader.result);

		  //$('#drop_zone').unbind('drop', handleFileSelect);
		  //$('#drop_zone').bind('drop', doNothing);
		  modified = false;
		}


      };
	  //reader.readAsBinaryString(f);
	  //reader.readAsDataURL(f);
	  reader.readAsText(f);

	}

	function handleDragOver(evt) {
	  evt.stopPropagation();
	  evt.preventDefault();
	  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

	  return false;
	}

	var text = $('#text-input').val();

	if(text.length > 1){
	  var html = markdown.toHTML(text, 'Tiddly');

	  if(html.length > 2){
		modified = true;
		$('#notice').hide();
		$('#preview').html(html);
	  }

	  $('#drop_zone').bind('dragover', handleDragOver);
	  //$('#drop_zone').bind('drop', doNothing);
	  $('#drop_zone').bind('drop', handleFileSelect);

	}else{
	  // Setup the dnd listeners.
	  $('#drop_zone').bind('dragover', handleDragOver);
	  $('#drop_zone').bind('drop', handleFileSelect);
	}
	$('#tab').bind('click', function(){
					 var animate_time = 300;
					 if(footer_hidden){
					   //$('.footer').toggle();
					   $('.footer').animate({ bottom: '0px' }, animate_time);
					   $('.footer2').animate({ bottom: footer_height+'px' },
											 animate_time);
					   footer_hidden = false;
					 }else{
					   $('.footer').animate({ bottom: -footer_height+'px' },
											animate_time);
					   $('.footer2').animate({ bottom: '0px' }, animate_time);
					   footer_hidden = true;
					 }
				   });

	if($('#text-filename').val() == ''){
	  var now = new Date();
	  var fname =  [
        ('' + now.getFullYear()).slice(-2),
        ('0' + (now.getMonth()+1)).slice(-2),
        ('0' + now.getDate()).slice(-2)
      ].join('') + 'tiddly.txt';
	  $('#text-filename').val(fname);
	}

	//$('#text-options')
	$("form").submit(function(e) {
					   e.preventDefault();
					   var text = $('#text-input').val();
					   var fname = $('#text-filename').val();

					   if(fname == '' || !modified) return false;
					   if(text.length > 0){

						 var blob = new Blob([text],
											 {type: "text/plain;charset=" + document.characterSet});

						 saveAs(blob, fname);
						 modified = false;
					   }
					   return false;
					 });
  });
