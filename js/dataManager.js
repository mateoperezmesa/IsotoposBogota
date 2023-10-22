const monthNames = {
  '12': 'Diciembre',
  '11': 'Noviembre',
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo'
  // Agrega los nombres de los meses para los demás números de mes aquí
};

const colorMapping = {
  '11': 'red',
  '12': 'orange',
  '01': '#FFD700',
  '02': '#008000',
  '03': '#00A1E1',
  // ... Asigna colores para los demás meses aquí ...
};

const symbolMapping = {
  'Pozo 227-IV-D-103 (250m)': 'circle',
  'PZ-227-IV-D-103 (140m)': 'triangle-up',
  'Genetica (30m)': 'cross',
  'Hidraulica3 (7m)': 'diamond',
  'TOT Hidráulica (Lluvia)': 'square'
  // Agrega más mapeos según necesites para los demás Nombre2
};

d3.csv("https://raw.githubusercontent.com/hidabril/ISOTOPOS_BOGOTA/main/Resultados_mar2.csv").then(function(data) {
createButtonsForNombres2(data)
filterDataAndRenderChart()

// Crear botones para los "Nombre2"
function createButtonsForNombres2(data) {
  const nombres2Set = new Set(data.map(item => item.Nombre2));
  const contenedorBotones = document.getElementById('contenedorBotones');

  // Limpiar contenido previo
  contenedorBotones.innerHTML = '';

  nombres2Set.forEach(nombre2 => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = nombre2;
    checkbox.checked = true; // Por defecto, todos los checkboxes estarán marcados

    const label = document.createElement('label');
    label.htmlFor = nombre2;
    label.appendChild(document.createTextNode(nombre2));

    checkbox.addEventListener('change', () => {
      filterDataAndRenderChart();
    });

    contenedorBotones.appendChild(checkbox);
    contenedorBotones.appendChild(label);
    contenedorBotones.appendChild(document.createElement('br'));
  });

  // Almacena todos los checkboxes en la variable global para acceder a ellos posteriormente
  checkboxes = document.querySelectorAll('input[type=checkbox]');
}


function filterDataAndRenderChart() {
  const selectedNombre2 = new Set();
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedNombre2.add(checkbox.id);
    }
  });

  const filteredData1 = data.filter(item => selectedNombre2.has(item.Nombre2));
  console.log('Datos filtrados:', filteredData1);


  // Filtrar los datos específicos de "TOT Hidraulica"
  const d18O_TOT = filteredData1
    .filter(item => item.Nombre2 === 'TOT Hidráulica (Lluvia)')
    .map(item => parseFloat(item.d18O));
  const d2H_TOT = filteredData1
    .filter(item => item.Nombre2 === 'TOT Hidráulica (Lluvia)')
    .map(item => parseFloat(item.d2H));

  // Calcular la regresión RMA para "TOT Hidraulica"
  const rmaResult = calculateRMA(d18O_TOT, d2H_TOT);
  const a = rmaResult.a;
  const b = rmaResult.b;

  // Datos para la ecuacion de la linea meteorica mundiall
  const start = -16; 
  const end = -5;  
  const d18O_Glob = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const d2H_Glob = d18O_Glob.map(d18O => 8 * d18O + 10);


  // Inicio de filtrado por mes.
  const uniqueMonths = [...new Set(filteredData1.map(item => item.Fecha.split('/')[1]))];
  const uniqueNombre2 = [...new Set(filteredData1.map(item => item.Nombre2))];

  const plotlyData = uniqueMonths.map(month => {
    const filteredData = filteredData1.filter(item => item.Fecha.split('/')[1] === month);
    
    //console.log('data', filteredData1);
    //console.log('x', filteredData1.map(item => parseFloat(item.d18O)));
    //console.log('y', filteredData1.map(item => parseFloat(item.d2H)));
    //console.log('s', filteredData1.map(item => symbolMapping[item.Nombre2]));
    //console.log('c', colorMapping[month]);

   

    return {  
      type: 'scatter',
      mode: 'markers',
      x: filteredData.map(item => parseFloat(item.d18O)),
      y: filteredData.map(item => parseFloat(item.d2H)),
      hoverinfo: 'text',
      text: filteredData.map(item => `Estacion: ${item.Nombre2}
      <br>δ¹⁸H ‰: ${parseFloat(item.d18O).toFixed(2)}
      <br>δ²H ‰: ${parseFloat(item.d2H).toFixed(2)}
      <br>Mes: ${monthNames[item.Fecha.split('/')[1]]}`),
      marker: {
        symbol: filteredData.map(item => symbolMapping[item.Nombre2]),
        size: 8,
        color: colorMapping[month],
        line: { // Configura el contorno del marcador
          color: 'black', // Cambia el color del contorno
          width: 1.5, // Cambia el grosor del contorno
        },
      },
      name: monthNames[month],
      layer: 'above'
    };
  });


  uniqueNombre2.forEach(nombre2 => {
    plotlyData.push({
      type: 'scatter',
      mode: 'markers',
      x: [null],
      y: [null],
      marker: {
        symbol: symbolMapping[nombre2],
        size: 10,
        color: 'black'
      },
      name: nombre2
    });
  });

  // Agrega la línea "Linea meteorica Colombia"
  /*
  plotlyData.push({
    type: 'scatter',
    mode: 'lines',
    x: data.map(item => parseFloat(item.d18oMeteo)),
    y: data.map(item => parseFloat(item.d2hBog)),
    hoverinfo: 'text',
    text: '',
    marker: {
      symbol: 'circle',
      color: '0B5345' // Puedes cambiar el color según tu preferencia
    },
    line: {
      dash: 'dot', // Configura la línea como punteada
      width: 2
    },
    name: 'Linea meteorica Bogota',
    layer: 'below',
  });
  */

  // Agrega la línea "Linea meteorica Colombia"
  /*
  plotlyData.push({
    type: 'scatter',
    mode: 'lines',
    x: data.map(item => parseFloat(item.d18oMeteo)),
    y: data.map(item => parseFloat(item.d2hCol)),
    hoverinfo: 'text',
    text: '',
    marker: {
      symbol: 'triangle-up',
      color: '#763333' // Puedes cambiar el color según tu preferencia
    },
    line: {
      dash: 'dot', // Configura la línea como punteada
      width: 2
    },
    name: 'Linea meteorica Colombia',
    layer: 'below',
  });
  */


  // Rma TOT Hidraulica
  plotlyData.push({
    type: 'scatter',
    mode: 'lines',
    x: d18O_TOT, // Usamos los datos originales de d18O
    y: d18O_TOT.map(x => a + b * x), // Calcula y en función de la regresión RMA
    hoverinfo: 'text',
    text: '',
    marker: {
      symbol: 'square', // Cambia el símbolo si es necesario
      color: 'red', // Cambia el color si es necesario
    },
    line: {
      dash: 'dot', // Configura la línea como punteada
      width: 1
    },
    name: 'RMA TOT Hidraulica',
    layer: 'below',
  });
  
  // Línea meteorica mundial
  plotlyData.push({
    type: 'scatter',
    mode: 'lines',
    x: d18O_Glob,
    y: d2H_Glob,
    hoverinfo: 'text',
    text: '',
    marker: {
      symbol: 'circle', // Puedes cambiar el símbolo si es necesario
      color: 'black', // Cambia el color si es necesario
    },
    line: {
      width: 1
    },
    name: 'Línea meteórica mundial',
    layer: 'below',
  });


  const layout = {
    title: {
      text: 'Gráfico de dispersión δ¹⁸O ‰ vs δ²H ‰ por mes',
      font: {
        family: 'Arial', // Fuente del título
        size: 28,        // Tamaño del título
        color: 'black',  // Color del título
        bold: 'bold'     // Negrita para el título
      },
    },
    xaxis: {
      title: 'δ¹⁸O (‰, VSMOW)',
      titlefont: {
        family: 'Arial', // Fuente del título del eje x
        size: 20,        // Tamaño del título del eje x
        color: 'black',  // Color del título del eje x
      },
      linecolor: 'black',
      linewidth: 2,
    },
    yaxis: {
      title: 'δ²H (‰, VSMOW)',
      titlefont: {
        family: 'Arial', // Fuente del título del eje y
        size: 20,        // Tamaño del título del eje y
        color: 'black',  // Color del título del eje y
      },
      linecolor: 'black',
      linewidth: 2,
    },
    paper_bgcolor: 'rgb(240, 240, 240)',
    plot_bgcolor: '#F9F9F9',

    showlegend: true,
    legend: {
      bgcolor: 'rgb(240, 240, 240)', // Color de fondo de la leyenda
      x: 1, // Ajuste de la posición horizontal de la leyenda
      y: 1, // Ajuste de la posición vertical de la leyenda
      font: {
        family: 'Arial', // Fuente de la leyenda
        size: 18, // Tamaño del texto en la leyenda
        color: 'black', // Color del texto en la leyenda
      }
    },
    height: 600, // Alto del gráfico en píxeles
  };

  Plotly.newPlot('plotlyChart', plotlyData, layout);
}



}).catch(function(error) {
  console.error('Error al cargar el archivo CSV:', error);
});

