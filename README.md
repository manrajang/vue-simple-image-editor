# vue-image-simple-editor

### DEMO
https://manrajang.github.io/vue-simple-image-editor/

### Install
```js
import Vue from 'vue'
import VueSimpleImageEditor from 'vue-simple-image-editor'

Vue.use(VueSimpleImageEditor)
```

### Example
```html
<div>Resize &amp; Crop Mode</div>
<button type="button" @click="onClickSaveImageFileInMutliMode">Save Image File (Multi)</button>
<simple-image-editor ref="multiCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" :cropWidth="200" :cropHeight="200" @changeImage="onChangeImage"/>

<div>Resize &amp; Crop Mode (Fix)</div>
<button type="button" @click="onClickSaveImageFileInMutliModeWithFixedCrop">Save Image File (Multi)</button>
<simple-image-editor ref="multiCanvasWithFixedCrop" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" :cropWidth="200" :cropHeight="200" isFixedCrop @changeImage="onChangeImage"/>

<div>Resize Mode</div>
<button type="button" @click="onClickSaveImageFileInResizeMode">Save Image File (Resize)</button>
<simple-image-editor ref="resizeCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isResizeMode @changeImage="onChangeImage"/>

<div>Crop Mode</div>
<button type="button" @click="onClickSaveImageFileInCropMode">Save Image File (Crop)</button>
<button type="button" @click="onClickSaveCrop">Save Crop</button>
<simple-image-editor ref="cropCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isCropMode @changeImage="onChangeImage"/>

<div>Crop Mode (Fix)</div>
<button type="button" @click="onClickSaveImageFileInCropModeWithFixedCrop">Save Image File (Crop)</button>
<button type="button" @click="onClickSaveCropWithFixedCrop">Save Crop</button>
<simple-image-editor ref="cropCanvasWithFixedCrop" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isCropMode :cropWidth="200" :cropHeight="200" isFixedCrop @changeImage="onChangeImage"/>
```
```js
import VueSimpleImageEditor from 'vue-simple-image-editor'

components: {
  VueSimpleImageEditor
}
```

### Props
| Prop                          | Type               | Default                      | Description                              |
|-------------------------------|--------------------|------------------------------|------------------------------------------|
| width                         | Number             | 500                          | Image Width                              |
| height                        | Number             | 500                          | Image Height                             |
| imageSrc                      | String             | null                         | Image Path                               |
| imageObj                      | Image              | null                         | Image Object                             |
| isResizeMode                  | Boolean            | false                        | Only Resize Mode                         |
| isCropMode                    | Boolean            | false                        | Only Crop Mode                           |
| isFixedCrop                   | Boolean            | false                        | Fixed Crop (Do Not Resize)               |
| resizeHandlerStyle            | Object             | DEFAULT_RESIZE_HANDLER_STYLE | Reisze Handler Style                     |
| cropHandlerStyle              | Object             | DEFAULT_CROP_HANDLER_STYLE   | Crop Handler Style                       |
| cropButtonText                | String             | 'Crop'                       | Crop Button Text                         |
| cropButtonStyle               | Object             | null                         | Crop Button Style                        |
| cropSaveButtonText            | String             | 'Save Crop'                  | Crop Save Button Text                    |
| cropSaveButtonStyle           | Object             | null                         | Crop Save Button Style                   |
| cropCancelButtonText          | String             | 'Cancel Crop'                | Crop Cancel Button Text                  |
| cropCancelButtonStyle         | Object             | null                         | Crop Cancel Button Style                 |
| cropWidth                     | Number             | 0                            | Crop Width                               |
| cropHeight                    | Number             | 0                            | Crop Height                              |

### DEFAULT_RESIZE_HANDLER_STYLE
| Prop                          | Type               | Default     | Description                              |
|-------------------------------|--------------------|-------------|------------------------------------------|
| strokeColor                   | String             | #FF0000     | Resize Stroke Color                      |
| strokeWidth                   | Number             | 2           | Resize Stroke Width                      |
| handlerFillColor              | String             | #FF0000     | Resize Handler Fill Color                |
| handlerSize                   | Number             | 7           | Resize Handler Size                      |

### DEFAULT_CROP_HANDLER_STYLE
| Prop                          | Type               | Default     | Description                              |
|-------------------------------|--------------------|-------------|------------------------------------------|
| strokeColor                   | String             | #FF0000     | Resize Stroke Color                      |
| strokeWidth                   | Number             | 2           | Resize Stroke Width                      |
| handlerFillColor              | String             | #FF0000     | Resize Handler Fill Color                |
| handlerSize                   | Number             | 7           | Resize Handler Size                      |
| fillColor                     | String             | #C0C0C0     | Crop Fill Color                          |
| fillAlpha                     | Number             | 0.3         | Crop Fill Alpha                          |