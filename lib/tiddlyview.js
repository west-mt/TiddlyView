//TODO:
//  Ajax���g�������[�J���t�@�C���ǂݍ���(���[�J���t�@�C���ɑ΂���Ajax�̋������m�F����K�v����)
//  �C���f�L�V���O�A�����V�X�e���Ƃ̌���

var last_modified_date = null;

$(function(){
	Add_Tiddly(markdown.Markdown);

	//jQuery�̃C�x���g�ɂ̓f�t�H���g��dataTransfer�����݂��Ȃ����߁A�ǉ�
	$.event.props.push('dataTransfer');

	//�y�[�W�J�ڎ��ɌĂ΂��Bundefined�ȊO��Ԃ��Ɗm�F�_�C�A���O���\�������B
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

		// �G���[�������̏���
		reader.onerror = function (evt) {
          alert("�ǂݎ�莞�ɃG���[���������܂����B");
		};

		reader.onload = function(evt){
		  last_modified_date = f.lastModifiedDate;

		  if(reader.result != $('#read_data').val()){
			//�h���b�v�����t�@�C���̓��e��Wiki�e�L�X�g�Ƃ��ăp�[�X�A�\��
			var html = markdown.toHTML(reader.result, 'Tiddly');
			$('#read_data').val(reader.result);

			if(html.length > 2){
			  $('#notice').hide();
			  $('#preview').html(html);
			}
		  }
		};
		reader.readAsText(f);
	  });

	//�ǂݍ��݃t�@�C�������Ɏw�肳��Ă���(�����[�h���ꂽ)
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
