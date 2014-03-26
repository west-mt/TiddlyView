function update_editor() {
  $('#preview').html(markdown.toHTML($('#text-input').val()));
}

$(function(){
	update_editor();
  });
