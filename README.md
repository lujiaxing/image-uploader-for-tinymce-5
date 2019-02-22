# Image uploader for TinyMCE V5

A simple image uploader for TinyMCE V5. Supports multiple file selection.

Requirements: TinyMCE V5, JQuery.

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
	
	message: "Server messages. If do not have this property, then use messages from settings.imageUploadErrorMessages",
	
	/*
		0: "Upload succeeded",
		1: "Nothing to upload",
		2: "Unsupported image format",
		3: "File size limit exceeded",
		4: "Not enough disk space",
		5: "Permission denied"
	*/
	resultCode: 0,
	
	data: [
		'/path/to/an/uploaded/image.jpg',
		'/path/to/another/uploaded/image.jpg' 
	]
}
```

Configurations:
```javascript
{
	image_url_prefix: "url path attached to the front of returned url path",
	imageUploadErrorMessages: ["message", "will", "be", "read", "by", "index"],
	allowImageUploadTypes: "image/jpeg,image/png,image/gif for default.",
	maxImageFileSize: 0, // 0 = no limited. 0 for default.
	imageUploadTimeout: 120000 //Upload timeout in milliseconds. 2 minutes for default.
}
```

Licensed under MIT Licence.

Enjoy~
