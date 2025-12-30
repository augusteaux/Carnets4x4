function mostrarVista(vista) {
    document.querySelectorAll('.vista').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('vista-' + vista).style.display = 'block';
    
    const links = document.querySelectorAll('.menu-link');
    if (vista === 'carnet') links[0].classList.add('active');
    else links[1].classList.add('active');

    const titulo = document.getElementById('titulo-principal');
    titulo.innerText = vista === 'carnet' ? 'GENERADOR DE CARNET' : 'REDIMENSIONAR IMAGEN';
}

const inputRecorte = document.getElementById('subirImagenRecorte');
const imagenParaRecortar = document.getElementById('imagenParaRecortar');
const previaCanvas = document.getElementById('previaCarnetCanvas');
const btnDescargarCarnet = document.getElementById('btnDescargarCarnet');
const inputCarnet = document.getElementById('subirFotoCarnet');
const btnGenerarPDF = document.getElementById('btnGenerarPDF');
const contenedorPlanillaA4 = document.getElementById('contenedorPlanillaA4');
const mensajePlanilla = document.getElementById('mensajePlanilla');
const previaCtx = previaCanvas.getContext('2d');

let cropper;
let fotoCarnetDataURL = null;

inputRecorte.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        imagenParaRecortar.src = event.target.result;
        imagenParaRecortar.style.display = 'block';
        if (cropper) cropper.destroy();
        cropper = new Cropper(imagenParaRecortar, {
            aspectRatio: 1 / 1,
            viewMode: 1,
            crop: function() {
                const canvas4x4 = cropper.getCroppedCanvas({ width: 150, height: 150 });
                previaCtx.clearRect(0, 0, 150, 150);
                previaCtx.drawImage(canvas4x4, 0, 0);
                
                const canvasHigh = cropper.getCroppedCanvas({ width: 472, height: 472 });
                fotoCarnetDataURL = canvasHigh.toDataURL('image/png');
                
                generarVistaPreviaPlanilla(fotoCarnetDataURL);
                btnDescargarCarnet.disabled = false;
                btnGenerarPDF.disabled = false;
                mensajePlanilla.style.display = 'none';
            }
        });
    };
    reader.readAsDataURL(file);
});

btnDescargarCarnet.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = fotoCarnetDataURL;
    a.download = 'foto_carnet_4x4.png';
    a.click();
});

function generarVistaPreviaPlanilla(dataUrl) {
    let grid = contenedorPlanillaA4.querySelector('.planill-grid');
    if (!grid) {
        contenedorPlanillaA4.innerHTML = '';
        grid = document.createElement('div');
        grid.classList.add('planill-grid');
        contenedorPlanillaA4.appendChild(grid);
    }
    grid.innerHTML = '';
    for (let i = 0; i < 24; i++) {
        const div = document.createElement('div');
        div.classList.add('foto-carnet-a4');
        div.style.backgroundImage = `url(${dataUrl})`;
        grid.appendChild(div);
    }
}

btnGenerarPDF.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const img = new Image();
    img.src = fotoCarnetDataURL;
    img.onload = () => {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                let x = 10 + (j * 45);
                let y = 10 + (i * 45);
                doc.addImage(img, 'PNG', x, y, 40, 40);
            }
        }
        doc.save('planilla_carnet.pdf');
    };
});

const imageInputResize = document.getElementById('imageInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const resizeCanvas = document.getElementById('resizeCanvas');
const downloadResizeBtn = document.getElementById('downloadResizeBtn');
const resizeCtx = resizeCanvas.getContext('2d');
let originalImage = new Image();

imageInputResize.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { originalImage.src = event.target.result; };
    reader.readAsDataURL(file);
});

originalImage.onload = () => {
    widthInput.value = originalImage.width;
    heightInput.value = originalImage.height;
    updateResizeCanvas();
    resizeCanvas.style.display = 'block';
    downloadResizeBtn.style.display = 'inline-flex';
};

[widthInput, heightInput].forEach(input => {
    input.addEventListener('input', () => {
        if (originalImage.src) updateResizeCanvas();
    });
});

function updateResizeCanvas() {
    const w = parseInt(widthInput.value) || 1;
    const h = parseInt(heightInput.value) || 1;
    resizeCanvas.width = w;
    resizeCanvas.height = h;
    resizeCtx.drawImage(originalImage, 0, 0, w, h);
}

downloadResizeBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'redimensionada.png';
    link.href = resizeCanvas.toDataURL();
    link.click();
});