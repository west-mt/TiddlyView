//TODO:
//  �����[�h���̉�ʃN���A�̉����B�����炭�񓯊��Ńt�@�C����ǂݍ���ł���̂����B
//  Ajax���g�������[�J���t�@�C���ǂݍ���(���[�J���t�@�C���ɑ΂���Ajax�̋������m�F����K�v����)
//  �C���f�L�V���O�A�����V�X�e���Ƃ̌���


$(function(){
	Add_Tiddly(markdown.Markdown);

	//jQuery�̃C�x���g�ɂ̓f�t�H���g��dataTransfer�����݂��Ȃ����߁A�ǉ�
	$.event.props.push('dataTransfer');

	//�y�[�W�J�ڎ��ɌĂ΂��Bundefined�ȊO��Ԃ��Ɗm�F�_�C�A���O���\�������B
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

		// �G���[�������̏���
		reader.onerror = function (evt) {
          alert("�ǂݎ�莞�ɃG���[���������܂����B");
		};

		reader.onload = function(evt){
		  //�h���b�v�����t�@�C���̓��e��Wiki�e�L�X�g�Ƃ��ăp�[�X�A�\��
		  var html = markdown.toHTML(reader.result, 'Tiddly');

		  if(html.length > 2){
			$('#notice').hide();
			$('#preview').html(html);
		  }
		};
		reader.readAsText(f);
	  });

	//�ǂݍ��݃t�@�C�������Ɏw�肳��Ă���(�����[�h���ꂽ)
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
