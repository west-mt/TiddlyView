//TODO:
//  リロード時の画面クリアの解消。おそらく非同期でファイルを読み込んでいるのが問題。
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

	$('#read_file').click(
	  function(evt){
		evt.stopPropagation();
		evt.preventDefault();

		return false;
	  }
	);

	$('#read_file').change(
	  function() {
		var f = this.files[0];

		var reader = new FileReader();

		// エラー発生時の処理
		reader.onerror = function (evt) {
          alert("読み取り時にエラーが発生しました。");
		};

		reader.onload = function(evt){
		  //ドロップしたファイルの内容をWikiテキストとしてパース、表示
		  var html = markdown.toHTML(reader.result, 'Tiddly');

		  if(html.length > 2){
			$('#notice').hide();
			$('#preview').html(html);
		  }
		};
		reader.readAsText(f);
	  });

	//読み込みファイルが既に指定されている(リロードされた)
	if($('#read_file')[0].files.length > 0){
	  $('#read_file').change();
	}else{
	  $('#notice').show();
	}
	/*
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
	 */
  });
