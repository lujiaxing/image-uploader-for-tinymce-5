(function (TinyMCEImageUpload) {
    return new TinyMCEImageUpload();
})(
    function () {
        'use strict';

        var _this = this;
    
        this.global = tinymce.util.Tools.resolve('tinymce.PluginManager');

        this.commandRegister = function(editor){
            editor.addCommand('SelectAnImageAndUpload', function () {
                _this.selectLocalImages(editor)
              });
        };

        this.buttonRegister = function(editor){

            // editor.ui.registry.addIcon("imageupload", 
            //     '<svg width="24" height="24"><path d="M5 15.7l3.3-3.2c.3-.3.7-.3 1 0L12 15l4.1-4c.3-.4.8-.4 1 0l2 1.9V5H5v10.7zM5 18V19h3l2.8-2.9-2-2L5 17.9zm14-3l-2.5-2.4-6.4 6.5H19v-4zM4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill-rule="nonzero"></path></svg>');

            editor.ui.registry.addButton('imageupload', {
                icon: "image",
                tooltip: 'Choose one or several images from local storage',
                onAction: function () {
                  return editor.execCommand('SelectAnImageAndUpload');
                }
              });
        };

        this.selectLocalImages = function(editor) {
            var dom = editor.dom;

            var hiddenInputFileControl = document.createElement("input");

            hiddenInputFileControl.setAttribute("type", "file");
            hiddenInputFileControl.setAttribute("multiple", "multiple");
            hiddenInputFileControl.setAttribute("accept", (editor.settings.allowUploadTypes || "image/jpg,image/jpeg,image/png,image/gif"));
            hiddenInputFileControl.style.display = "none";


            var onChangeEventMethod = null;
            hiddenInputFileControl.addEventListener('change', onChangeEventMethod = function () {

                var files = hiddenInputFileControl.files;

                var formData = new FormData();

                var curFile = null;
                for(var i = 0; i < files.length; i++)
                    formData.append("file" + i, files[i]);


                $.ajax({
                    url : editor.settings.upload_image_url,  
                    type : "POST",  
                    data: formData,
                    processData:false,
                    contentType:false,
                    complete: function(){
                        hiddenInputFileControl.removeEventListener("change", onChangeEventMethod);
                    },
                    success : function(resp) {

                        if (resp && resp.errno == 0 && resp.data) {

                            editor.focus();

                            for(var j = 0; j < resp.data.length; j++){
                                editor.selection.setContent(dom.createHTML('img', {src: 
                                    (editor.settings.image_url_prefix || '') + resp.data[j]}));
                            }
                            
                        }
                }});

            });

            hiddenInputFileControl.click();
        };

        
        this.Commands = { register: this.commandRegister };
        this.Buttons = { register: this.buttonRegister };
          
        this.global.add('imageupload', function (editor) {
            _this.Commands.register(editor);
            _this.Buttons.register(editor);
        });


});