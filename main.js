// Constante total de UVAs
const totalUvas = 51925.57;

// Función para obtener datos desde una URL (fetch para ambas APIs)
async function obtenerDatos(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error en la solicitud: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}

// Función para obtener el valor de la fecha seleccionada desde la API de valores
async function obtenerDatosValores(fechaFormateada) {
    const url = `https://prestamos.ikiwi.net.ar/api/v1/engine/uva/valores/`;
    const data = await obtenerDatos(url);
    if (data) {
        // Buscar el valor para la fecha formateada
        const valor = data.find(item => item.fecha === fechaFormateada);
        if (valor) {
            //console.log("Valor encontrado para la fecha:", valor);
            return valor.valor;  // Retorna el valor de la UVA
        } else {
            console.error("No se encontró un valor para la fecha:", fechaFormateada);
            return null;
        }
    } else {
        console.error("No se pudo obtener los datos de valores.");
        return null;
    }
}

// Función para obtener la Cant_UVA para el mes y año seleccionados
async function obtenerFechaPorMesAnio(mesAnioSeleccionado) {
    const url = 'uvas.json';  // Cambiar por la URL correcta si es necesario
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error al obtener los datos de uvas: ${response.status}`);
        return null;
    }
    const data = await response.json();

    // Buscar la Cant_UVA para el mes y año seleccionados
    const fecha = data.find(item => item.fecha === mesAnioSeleccionado);
    if (fecha) {
        //console.log(`Fecha encontrada en uvas.json para ${mesAnioSeleccionado}: ${fecha.Cant_UVA}`);
        return fecha.Cant_UVA;  // Devolvemos el valor de Cant_UVA
    } else {
        console.error(`No se encontró la fecha ${mesAnioSeleccionado} en uvas.json.`);
        return null;
    }
}

// Función para sumar las Cant_UVA hasta la fecha seleccionada
async function obtenerSumaHastaFecha(fechaSeleccionada) {
    const url = 'uvas.json';  // Cambiar por la URL correcta si es necesario
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error al obtener los datos de uvas: ${response.status}`);
        return null;
    }
    const data = await response.json();

    // Convertir la fecha seleccionada a objeto Date
    const fechaSeleccionadaDate = new Date(fechaSeleccionada.split('-').reverse().join('-')); // Convertimos a YYYY-MM-DD

    // Filtrar las fechas que son menores a la fecha seleccionada
    const fechasFiltradas = data.filter(item => {
        const [mes, anio] = item.fecha.split('-');
        const fechaItem = new Date(`${anio}-${mes}-01`);  // Creamos una fecha usando el primer día del mes

        // Comparamos las fechas
        return fechaItem < fechaSeleccionadaDate;
    });

    // Sumar las Cant_UVA de las fechas filtradas
    const sumaCantUVA = fechasFiltradas.reduce((total, item) => total + parseFloat(item.Cant_UVA || 0), 0);

    return sumaCantUVA;  // Devolvemos la suma acumulada de Cant_UVA
}

// Función para manejar el clic del botón de búsqueda
document.addEventListener('DOMContentLoaded', function () {
    const inputFecha = document.getElementById('fecha');
    const botonBuscar = document.getElementById('buscar');
    const resultado = document.getElementById('resultado');

    botonBuscar.addEventListener('click', async function () {
        const fechaSeleccionada = inputFecha.value; // Obtener la fecha seleccionada

        if (fechaSeleccionada) {
            // Extraer el mes y año de la fecha seleccionada
            const partes = fechaSeleccionada.split('-');
            const anio = partes[0]; // Año
            const mes = partes[1]; // Mes
            const dia = partes[2]; // Día
            const mesAnioSeleccionado = `${mes}-${anio}`;  // Formato MM-YYYY
            const fechaFormateada = `${dia}-${mes}-${anio}`;  // Formato DD-MM-YYYY

            //console.log(`Fecha seleccionada en formato MM-YYYY: ${mesAnioSeleccionado}`);
            //console.log(`Fecha seleccionada en formato DD-MM-YYYY: ${fechaFormateada}`);

            // Consultar la API de uvas.json para obtener Cant_UVA
            const cantUVA = await obtenerFechaPorMesAnio(mesAnioSeleccionado);
            if (cantUVA) {
                // Consultar la API de valores para obtener el valor del día
                const valorUVADia = await obtenerDatosValores(fechaFormateada);

                if (valorUVADia) {
                    // Calcular el capital
                    const capital = cantUVA * valorUVADia;

                    // Obtener la suma de Cant_UVA hasta la fecha seleccionada
                    const sumaCantUVA = await obtenerSumaHastaFecha(fechaFormateada);

                    // Calcular el interés
                    const tasaInteres = 3.5;  // Tasa de interés
                    const dias = 30;  // Días para el cálculo
                    const interes = (totalUvas - sumaCantUVA) * valorUVADia * tasaInteres * dias / 36000;

                    //Calcular el total de la cuota
                    const total = capital + interes
                    //Calcular uvas restantes
                    const restoUva = totalUvas - sumaCantUVA

                    // Mostrar resultados en el DOM
                    resultado.innerHTML = `
                        
                    <div class="row bg-white rounded shadow my-4 py-3">
                        <div class="col-6 py-4">
                            <p class="">Cant UVAs al <strong>${mesAnioSeleccionado}</strong>:</p>
                            <h4><strong>${cantUVA}</strong></h4>
                        </div>
                        <div class="col-6 py-4">
                            <p class="">UVAs Pagos al <strong>${mesAnioSeleccionado}</strong>:</p>
                            <h4><strong>${sumaCantUVA.toFixed(2)}</strong></h4>
                        </div>
                        <div class="col-6 py-4">
                            <p class="">Valor UVA al <strong>${fechaFormateada}</strong>:</p>
                            <h4><strong>$${valorUVADia}</strong></h4>
                        </div>
                        <div class="col-6 py-4">
                            <p class="">UVAs Restantes:</p>
                            <h4><strong>${restoUva.toFixed(2)}</strong></h4>
                        </div>
                        <div class="col-6 my-4">
                            <p>Capital:</p>
                            <h3><strong>$${capital.toFixed(2)}</strong></h3>
                        </div>
                        <div class="col-6 my-4">
                            <p>Intereses:</p>
                            <h3><strong>$${interes.toFixed(2)}</strong></h3>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 bg-white rounded shadow my-4 py-3">
                            <h2><strong>Total: $${total.toFixed(2)}</strong></h2>
                        </div>
                    </div>
                        
                    `;
                } else {
                    resultado.textContent = `No se encontró valor para la fecha ${fechaFormateada} en la API de valores.`;
                }
            } else {
                resultado.textContent = `No se encontró la fecha para el mes y año ${mesAnioSeleccionado} en uvas.json.`;
            }
        } else {
            resultado.textContent = 'Por favor, selecciona una fecha.';
        }
    });
});
