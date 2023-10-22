function calculateRMA(x, y) {
    // Verificar que los arreglos tengan la misma longitud
    if (x.length !== y.length) {
      throw new Error('Los arreglos x e y deben tener la misma longitud.');
    }
  
    // Calcular las medias de x e y
    const meanX = x.reduce((acc, val) => acc + val, 0) / x.length;
    const meanY = y.reduce((acc, val) => acc + val, 0) / y.length;
  
    // Calcular las pendientes
    const slopes = x.map((xi, i) => (xi - meanX) * (y[i] - meanY));
  
    // Calcular las varianzas de x e y
    const varX = x.reduce((acc, xi) => acc + (xi - meanX) ** 2, 0);
    const varY = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  
    // Calcular el factor de escala (b)
    const b = slopes.reduce((acc, val) => acc + val, 0) / varX;
  
    // Calcular la intersección en el eje y (a)
    const a = meanY - b * meanX;
  
    return { a, b };
  }


  function adjustZoom() {
    if (window.matchMedia('(max-width: 600px)').matches) {
        document.querySelector('.graph__container').style.transform = 'scale(0.8)';
    } else if (window.matchMedia('(max-width: 400px)').matches) {
        document.querySelector('.graph__container').style.transform = 'scale(0.6)';
    } else {
        // Restablecer el zoom en otros tamaños de pantalla
        document.querySelector('.graph__container').style.transform = 'scale(1)';
    }
}

// Llamar a la función al cargar la página
adjustZoom();

// Escuchar los cambios en el tamaño de la ventana
window.addEventListener('resize', adjustZoom);



  
  