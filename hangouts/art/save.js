/*
  Saves an SVG
  https://ezgif.com/svg-to-png seems to handle large files well for converting to png
  https://29a.ch/film-emulator/ for grain 
*/
function save(filename) {
  const data = document.querySelector('.container').innerHTML;
  const blob = new Blob([data], {type:"image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink)
}
