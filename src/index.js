import vtkURLExtract from 'vtk.js/Sources/Common/Core/URLExtract';
import getFileExtension from 'itk/getFileExtension'

import fetchBinaryContent from './fetchBinaryContent';
import processFiles from './processFiles';
import UserInterface from './UserInterface';
import createFileDragAndDrop from './UserInterface/createFileDragAndDrop';
import style from './UserInterface/ItkVtkViewer.module.css';
import ZarrMultiscaleManager from './ZarrMultiscaleManager';
import createViewer from './createViewer';

let doNotInitViewers = false;

export {default as createViewer} from './createViewer';

export function createViewerFromLocalFiles(container) {
  doNotInitViewers = true;
  createFileDragAndDrop(container, processFiles);
}

export async function createViewerFromUrl(el, url, use2D = false) {
  UserInterface.emptyContainer(el);
  const progressCallback = UserInterface.createLoadingProgress(el);

  const extension = getFileExtension(url)
  if(extension === 'zarr') {
    console.time('meta')
    console.time('image')
    const metadata = await ZarrMultiscaleManager.parseMetadata(url);
    console.timeEnd('meta')
    const multiscaleManager = new ZarrMultiscaleManager(url, metadata);
    // Side effect to keep the spinner going
    const topLevelLargestImage = await multiscaleManager.topLevelLargestImage();
    console.timeEnd('image')
    return createViewer(el, {
      multiscaleManager,
      use2D
      });
  } else {
    const arrayBuffer = await fetchBinaryContent(url, progressCallback);
    const file = new File(
      [new Blob([arrayBuffer])],
      url.split('/').slice(-1)[0]
    );
    return processFiles(el, { files: [file], use2D });
  }
}

export function initializeEmbeddedViewers() {
  if (doNotInitViewers) {
    return;
  }
  const viewers = document.querySelectorAll('.itk-vtk-viewer');
  let count = viewers.length;
  while (count--) {
    const el = viewers[count];
    if (!el.dataset.loaded) {
      el.dataset.loaded = true;
      // Apply size to conatiner
      const [width, height] = (el.dataset.viewport || '500x500').split('x');
      el.style.position = 'relative';
      el.style.width = Number.isFinite(Number(width)) ? `${width}px` : width;
      el.style.height = Number.isFinite(Number(height))
        ? `${height}px`
        : height;
      createViewerFromUrl(el, el.dataset.url, !!el.dataset.use2D).then(
        (viewer) => {
          // Background color handling
          if (el.dataset.backgroundColor) {
            const color = el.dataset.backgroundColor;
            const bgColor = [
              color.slice(0, 2),
              color.slice(2, 4),
              color.slice(4, 6),
            ].map((v) => parseInt(v, 16) / 255);
            console.log(bgColor)
            viewer.setBackgroundColor(bgColor);
          }

          viewer.setUserInterfaceCollapsed(true);
          // Render
          if (viewer.renderWindow && viewer.renderWindow.render) {
            viewer.renderWindow.render();
          }
          el.dataset.viewer = viewer;
        }
      );
    }
  }
}

export function processParameters(
  container,
  addOnParameters = {},
  keyName = 'fileToLoad'
) {
  const userParams = Object.assign(
    {},
    vtkURLExtract.extractURLParameters(),
    addOnParameters
  );
  const myContainer = UserInterface.getRootContainer(container);

  if (userParams.fullscreen) {
    myContainer.classList.add(style.fullscreenContainer);
  }

  if (userParams[keyName]) {
    return createViewerFromUrl(
      myContainer,
      userParams[keyName],
      !!userParams.use2D
    );
  }
  return null;
}

// Ensure processing of embedded viewers
setTimeout(initializeEmbeddedViewers, 100);
