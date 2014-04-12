//TODO:
//  Ajaxを使ったローカルファイル読み込み(ローカルファイルに対するAjaxの挙動を確認する必要あり)
//  インデキシング、検索システムとの結合


$(function(){
	Add_Tiddly(markdown.Markdown);

	//jQueryのイベントにはデフォルトでdataTransferが存在しないため、追加
	$.event.props.push('dataTransfer');

	//ページ遷移時に呼ばれる。undefined以外を返すと確認ダイアログが表示される。
	$(window).bind('beforeunload', function(event) {
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

      var files = evt.dataTransfer.files; // FileList object.

      // files is a FileList of File objects. List some properties.
	  var f = files[0];

	  print(window.URL.createObjectURL(f));
	  //output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
	  //			f.size, ' bytes, last modified: ',
	  //			f.lastModifiedDate.toLocaleDateString(), '</li>');

	  var reader = new FileReader();

	  // エラー発生時の処理
	  reader.onerror = function (evt) {
        alert("読み取り時にエラーが発生しました。");
	  };

      // ファイル読取が完了した際に呼ばれる処理
      reader.onload = function (evt) {
		// FileReaderが取得したテキストをそのままdivタグに出力
		//print(reader.result);

		//ドロップしたファイルの内容をWikiテキストとしてパース、表示
		var html = markdown.toHTML(reader.result, 'Tiddly');

		if(html.length > 2){
		  $('#notice').hide();
		  $('#preview').html(html);

		  //$('#drop_zone').unbind('drop', handleFileSelect);
		  //$('#drop_zone').bind('drop', doNothing);
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

	$('#drop_zone').bind('dragover', handleDragOver);
	$('#drop_zone').bind('drop', handleFileSelect);

	$.ajax({
			 url: "file:///C:/Users/gaku/work/test__.txt",
			 cache: false,
			 dataType: "text",
			 success: function(text){
			   print(text);
			 },
			 error: function(request, err_msg, error){
			   print(err_msg);
			 }
		   });
  });
