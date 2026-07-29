function mostrarVista(vista) {
    document.querySelectorAll('.vista').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('vista-' + vista).style.display = 'block';
    
    const links = document.querySelectorAll('.menu-link');
    const titulo = document.getElementById('titulo-principal');

    if (vista === 'carnet') {
        links[0].classList.add('active');
        titulo.innerText = 'GENERADOR DE CARNET';
    } else if (vista === 'redimensionar') {
        links[1].classList.add('active');
        titulo.innerText = 'REDIMENSIONAR IMAGEN';
    } else if (vista === 'calidad') {
        links[2].classList.add('active');
        titulo.innerText = 'CALIDAD DE IMAGEN';
    }
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

const qualityImageInput = document.getElementById('qualityImageInput');
const qualityControls = document.getElementById('qualityControls');
const qualityRange = document.getElementById('qualityRange');
const qualityNumberInput = document.getElementById('qualityNumberInput');
const qualityPreview = document.getElementById('qualityPreview');
const downloadQualityBtn = document.getElementById('downloadQualityBtn');

let qualityOriginalImage = new Image();
let compressedDataURL = '';

qualityImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        qualityOriginalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

qualityOriginalImage.onload = () => {
    qualityControls.style.display = 'flex';
    qualityPreview.style.display = 'block';
    downloadQualityBtn.style.display = 'inline-flex';
    actualizarCalidadImagen();
};

qualityRange.addEventListener('input', () => {
    qualityNumberInput.value = qualityRange.value;
    actualizarCalidadImagen();
});

qualityNumberInput.addEventListener('input', () => {
    qualityRange.value = Math.min(100, Math.max(1, qualityNumberInput.value));
    actualizarCalidadImagen();
});

function actualizarCalidadImagen() {
    if (!qualityOriginalImage.src) return;

    let valorPorcentaje = parseFloat(qualityNumberInput.value);
    if (isNaN(valorPorcentaje) || valorPorcentaje <= 0) valorPorcentaje = 0.1;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const origW = qualityOriginalImage.width;
    const origH = qualityOriginalImage.height;

    const factorNormalizado = valorPorcentaje / 100;
    const factorEscala = Math.pow(factorNormalizado, 2); 

    const targetW = Math.max(10, Math.round(origW * factorEscala));
    const targetH = Math.max(10, Math.round(origH * factorEscala));

    tempCanvas.width = origW;
    tempCanvas.height = origH;

    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    if (valorPorcentaje < 100) {
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = targetW;
        miniCanvas.height = targetH;
        const miniCtx = miniCanvas.getContext('2d');
        miniCtx.drawImage(qualityOriginalImage, 0, 0, targetW, targetH);

        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(miniCanvas, 0, 0, targetW, targetH, 0, 0, origW, origH);
    } else {
        tempCtx.drawImage(qualityOriginalImage, 0, 0, origW, origH);
    }

    const calidadJPG = Math.min(Math.max(factorNormalizado, 0.01), 1.0);
    compressedDataURL = tempCanvas.toDataURL('image/jpeg', calidadJPG);
    qualityPreview.src = compressedDataURL;
}

downloadQualityBtn.addEventListener('click', () => {
    if (!compressedDataURL) return;
    const link = document.createElement('a');
    link.download = 'imagen_calidad_modificada.jpg';
    link.href = compressedDataURL;
    link.click();
});