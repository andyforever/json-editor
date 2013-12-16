$.jsoneditor.editors.string = $.jsoneditor.AbstractEditor.extend({
  getDefault: function() {
    return '';
  },
  setValue: function(value,from_template) {
    // Don't allow directly setting the value
    if(this.template && !from_template) return;

    value = value || '';

    // Sanitize value before setting it
    var sanitized = this.sanitize(value);
    if(this.schema.enum && this.schema.enum.indexOf(sanitized) < 0) {
      sanitized = this.schema.enum[0];
    }

    this.input.val(sanitized);

    this.refreshValue();

    if(from_template) this.input.trigger('change');
  },
  build: function() {
    var self = this;
    if(!this.getOption('compact',false)) this.label = this.theme.getFormInputLabel(this.getTitle());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

    // Select box
    if(this.schema.enum) {
      this.input_type = 'select';
      this.input = this.theme.getSelectInput(this.schema.enum);
    }
    // Text Area
    else if(this.schema.format && this.schema.format == 'textarea') {
      this.input_type = 'textarea';
      this.input = this.theme.getTextareaInput();
    }
    else if(this.schema.format && this.schema.format == 'range') {
      this.input_type = 'range';
      var min = this.schema.minimum || 0;
      var max = this.schema.maximum || Math.max(100,min+1);
      var step = 1;
      if(this.schema.multipleOf) {
        if(min%this.schema.multipleOf) min = Math.ceil(min/this.schema.multipleOf)*this.schema.multipleOf;
        if(max%this.schema.multipleOf) max = Math.floor(max/this.schema.multipleOf)*this.schema.multipleOf;
        step = this.schema.multipleOf;
      }

      this.input = this.theme.getRangeInput(min,max,step);
    }
    // Other input type
    else {
      this.input_type = this.schema.format? this.schema.format : 'text';
      this.input = this.theme.getFormInputField(this.input_type);
    }

    if(this.getOption('compact')) this.container.addClass('compact');
    
    this.input
      .attr('data-schemapath',this.path)
      .attr('data-schematype',this.schema.type)
      .on('change keyup',function(e) {
        // Don't allow changing if this field is a template
        if(self.schema.template) {
          $(this).val(self.value);
          return;
        }

        var val = $(this).val();
        // sanitize value
        var sanitized = self.sanitize(val);
        if(val !== sanitized) {
          e.preventDefault();
          e.stopPropagation();
          $(this).val(sanitized).trigger('change');
          return;
        }

        self.refreshValue();
      });

    this.control = this.getTheme().getFormControl(this.label, this.input, this.description).appendTo(this.container);

    // Any special formatting that needs to happen after the input is added to the dom
    window.setTimeout(function() {
      self.theme.afterInputReady(self.input);
    });

    // If this schema is based on a macro template, set that up
    if(this.schema.template) this.setupTemplate();
    else this.refreshValue();
  },
  refreshValue: function() {
    this.value = this.input.val();
  },
  destroy: function() {
    if(this.vars) {
      var self = this;
      // Remove event listeners for the macro template
      $.each(this.vars,function(name,attr) {
        attr.root.off('change','[data-schemapath="'+attr.adjusted_path+'"]',self.var_listener)
      });
      self.var_listener = null;
    }
    this.template = null;
    this.vars = null;
    this.input.remove();
    if(this.label) this.label.remove();
    if(this.description) this.description.remove();

    this._super();
  },
  setupTemplate: function() {
    // Compile and store the template
    this.template = $.jsoneditor.compileTemplate(this.schema.template, this.template_engine);

    // Prepare the template vars
    this.vars = {};
    if(this.schema.vars) {
      var self = this;
      this.var_listener = function() {
        window.setTimeout(function() {
          self.refresh();
        });
      };
      $.each(this.schema.vars,function(name,path) {
        var path_parts = path.split('.');
        var first = path_parts.shift();

        // Find the root node for this template variable
        var root = self.container.closest('[data-schemaid="'+first+'"]');
        if(!root.length) throw "Unknown template variable path "+path;


        // Keep track of the root node and path for use when rendering the template
        var adjusted_path = root.data('editor').path + '.' + path_parts.join('.');
        self.vars[name] = {
          root: root,
          path: path_parts,
          adjusted_path: adjusted_path
        };

        // Listen for changes to the variable field
        root.on('change','[data-schemapath="'+adjusted_path+'"]',self.var_listener);
      });

      self.var_listener();
    }
  },
  /**
   * This is overridden in derivative editors
   */
  sanitize: function(value) {
    return value;
  },
  /**
   * Re-calculates the value if needed
   */
  refresh: function() {
    // If this editor needs to be rendered by a macro template
    if(this.template) {
      // Build up template variables
      var vars = {};
      $.each(this.vars,function(name,attr) {
        var obj = attr.root.data('editor').getValue();
        var current_part = -1;
        var val = null;
        // Use "path.to.property" to get root['path']['to']['property']
        while(1) {
          current_part++;
          if(current_part >= attr.path.length) {
            val = obj;
            break;
          }

          if(!obj || typeof obj[attr.path[current_part]] === "undefined") {
            break;
          }

          obj = obj[attr.path[current_part]];
        }
        vars[name] = val;
      });
      this.setValue(this.template(vars),true);
    }
  }
});