function update_editor() {
  alert();
  $('#text-input').html(markdown.toHTML($('#text-input').val()));
}

update_editor();
