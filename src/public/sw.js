self.addEventListener('push',e=>{
    const data=e.data.json()
    if (!(self.Notification && self.Notification.permission === 'granted')) {
       console.log('Las notificaciones estan desativadas')
        return;
      }
    if ('actions' in Notification.prototype) {
        var rUrl='http://localhost:4000/dashboard';
        const notification = self.registration.showNotification(data.title, {
            body: data.message,
            icon: '../img/favicon.ico',
            //son iconos en la parte superiro del telefono movil
            badge: '../img/logo.png',
            //sonido
            sound: '../sonidos/caida_prev.mp3',
            //imagen
            //image: '../img/domicompras.png',
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1,
                redirectUrl : rUrl
              }
        })
        //console.log(data)
        
    }else{
        alert('Tu navegador no soporta las notificaciones')
    }
})


  
self.addEventListener('fetch', function(event) {
    //console.log('Manejo del evento de recuperación para', event.request.url);
  
    event.respondWith(
      // caches.match () buscará una entrada de caché en todos los cachés disponibles para el trabajador del servicio.
       // Es una alternativa a abrir primero un caché con nombre específico y luego hacer coincidir eso.
      caches.match(event.request).then(function(response) {
        if (response) {
          //console.log('Respuesta encontrada en caché:', response);
  
          return response;
        }
  
        //console.log('No se encontró respuesta en la caché. A punto de recuperar de la red ...');
  
        // event.request siempre tendrá el modo apropiado establecido ('cors,' no-cors ', etc.) así que no
         // tenemos que codificar 'no-cors' como hacemos cuando fetch () ing en el controlador de instalación.
        return fetch(event.request).then(function(response) {
          //console.log('La respuesta de la red es:', response);
  
          return response;
        }).catch(function(error) {
          // Este catch () manejará las excepciones lanzadas desde la operación fetch ().
           // Tenga en cuenta que una respuesta de error HTTP (por ejemplo, 404) NO activará una excepción.
           // Devolverá un objeto de respuesta normal que tiene el código de error apropiado configurado.
          //console.error('Fallida:', error);
  
          throw error;
        });
      })
    );
  });

