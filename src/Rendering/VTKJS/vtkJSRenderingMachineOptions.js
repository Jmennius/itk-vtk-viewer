import createRenderer from './createRenderer'
import render from './render'
import renderLater from './renderLater'
import requestAnimation from './requestAnimation'
import cancelAnimation from './cancelAnimation'

import mainRenderingMachineOptions from './Main/mainRenderingMachineOptions'
import layersRenderingMachineOptions from './Layers/layersRenderingMachineOptions'
import imagesRenderingMachineOptions from './Images/imagesRenderingMachineOptions'
import widgetsRenderingMachineOptions from './Widgets/widgetsRenderingMachineOptions'

const vtkJSRenderingMachineOptions = {
  main: mainRenderingMachineOptions,

  layers: layersRenderingMachineOptions,

  images: imagesRenderingMachineOptions,

  widgets: widgetsRenderingMachineOptions,

  actions: {
    createRenderer,

    render,
    renderLater,
    requestAnimation,
    cancelAnimation,
  },
}

export default vtkJSRenderingMachineOptions
