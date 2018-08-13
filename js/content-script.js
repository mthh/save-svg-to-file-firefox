/*
If the click was on a SVG element, send a message to the background page.
The message contains the serializer svg content
*/
let boum = false;
function notifySvgClick(e) {
  if (e.defaultPrevented) return;
  let target = e.target;
  while (target.tagName != "svg" && target.parentNode) {
    target = target.parentNode;
  }
  if (target.tagName != "svg") {
    browser.runtime.sendMessage({ 'removeButton': true });
    return;
  }
  if (!boum) {
    const svgSource = getSvgSource(target);
    browser.runtime.sendMessage({ 'addButton': true, 'src': svgSource })
      .then((resp) => {
        e.preventDefault();
        boum = true;
        const evt = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          view: e.view,
          button: e.button,
          buttons: e.buttons,
          screenX: e.screenX,
          screenY: e.screenY,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        });
        const cancelled = !target.dispatchEvent(evt);
        if (cancelled) {
          boum = false;
          browser.runtime.sendMessage({'removeButton': true});
        }
      });
  } else {
    // const svgSource = getSvgSource(target);
    // browser.runtime.sendMessage({ 'src': svgSource });
    boum = false;
  }
}

function getSvgSource(targetSvg) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(targetSvg);

  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  source = ['<?xml version="1.0" standalone="no"?>\r\n', source].join('');

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  return url;
}

const frames = window.frames;
if (frames.length === 0) {
  window.addEventListener("contextmenu", notifySvgClick);
} else {
  for (let i = 0, n_frames = frames.length; i < n_frames; i++) {
    frames[i].addEventListener("contextmenu", notifySvgClick);
  }
}
