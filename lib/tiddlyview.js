//TODO:
//  Ajaxを使ったローカルファイル読み込み(ローカルファイルに対するAjaxの挙動を確認する必要あり)
//  インデキシング、検索システムとの結合

var last_modified_date = null;

$(function(){
	Add_Tiddly(markdown.Markdown);

	//jQueryのイベントにはデフォルトでdataTransferが存在しないため、追加
	$.event.props.push('dataTransfer');

	//ページ遷移時に呼ばれる。undefined以外を返すと確認ダイアログが表示される。
	$(window).bind('beforeunload', function(event) {
					 return undefined;
				   });

	$('#drop_zone').bind('dragenter',
	  function(evt){

		$('#read_file').show();

		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		//evt.stopPropagation();
		//evt.preventDefault();

	  });
	$('#read_file').bind('drop dragleave',
	  function(evt){

		$(this).hide();

	  }
	);

	//$('#preview').click(
	//  function(evt){
	//	print('preview clicked');
	//  }
	//);

	$('#read_file').click(
	  function(evt){
		evt.stopPropagation();
		evt.preventDefault();
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
		  last_modified_date = f.lastModifiedDate;

		  var code = guess_code(new Uint8Array(reader.result));
		  var reader2 = new FileReader();

		  //alert(code);
		  reader2.onload = function(evt){
			if(reader2.result != $('#read_data').val()){
			  //ドロップしたファイルの内容をWikiテキストとしてパース、表示
			  var html = markdown.toHTML(reader2.result, 'Tiddly');
			  $('#read_data').val(reader2.result);

			  if(html.length > 2){
				$('#notice').hide();
				$('#preview').html(html);
			  }
			}
		  };
		  reader2.readAsText(f, code);

		};
		//reader.readAsText(f);
		reader.readAsArrayBuffer(f);
	  });

	//読み込みファイルが既に指定されている(リロードされた)
	if($('#read_file')[0].files.length > 0){
	  var html = markdown.toHTML($('#read_data').val(), 'Tiddly');

	  if(html.length > 2){
		$('#notice').hide();
		$('#preview').html(html);
	  }
	  $('#read_file').change();
	}

	function auto_reload(){
	  if($('#read_file')[0].files.length > 0){
		$('#read_file').change();

		//var f = $('#read_file')[0].files[0];

		//print(f.lastModifiedDate.getTime());
		//print(last_modified_date.getTime() == f.lastModifiedDate.getTime());

		//if(last_modified_date != null &&
		//   last_modified_date.getTime() != f.lastModifiedDate.getTime()){
		//  print("change detected!!");
		//  $('#read_file').change();
		//}

	  }
	  //setTimeout(auto_reload, 5000);
	}


	//setTimeout(auto_reload, 5000);

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
