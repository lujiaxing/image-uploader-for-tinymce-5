# Image uploader for TinyMCE V5 v2.0

A simple image uploader for TinyMCE V5. Supports multiple file selection, image reorder.

Requirements: TinyMCE V5.

Supported browser: Internet Explorer 11, Edge, Chrome, FireFox, Safari.

Useage: just copy "imageupload" folder in to "plugins" folder.

```javascript
tinymce.init({
    upload_image_url: "/URL/TO/RECEIVE/UPLOAD/REQUEST",
    external_plugins: {
        'imageupload': './plugins/imageupload/plugin.js'
    }
});
```

Response format:
```javascript
{
	
	message: "Server response messages",
	success: true/false,
	data: '/path/to/an/uploaded/image.jpg'
}
```

Configurations:
```javascript
{
	imgUpload_UploadTargetUrl: "url to recive upload request",
	imgUpload_AllowUploadTypes: "image/jpeg,image/png,image/gif for default.",
	imgUpload_ImageUrlPrefix: "url path attached to the front of returned url path",
	// Specify a uploader for ajax upload. If not setted, the built-in ajax uploader will
	// be used. Here is an example:
	imgUpload_Uploader: { 
		upload : function (param) {
			param.onUploaded(

				//uploaded files.
				param.data.map(function(v, i, a){
					return {
						name: v.name, //file name
						url: URL.createObjectURL(v) //url from server
					};
				}),

				//failures
				[
					{
						name: "file-name",
						url: null,
						reason: "network failure",
					}
				]
			);
		}
	},

	//0 or unset means unlimited.
	imgUpload_SingleFileMaxSize: 2097152,

	//0 or unset means unlimited.
	imgUpload_MaxUploadSize: 41943040

	
}
```

preview:
![1](https://raw.githubusercontent.com/lujiaxing/image-uploader-for-tinymce-5/master/preview-images/1.jpg)
![2](https://raw.githubusercontent.com/lujiaxing/image-uploader-for-tinymce-5/master/preview-images/2.jpg)
![3](https://raw.githubusercontent.com/lujiaxing/image-uploader-for-tinymce-5/master/preview-images/3.jpg)


**Todo:**
- [ ] Internationalization
- [ ] Preview

---

Licensed under MIT Licence.

Enjoy~
