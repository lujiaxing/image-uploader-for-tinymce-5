# Image uploader for TinyMCE V5

A simple image uploader for TinyMCE V5. Supports mutiple file selecting. 

Requirements: TinyMCE V5, JQuery.

Useage: just copy "imageupload" folder in to "plugins" folder.


```
tinymce.init({
    upload_image_url: "/URL/TO/RECEIVE/UPLOAD/REQUEST",
    external_plugins: {
        'imageupload': './plugins/imageupload/plugin.js'
    }
});
```

Licensed under MIT Licence.

Enjoy~
