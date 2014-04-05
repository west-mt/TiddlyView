var modified = false;

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

	//jQuery�̃C�x���g�ɂ̓f�t�H���g��dataTransfer�����݂��Ȃ����߁A�ǉ�

	$.event.props.push('dataTransfer');
	$(window).bind('beforeunload', function(event) {
					 if(modified)
					   return '���e���ύX����Ă��܂��B�y�[�W���ړ����܂����H';
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
		print(reader.result);

		//�h���b�v�����t�@�C���̓��e��Wiki�e�L�X�g�Ƃ��ăp�[�X�A�\��
		var html = markdown.toHTML(reader.result, 'Tiddly');

		if(html.length > 2){
		  $('#notice').hide();
		  $('#preview').html(html);
		  $('#text-input').val(reader.result);

		  $('#drop_zone').unbind('drop', handleFileSelect);
		  $('#drop_zone').bind('drop', doNothing);

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
	  $('#drop_zone').bind('drop', doNothing);

	}else{
	  // Setup the dnd listeners.
	  $('#drop_zone').bind('dragover', handleDragOver);
	  $('#drop_zone').bind('drop', handleFileSelect);
	}
  });
