(function (ImageUpload) {
    return new ImageUpload();
})(function () {
    'use strict';

    var _this = this;

    this.global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    this.i18n = tinymce.util.Tools.resolve('tinymce.util.I18n');

    this.commandRegister = function (editor) {
        editor.addCommand('SelectAnImageAndUpload', function () {
            _this.selectLocalImages(editor)
        });
    };

    this.buttonRegister = function (editor) {

        // editor.ui.registry.addIcon("imageupload", 
        //     '<svg width="24" height="24"><path d="M5 15.7l3.3-3.2c.3-.3.7-.3 1 0L12 15l4.1-4c.3-.4.8-.4 1 0l2 1.9V5H5v10.7zM5 18V19h3l2.8-2.9-2-2L5 17.9zm14-3l-2.5-2.4-6.4 6.5H19v-4zM4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill-rule="nonzero"></path></svg>');

        editor.ui.registry.addButton('imageupload', {
            icon: "image",
            tooltip: this.i18n.translate(['Choose one or several images from local storage']),
            onAction: function () {
                return editor.execCommand('SelectAnImageAndUpload');
            }
        });
    };

    this.selectLocalImages = function (editor) {

        var hiddenInputFileControl =
            $(editor.dom.createHTML('input', {
                type: "file",
                multiple: "multiple",
                accept: (editor.settings.allowImageUploadTypes || this.defaultAllowImageUploadTypes),
                style: "display: none",
            }));

        hiddenInputFileControl.bind("change",
            function () {
                _this.onHiddenInputFileControlSelectionChanged(editor, this);
            });

        hiddenInputFileControl.click();
    };

    this.onHiddenInputFileControlSelectionChanged = function (editor, targetFileControl) {

        var dom = editor.dom;
        var maxFileSizeLimit = editor.settings.maxImageFileSize;
        var files = targetFileControl.files;

        var formData = new FormData();
        var timeoutFormConfig = 0;
        var currFile = null;

        for (var i = 0; i < files.length; i++) {
            currFile = files[i];

            if (maxFileSizeLimit && currFile.size > maxFileSizeLimit) {
                _this.alert(editor, "warning", this.i18n.translate(["File size limit exceeded: {0}", currFile.name]));
                $(targetFileControl).unbind("change");
                return;
            }

            formData.append("file" + i, currFile);
        }


        $.ajax({
            url: editor.settings.upload_image_url,
            type: "POST",
            data: formData,
            timeout:
                ((editor.settings.imageUploadTimeout && !isNaN(timeoutFormConfig = parseInt(editor.settings.imageUploadTimeout))) ?
                    timeoutFormConfig : _this.defaultUploadTimeout),
            processData: false,
            contentType: false,
            complete: function () {
                $(targetFileControl).unbind("change");
            },
            success: function (resp) {

                if (resp) {

                    if (resp.resultCode == 0) {
                        editor.focus();

                        for (var j = 0; j < resp.data.length; j++)
                            editor.selection.setContent(dom.createHTML('img', { src: resp.data[j] }));
                    }
                    else {
                        var msg = resp.message;

                        if (!msg && editor.settings.imageUploadErrorMessages) {
                            msg = editor.settings.imageUploadErrorMessages[resp.resultCode];
                        }
                        else {
                            _this.errorMessages[resp.resultCode];
                        }


                        _this.alert(editor, "error", msg || _this.i18n.translate(["Unknown error"]));

                        editor.windowManager.open()
                    }

                }
            }, error: function (xhr, textStatus, errorThrown) {

                _this.alert(editor, "error", (textStatus || _this.i18n.translate(["Internal server error"])));

            }
        });

    };

    this.alert = function (editor, type, msg) {

        editor.notificationManager.close();

        editor.notificationManager.open({
            text: msg,
            type: type,
            timeout: 3000
        });

    };

    this.defaultAllowImageUploadTypes = "image/jpeg,image/png,image/gif";
    this.defaultUploadTimeout = 120000; //Milliseconds
    this.errorMessages = [
        "Upload succeeded",
        "Nothing to upload",
        "Unsupported image format",
        "File size limit exceeded",
        "Not enough disk space",
        "Permission denied"
    ];
    this.Commands = { register: this.commandRegister };
    this.Buttons = { register: this.buttonRegister };

    this.global.add('imageupload', function (editor) {
        _this.Commands.register.call(_this, editor);
        _this.Buttons.register.call(_this, editor);
    });


});