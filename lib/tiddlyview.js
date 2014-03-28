function update_editor() {
  $('#preview').html(markdown.toHTML($('#text-input').val(), 'Tiddly'));
}

$(function(){
	Add_Tiddly(markdown.Markdown);
	update_editor();
  });
