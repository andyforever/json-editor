JSONEditor.defaults.editors.imageurl = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle());

    this.imageInput = this.theme.getImageInput();
    this.container.appendChild(this.imageInput);

    this.input = this.imageInput.childNodes[0];
    this.previewBtn = this.imageInput.childNodes[1];
    //add event listener
    var previewImgTimer;
    this.previewBtn.addEventListener('mouseenter', function(e) {
      var self = this;
      var left = e.pageX;
      var top = e.pageY;
      var width = $(this).outerWidth();
      var imgurl = $(this).parent().find('input').val();
      var img = new Image();
      img.onload = function () {
        if($('#J_PreviewImg').length) return;
        $(this).css({
          position: 'absolute',
          left: left+width,
          top: top,
          maxWidt: 300,
          maxHeight: 300,
          zIndex: 100000000
        });
        $('body').append(this);
        if(previewImgTimer) clearTimeout(previewImgTimer);
        previewImgTimer = setTimeout(function(){
          clearTimeout(previewImgTimer);
          var $previewImg = $('#J_PreviewImg');
          if ($previewImg.length > 0) {
            $previewImg.remove();
          }
        }, 2000);
      };
      img.style.maxWidth = '300px';
      img.style.maxHeight = '300px';
      img.id = 'J_PreviewImg';
      img.src = imgurl;
    });

    this.input.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.refreshValue();
    });

    this.previewBtn.addEventListener('mouseleave', function(e) {
      var previewImg = document.getElementById('J_PreviewImg');
      if(previewImg) previewImg.parentNode.removeChild(previewImg);
    });
    var description = '';
    if ($.isArray(this.schema.description)) {
      var paths = this.path.split('.');
      var index = paths[paths.length - 3];
      description = this.schema.description[index];
    } else {
      description = this.schema.description;
    }
    if (!description) description = '';
    this.preview = this.theme.getFormInputDescription(description);
    this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(this.label, this.imageInput, this.preview);
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
    if(this.imageInput && this.imageInput.parentNode) this.imageInput.parentNode.removeChild(this.imageInput);

    this._super();
  }
});
