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

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(imagenParaRecortar, {
            aspectRatio: 1 / 1,
            viewMode: 1,
            autoCropArea: 0.8,
            crop: function(event) {
                const croppedCanvas4x4 = cropper.getCroppedCanvas({
                    width: 150,
                    height: 150,
                });
                
                previaCtx.clearRect(0, 0, previaCanvas.width, previaCanvas.height);
                previaCtx.drawImage(croppedCanvas4x4, 0, 0, previaCanvas.width, previaCanvas.height);
                
                const croppedCanvasA4 = cropper.getCroppedCanvas({
                    width: 472,
                    height: 472,
                    fillColor: '#fff',
                });
                
                fotoCarnetDataURL = croppedCanvasA4.toDataURL('image/png');

                generarVistaPreviaPlanilla(fotoCarnetDataURL);
                btnDescargarCarnet.disabled = false;
                btnGenerarPDF.disabled = false;
                mensajePlanilla.style.display = 'none';
            }
        });
        
        if (cropper) {
            cropper.crop();
        }

    };
    reader.readAsDataURL(file);
});

btnDescargarCarnet.addEventListener('click', () => {
    if (!fotoCarnetDataURL) return;

    const a = document.createElement('a');
    a.href = fotoCarnetDataURL;
    a.download = 'foto_carnet_4x4.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

inputCarnet.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fotoCarnetDataURL = event.target.result;
        btnGenerarPDF.disabled = false;
        if (cropper) {
            cropper.destroy();
            cropper = null;
            imagenParaRecortar.style.display = 'none';
        }
        generarVistaPreviaPlanilla(fotoCarnetDataURL);
        mensajePlanilla.style.display = 'none';
    };
    reader.readAsDataURL(file);
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

    const COLS = 4;
    const ROWS = 6;
    const NUM_FOTOS = COLS * ROWS;

    for (let i = 0; i < NUM_FOTOS; i++) {
        const div = document.createElement('div');
        div.classList.add('foto-carnet-a4');
        div.style.backgroundImage = `url(${dataUrl})`;
        grid.appendChild(div);
    }
}

btnGenerarPDF.addEventListener('click', () => {
    if (!fotoCarnetDataURL) {
        alert('Por favor, primero recorta o sube una foto carnet.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const anchoA4 = 210;
    const altoA4 = 297;

    const anchoFoto = 40;
    const altoFoto = 40;
    
    const cols = 4;
    const rows = 6;
    
    const anchoTotalFotos = cols * anchoFoto;
    const espacioHorizontalTotal = anchoA4 - anchoTotalFotos;
    const numEspaciosHorizontales = cols + 1;
    const margenYsepHorizontal = espacioHorizontalTotal / numEspaciosHorizontales;

    const altoTotalFotos = rows * altoFoto;
    const espacioVerticalTotal = altoA4 - altoTotalFotos;
    const numEspaciosVerticales = rows + 1;
    const margenYsepVertical = espacioVerticalTotal / numEspaciosVerticales;

    let x, y;
    const img = new Image();
    img.src = fotoCarnetDataURL;

    img.onload = () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                x = (j + 1) * margenYsepHorizontal + j * anchoFoto;
                y = (i + 1) * margenYsepVertical + i * altoFoto;
                
                doc.addImage(img, 'PNG', x, y, anchoFoto, altoFoto);
            }
        }
        doc.save('planilla_carnet_24x4x4.pdf');
    }
});