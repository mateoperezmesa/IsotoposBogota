const monthNames = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre'
};


const colorMapping = {
  '01': '#FFD700',  // Amarillo dorado para Enero
  '02': '#008000',  // Verde para Febrero
  '03': '#00A1E1',  // Azul claro para Marzo
  '04': '#FF69B4',  // Rosa para Abril
  '05': '#4B0082',  // Índigo para Mayo
  '06': '#FF4500',  // Naranja oscuro para Junio
  '07': '#800080',  // Púrpura para Julio
  '08': '#4682B4',  // Azul acero para Agosto
  '09': '#A52A2A',  // Marrón para Septiembre
  '10': '#FFA500',  // Naranja para Octubre
  '11': 'red',      // Rojo para Noviembre
  '12': 'orange'    // Naranja claro para Diciembre
};


const symbolMapping = {
  'Pozo 227-IV-D-103 (250m)': 'circle',
  'PZ-227-IV-D-103 (140m)': 'triangle-up',
  'Genetica (30m)': 'cross',
  'Hidraulica3 (7m)': 'diamond',
  'TOT Hidráulica (Lluvia)': 'square'
  // Agrega más mapeos según necesites para los demás Nombre2
};

//Datos Campus (outdated)
//d3.csv("https://raw.githubusercontent.com/mateoperezmesa/IsotoposBogota/main/data/datos.csv").then(function(data) {
//Datos ideam
d3.csv("https://raw.githubusercontent.com/mateoperezmesa/IsotoposBogota/main/data/Isotopos_ideam.csv").then(function(data) {  
//Datos IAEA
//d3.csv("https://raw.githubusercontent.com/mateoperezmesa/IsotoposBogota/main/data/isotopos%20iaea.csv").then(function(data) {  
createButtonsForNombres2(data)
createYearButtons(data);
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
    checkbox.id = 'station_' +nombre2;
    checkbox.checked = true; // Por defecto, todos los checkboxes estarán marcados

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
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


// Crear botones para los "Años"
function createYearButtons(data) {
  const yearsSet = new Set(data.map(item => item.Fecha.split('/')[2])); // Suponiendo que la fecha está en formato DD/MM/YYYY
  const contenedorBotonesAnos = document.getElementById('contenedorBotonesAnos');

  // Limpiar contenido previo
  contenedorBotonesAnos.innerHTML = '';

  yearsSet.forEach(year => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'year_' +year;
    checkbox.checked = true; // Por defecto, todos los checkboxes estarán marcados

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.appendChild(document.createTextNode(year));

    checkbox.addEventListener('change', () => {
      filterDataAndRenderChart();
    });

    contenedorBotonesAnos.appendChild(checkbox);
    contenedorBotonesAnos.appendChild(label);
    contenedorBotonesAnos.appendChild(document.createElement('br'));
  });

  // Almacena todos los checkboxes en la variable global para acceder a ellos posteriormente
  checkboxesAnos = document.querySelectorAll('input[type=checkbox]');
}



// Filtrar datos y renderizar grafico
function filterDataAndRenderChart() {
  const selectedNombre2 = new Set();
  checkboxes.forEach(checkbox => {
    if (checkbox.checked && checkbox.id.startsWith('station_')) {
      selectedNombre2.add(checkbox.id.replace('station_', ''));
    }
  });

  const selectedYears = new Set();
  checkboxesAnos.forEach(checkbox => {
    if (checkbox.checked && checkbox.id.startsWith('year_')) {
      selectedYears.add(checkbox.id.replace('year_', ''));
    }
  });

 

  const filteredData1 = data
    .filter(item => selectedNombre2.has(item.Nombre2) && selectedYears.has(item.Fecha.split('/')[2]));
   
    // Verirficacion
   console.log('Estaciones seleccionadas:', Array.from(selectedNombre2));
   console.log('Años seleccionados:', Array.from(selectedYears));
   console.log('Datos filtrados:', filteredData1); // Verifica los datos filtrados aquí


  // Simbolos
  const symbols = ['circle', 'triangle-up', 'cross', 'diamond', 'square'];
  let symbolIndex = 0;

  function getSymbolForStation(nombre2) {
    if (!symbolMapping[nombre2]) {
      symbolMapping[nombre2] = symbols[symbolIndex % symbols.length];
      symbolIndex++;
    }
    return symbolMapping[nombre2];
  }
 
  

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
  const r = rmaResult.rSquared;
  //console.log('a interseccion eje y', a);
  //console.log('b', b);
  //console.log('R^2', r);
  

  // Datos para la ecuacion de la linea meteorica mundiall
  const start = -16; 
  const end = -5;  
  const d18O_Glob = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const d2H_Glob = d18O_Glob.map(d18O => 8 * d18O + 10);


  // Inicio de filtrado por mes.
  const uniqueMonths = [...new Set(filteredData1.map(item => item.Fecha.split('/')[1]))];
  const uniqueNombre2 = [...new Set(filteredData1.map(item => item.Nombre2))];

  //console.log('data', filteredData1);
  console.log(data[0]);
  console.log('x', filteredData1.map(item => parseFloat(item.d18O)));
  console.log('y', filteredData1.map(item => parseFloat(item.d2H)));
  //console.log('s', filteredData1.map(item => symbolMapping[item.Nombre2]));
  //console.log('c', colorMapping[month]);
  
  const plotlyData = uniqueMonths.map(month => {
    const filteredData = filteredData1.filter(item => item.Fecha.split('/')[1] === month);
    


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
        symbol: filteredData.map(item => getSymbolForStation(item.Nombre2)),
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

