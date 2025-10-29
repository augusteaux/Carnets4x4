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
                const croppedCanvas = cropper.getCroppedCanvas({
                    width: 150,
                    height: 150,
                });
                
                previaCtx.clearRect(0, 0, previaCanvas.width, previaCanvas.height);
                previaCtx.drawImage(croppedCanvas, 0, 0, previaCanvas.width, previaCanvas.height);
                
                btnDescargarCarnet.disabled = false;
            }
        });
    };
    reader.readAsDataURL(file);
});

btnDescargarCarnet.addEventListener('click', () => {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
    });
    
    fotoCarnetDataURL = croppedCanvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = fotoCarnetDataURL;
    a.download = 'foto_carnet_4x4.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    btnGenerarPDF.disabled = false;
    mensajePlanilla.textContent = 'Foto carnet lista. Ahora presiona "Generar e Imprimir Planilla A4 (PDF)".';
    
    generarVistaPreviaPlanilla(fotoCarnetDataURL);
});

inputCarnet.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fotoCarnetDataURL = event.target.result;
        btnGenerarPDF.disabled = false;
        generarVistaPreviaPlanilla(fotoCarnetDataURL);
    };
    reader.readAsDataURL(file);
});

function generarVistaPreviaPlanilla(dataUrl) {
    contenedorPlanillaA4.innerHTML = '';
    
    const COLS = 4;
    const ROWS = 6;
    const NUM_FOTOS = COLS * ROWS;

    for (let i = 0; i < NUM_FOTOS; i++) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = `Foto carnet ${i + 1}`;
        img.classList.add('foto-carnet-a4');
        contenedorPlanillaA4.appendChild(img);
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
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            x = (j + 1) * margenYsepHorizontal + j * anchoFoto;
            y = (i + 1) * margenYsepVertical + i * altoFoto;
            
            doc.addImage(fotoCarnetDataURL, 'PNG', x, y, anchoFoto, altoFoto);
        }
    }

    doc.save('planilla_carnet_24x4x4.pdf');
});