//TODO:
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

	  // �G���[�������̏���
	  reader.onerror = function (evt) {
        alert("�ǂݎ�莞�ɃG���[���������܂����B");
	  };

      // �t�@�C���ǎ悪���������ۂɌĂ΂�鏈��
      reader.onload = function (evt) {
		// FileReader���擾�����e�L�X�g�����̂܂�div�^�O�ɏo��
		//print(reader.result);

		//�h���b�v�����t�@�C���̓��e��Wiki�e�L�X�g�Ƃ��ăp�[�X�A�\��
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
