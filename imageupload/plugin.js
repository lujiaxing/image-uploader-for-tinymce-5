(function (TinyMCEImageUpload, uploader) {

    return new TinyMCEImageUpload(uploader);
})(

    function (uploader) {
        'use strict';

        var _this = this;

        this.uploader = uploader;
    
        this.global = tinymce.util.Tools.resolve('tinymce.PluginManager');

        //image file only
        this.acceptableFileTypes = (typeof(tinymce.settings.imgUpload_AllowUploadTypes) == 'undefined' ? "image/jpg,image/jpeg,image/png,image/gif" : tinymce.settings.imgUpload_AllowUploadTypes);

        //2MB for default.
        this.singleFileMaxSize = (typeof(tinymce.settings.imgUpload_SingleFileMaxSize) == 'undefined' ? 0 : tinymce.settings.imgUpload_SingleFileMaxSize);

        //40MB for default.
        this.maxUploadSize = (typeof(tinymce.settings.imgUpload_MaxUploadSize) == 'undefined' ? 0 : tinymce.settings.imgUpload_MaxUploadSize) ;

        //register command
        this.commandRegister = function(editor){
            editor.addCommand('SelectAnImageAndUpload', function () {
                _this.selectLocalImages(editor)
              });
        };

        //add button on tool bar.
        this.buttonRegister = function(editor){

            // looks not good.
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

        //select file, upload.
        this.selectLocalImages = function(editor) {

            var _this = this;

            var hiddenInputFileControl = document.createElement("input");

            hiddenInputFileControl.setAttribute("type", "file");
            hiddenInputFileControl.setAttribute("multiple", "multiple");
            hiddenInputFileControl.setAttribute("accept", this.acceptableFileTypes);
            hiddenInputFileControl.style.display = "none";


            var onChangeEventMethod = null;
            hiddenInputFileControl.addEventListener('change', onChangeEventMethod = function () {

                var files = hiddenInputFileControl.files;

                files = Array.from(files);

                var totalSize = 0;
                var tooLargeFiles = [];

                for (var i = 0; i < files.length; i++) {
                    var curr = files[i];

                    if (_this.singleFileMaxSize > 0 && curr.size > _this.singleFileMaxSize)
                        tooLargeFiles.push(curr);
                    else
                        totalSize += curr.size;
                }


                if (tooLargeFiles.length > 0) {

                    var bigfileNames = "";

                    for (var j = 0; j < tooLargeFiles.length; j++)
                        bigfileNames += "\"" + tooLargeFiles[j].name + "\", ";

                    bigfileNames = bigfileNames.replace(/, $/gi, '');

                    editor.windowManager.open({
                        title: '提示',
                        size: 'normal',
                        body: {
                            type: "panel",
                            items: [{
                                type: "htmlpanel",
                                html: "<br /><div style='font-size: 11pt; color:#666; text-align:center;'>以下文件单文件体积大于 " + 
                                (this.singleFileMaxSize / 1048576)
                                + "MB. 请适度压缩后再上传: " + bigfileNames + "</div><br />"
                            }]
                        },
                        buttons: [{
                            type: "cancel",
                            text: "确定",
                            primary: true,
                            align: "end"
                        }]

                    });

                    return;
                }

                if (_this.maxUploadSize > 0 && totalSize > _this.maxUploadSize) {
                    editor.windowManager.open({
                        title: '提示',
                        size: 'normal',
                        body: {
                            type: "panel",
                            items: [{
                                type: "htmlpanel",
                                html: "<br /><div style='font-size: 11pt; color:#666; text-align:center;'>总体积过大. 所选文件总体积不能超过 " + (_this.maxUploadSize / 1024) + "KB, 超过请分批上传.</div><br />"
                            }]
                        },
                        buttons: [{
                            type: "cancel",
                            text: "确定",
                            primary: true,
                            align: "end"
                        }]

                    });
                    return;
                }

                var dataUrls = {};

                //create object url for preview.
                files.forEach(function(val, ind, arr){
                     var url = URL.createObjectURL(val);
                     dataUrls[url] = val;
                });

                var imgPreviewHtmlPath = tinymce.baseURL + "/plugins/imageupload/img-preview.html";
                
                var previewDialog = editor.windowManager.open({
                    title: '上传文件',
                    size: 'large',
                    body:{
                        type: "panel",
                        items:[{
                                type: "htmlpanel",
                                html: "<iframe id='__if_sortfile' src='"+ imgPreviewHtmlPath +"' style='width: 100%; height: 525px;' border='0'></iframe>"
                            }]
                    },
                    buttons: [{
                        type: "submit",
                        text: "确定",
                        primary: true,
                        align: "end",
                        value: "ok"
                    },
                    {
                        type: "cancel",
                        text: "取消",
                        primary: false,
                        align: "end"
                    }],
                    onSubmit: function(api){

                        var iframe = document.getElementById("__if_sortfile");

                        var sorted = iframe.contentWindow.ImgPreview.getImages();

                        if (sorted.length == 0) {
                            editor.windowManager.open({
                                title: '提示',
                                size: 'normal',
                                body: {
                                    type: "panel",
                                    items: [{
                                        type: "htmlpanel",
                                        html: "<br /><div style='font-size: 11pt; color:#666; text-align:center;'>请至少选中并保留一个文件以供上传, 或点击 \"取消\" 按钮放弃上传.</div><br />"
                                    }]
                                },
                                buttons: [{
                                    type: "cancel",
                                    text: "确定",
                                    primary: true,
                                    align: "end"
                                }]

                            });
                            return;
                        }

                        files = [];

                        sorted.forEach(function(val, ind, arr){
                            files[ind] = dataUrls[val];
                        });

                        

                        previewDialog.block("uploading, please wait...");

                        //invoke uploader.
                        _this.uploader.upload({
                            url: editor.settings.imgUpload_UploadTargetUrl,
                            data: files,
                            onUploaded: function(successImages, failureImages){
                                
                                previewDialog.close();

                                _this.upload_callback(successImages, failureImages, editor);
                            }
                        });

                        hiddenInputFileControl.removeEventListener("change", onChangeEventMethod);

                    }
                 });

                 var iframe = document.getElementById("__if_sortfile");
                 iframe.onload = function(){
                     //[{
                     //  url: "blob://http://domain/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                     //  name: "image-file.jpg"
                     //}]
                     iframe.contentWindow.ImgPreview.init(
                         Object.keys(dataUrls).map(function(val, ind, arr) {
                             return { url: val, name: dataUrls[val].name };
                         }));
                 };

            });

            hiddenInputFileControl.click();            
        };

        
        //callback from uploader
        this.upload_callback = function (image_urls, failedItems, editor) {
            
            var dom = editor.dom;

            editor.focus();

            for (var j = 0; j < image_urls.length; j++) {
                editor.selection.setContent(dom.createHTML('img', {
                    src:
                        (editor.settings.imgUpload_ImageUrlPrefix || '') + image_urls[j].url
                }));
            }

            if (failedItems && failedItems.length > 0) {
                var names = failedItems.map(function(val, ind, arr) {
                    return "<li>" + val.name + (val.reason ? " <span class='fail-reason'>(" + val.reason + ")</span>" : "") + "</li>";
                }).join("");

                editor.windowManager.open({
                    title: '提示',
                    size: 'normal',
                    body: {
                        type: "panel",
                        items: [{
                            type: "htmlpanel",
                            html: "<br /><div style='font-size: 11pt; color:#666; text-align:left; margin-left: 30px;'>以下文件没有上传成功, 请重试: "
                             + "<ul class='failed-files'>"
                             + names
                             + "</ul></div><br />"
                        }]
                    },
                    buttons: [{
                        type: "cancel",
                        text: "确定",
                        primary: true,
                        align: "end"
                    }]

                });
            };
        };

        
        this.Commands = { register: this.commandRegister };
        this.Buttons = { register: this.buttonRegister };
          
        this.global.add('imageupload', function (editor) {
            _this.Commands.register(editor);
            _this.Buttons.register(editor);
        });


	}, 

    //a simple uploader for image uploading.
    //server response structure:
    //{
    //  data: "file url",
    //  message: "response message. write error reason here.",
    //  success: true/false
    //}
	(tinymce.settings.imgUpload_Uploader || {

        failedFiles: [],
        successFiles: [],
        filesCount: 0,

        //invoke callback to return upload result.
        invokeCallback: function(param){

            var _this = this;

            var sorted = _this.successFiles.sort(function(a, b){
                return a.index > b.index ? 1 : -1;
            });

            param.onUploaded(
                sorted,
                _this.failedFiles
            );
        },

        //invoke when a failure message returned from the server.
        onRequestFailure: function(xhr, context){

            this.failedFiles.push({
                name: context.val.name,
                url: null,
                reason: "Network failure",
                index: context.index
            });

            if((this.successFiles.length + this.failedFiles.length) >= this.filesCount)
                this.invokeCallback(context.param);
        },

        //invoke when a success message returned from the server.
        onRequestSuccess: function(xhr, context){

            var resp = JSON.parse(xhr.response);

            if (resp && resp.success){
                this.successFiles.push({
                    name: context.val.name,
                    url: resp.data,
                    index: context.index
                });
            }
            else{
                this.failedFiles.push({
                    name: context.val.name,
                    url: null,
                    reason: resp.message,
                    index: context.index
                });
            }

            if((this.successFiles.length + this.failedFiles.length) >= this.filesCount)
                this.invokeCallback(context.param);
        },

        //create an instance of XMLHttpRequest and
        //make form post for single file.
        sendXhr: function(toSend, url, method, isAsync, context){
            var _this = this;
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function (eventArgs) {

                var src = eventArgs.currentTarget;

                if (src.readyState != 4)
                    return;

                _this[
                    (src.status >= 200 && src.status < 300) ? "onRequestSuccess" : "onRequestFailure"
                ].call(_this, src, context);
                
            };
            
            xhr.open("POST", url, true);
            xhr.send(toSend);
        },

        //recive upload files.
		upload: function (param) {

            var _this = this;

            this.failedFiles = [];
            this.successFiles = [];
            this.filesCount = param.data.length;

            param.data.forEach(function(val, ind, arr) {

                setTimeout(function () {

                    var formData = new FormData();

                    formData.append("file", val);

                    _this.sendXhr.call(_this, formData, param.url, "POST", true, {val: val, index: ind, param: param});

                }, 200);
            });
        }
    })
);