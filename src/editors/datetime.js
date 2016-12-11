JSONEditor.defaults.editors.datetime = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    this.datetimeInput = this.theme.getDatetimeInput();
    this.container.appendChild(this.datetimeInput);

    this.input = this.datetimeInput.childNodes[0];
    this.input.id = this.path;

    $(this.datetimeInput).datetimepicker({
      format: 'yyyy-mm-dd hh:ii:ss',
      autoclose: true,
      todayHighlight: true,
      language: 'zh-CN'
    }).on('changeDate', function(ev){
        self.refreshValue();
    });

    var description = this.schema.description;
    if (!description) description = '';
    this.preview = this.theme.getFormInputDescription(description);
    // this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(this.label, this.datetimeInput, this.preview);
    this.container.appendChild(this.control);

    this.refreshValue();

  },
  refreshValue: function() {
    this.value = this.input.value;
    if(typeof this.value !== "string") this.value = '';
    this.serialized = this.value;
    this.onChange(true);
  },
  enable: function() {
    if(this.input) this.input.disabled = false;
    this._super();
  },
  disable: function() {
    if(this.input) this.input.disabled = true;
    this._super();
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.input.value = this.value;
      this.onChange();
    }
  },
  destroy: function() {
    if(this.preview && this.preview.parentNode) this.preview.parentNode.removeChild(this.preview);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.datetimeInput && this.datetimeInput.parentNode) this.datetimeInput.parentNode.removeChild(this.datetimeInput);

    this._super();
  }
});
