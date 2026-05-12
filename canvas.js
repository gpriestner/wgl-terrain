export const canvas = document.getElementById('canvas');
export const view = canvas.getContext('webgl2');
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.aspect = canvas.width / canvas.height;
    view.viewport(0, 0, canvas.width, canvas.height);
}
resize();
window.addEventListener('resize', resize);
