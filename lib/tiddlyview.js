function update_editor() {
  $('#preview').html(markdown.toHTML($('#text-input').val()));
}

update_editor();
