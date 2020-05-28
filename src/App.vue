<template>
  <div>
    <input type="file" accept=".jpeg" @change="onChangeImageFile"/>
    <button type="button" @click="onClickSaveImageFile">Save Image File</button>
    <br/>
    <br/>
    <div>Resize &amp; Crop Mode</div>
    <button type="button" @click="onClickSaveImageFileInMutliMode">Save Image File (Multi)</button>
    <simple-image-editor ref="multiCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" :cropWidth="200" :cropHeight="200" @changeImage="onChangeImage"/>
    <br/>
    <div>Resize &amp; Crop Mode (Fix)</div>
    <button type="button" @click="onClickSaveImageFileInMutliModeWithFixedCrop">Save Image File (Multi)</button>
    <simple-image-editor ref="multiCanvasWithFixedCrop" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" :cropWidth="200" :cropHeight="200" isFixedCrop @changeImage="onChangeImage"/>
    <br/>
    <div>Resize Mode</div>
    <button type="button" @click="onClickSaveImageFileInResizeMode">Save Image File (Resize)</button>
    <simple-image-editor ref="resizeCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isResizeMode @changeImage="onChangeImage"/>
    <br/>
    <div>Crop Mode</div>
    <button type="button" @click="onClickSaveImageFileInCropMode">Save Image File (Crop)</button>
    <button type="button" @click="onClickSaveCrop">Save Crop</button>
    <simple-image-editor ref="cropCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isCropMode @changeImage="onChangeImage"/>
    <br/>
    <div>Crop Mode (Fix)</div>
    <button type="button" @click="onClickSaveImageFileInCropModeWithFixedCrop">Save Image File (Crop)</button>
    <button type="button" @click="onClickSaveCropWithFixedCrop">Save Crop</button>
    <simple-image-editor ref="cropCanvasWithFixedCrop" style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="imageSrc" :imageObj="imageObj" isCropMode :cropWidth="200" :cropHeight="200" isFixedCrop @changeImage="onChangeImage"/>
    <br/>
    <div>Origin Image</div>
    <div ref="container"></div>
  </div>
</template>

<script>
import SimpleImageEditor from '@/components/SimpleImageEditor'

const IMAGE_PATH = 'img/a.jpg'

export default {
  name: 'app',
  components: {
    SimpleImageEditor
  },
  data () {
    return {
      imageSrc: IMAGE_PATH,
      imageObj: null,
      image: null
    }
  },
  methods: {
    onChangeImageFile (evt) {
      this.imageSrc = null
      this.imageObj = null
      const files = evt.target.files
      if (files.length > 0) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = e => {
          const image = new Image()
          image.onload = e => {
            this.imageObj = image
            while (this.$refs.container.hasChildNodes()) {
              this.$refs.container.removeChild(this.$refs.container.firstChild)
            }
            this.$refs.container.appendChild(image)
          }
          image.src = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        this.imageSrc = IMAGE_PATH
      }
    },
    onClickSaveImageFile () {
      if (this.image) {
        const { width, height } = this.image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(this.image, 0, 0, width, height)
        canvas.toBlob(function (blob) {
          const downloadLink = document.createElement('a')
          downloadLink.href = URL.createObjectURL(blob)
          downloadLink.download = 'imageFile.jpeg'
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        }, 'image/jpeg')
      }
    },
    onClickSaveImageFileInMutliMode () {
      this.$refs.multiCanvas.saveImageFile()
    },
    onClickSaveImageFileInMutliModeWithFixedCrop () {
      this.$refs.multiCanvasWithFixedCrop.saveImageFile()
    },
    onClickSaveImageFileInResizeMode () {
      this.$refs.resizeCanvas.saveImageFile()
    },
    onClickSaveImageFileInCropMode () {
      this.$refs.cropCanvas.saveImageFile()
    },
    onClickSaveCrop () {
      this.$refs.cropCanvas.crop()
    },
    onClickSaveImageFileInCropModeWithFixedCrop () {
      this.$refs.cropCanvasWithFixedCrop.saveImageFile()
    },
    onClickSaveCropWithFixedCrop () {
      this.$refs.cropCanvasWithFixedCrop.crop()
    },
    onChangeImage (image) {
      this.image = image
    },
  }
}
</script>
