const socket = io();
const btnNotificacion = document.querySelector('#divNotifiacion')
const CantProductosPendientes = document.querySelector('#CantProductosPendientes')
var audio = document.getElementById("audio");
let pedidos;

//cargar datos del cliente
const idAliado=document.querySelector('#txtIdUser')
const idId=document.querySelector('#txtIdId')
let numerosPedidosActivos=[];
let PedidosEnProduccion=[];
let pedidosEntregados=[];


socket.on("pedido", function (data) {
    audio.play();
    //cargar contenido para mostrar
        numerosPedidosActivos.push({
            numeroPedido : data.numeroPedido,
            descripcion:data.descripcion
        })
    //mostrar boton de pedido
    var element = document.getElementById("divNotifiacion");
    element.innerHTML=generarDivOrden();
});



const formatterPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  })

//=================================================
async function cargaGeneralPedidos(){
    //realiza la busqueda de:
    await fetch('/consultarPedido',{
        method:'POST',
        body:JSON.stringify({
            idAliado:idAliado,       
        }),
        headers:{
            "content-Type":"application/json"
        }
    })
    .then(function(response) {
        return response.json();            
    })
    .then(data => {
        // console.log('Numero pedido '+data.data.data.cont)
        // console.log('Hora pedido '+data.data.data.hora)
        //console.log('Mensage '+data.data.response)
        if(data.data.response=='Ok'){
            // pedidos por aceptar
            //cargarPedidosPorAceptar();
            //en preparacion //PedidosEnProduccion
            for (const k in data.data.data2) {
                var ddata = consultarDato(PedidosEnProduccion,data.data.data2[k].orden)
                if(ddata === 0){
                    var pprecio = consultarPrecioOrden(data.data.data2,data.data.data2[k].orden)
                    PedidosEnProduccion.push({
                        horaRecibido:data.data.data.hora,
                        horaEntrega: '',
                        orden:data.data.data2[k].orden,
                        precio:pprecio
                    }) 
                }
            }
            caragarPedidosPreparacion();
            // pedidos entregados
            //cargarPedidosEntregados();

        }
    })
    .catch(function(error) {
        console.log(error);
    });

    
}

function consultarDato(arreglo,orden){
    var vvalor=0;
    for (const k in arreglo) {
        if(arreglo[k].orden === orden){
            vvalor =1;
        }
    }
    return vvalor;
}

function consultarPrecioOrden(arreglo,orden){
    var precio=0;
    for (const k in arreglo) {
        if(arreglo[k].orden === orden){
            precio =parseInt(precio) + parseInt(arreglo[k].precio);
        }
    }
    return precio;
}

//generar un evento que cuando se recague la pagina se
//consulte el estado de los productos para esta empresa
cargaGeneralPedidos()



function caragarPedidosPreparacion(){
    var divPreparacion = document.querySelector('#divPreparacion')
    var DatosPedido=`        
    <table width="100%">
    <thead>
      <tr>
        <th class="text-center">Hora recibida</th>
        <th class="text-center">Tiempo entrega</th>
        <th class="text-center">Orden</th>
        <th class="text-center">Pecio</th>
        <th class="text-center">Imprimir</th>
        <th class="text-center">Estado</th>
      </tr>
    </thead>
    <tbody id="listEspera">`;
    var ddatos=1;
    for (const key in PedidosEnProduccion) {
        DatosPedido +=`
          <tr>
            <td class="text-center">
                ${PedidosEnProduccion[key].horaRecibido}
            </td>
            <td class="text-center">
                ${PedidosEnProduccion[key].horaEntrega} Min.
            </td>
            <td class="text-center">
                ${PedidosEnProduccion[key].orden}
                <input type="text" value="${PedidosEnProduccion[key].orden}" id="txt_ordenRecicibo_${ddatos}" hidden="false"/>
            </td>
            <td class="text-center">
                $ ${(PedidosEnProduccion[key].precio)}
                <input type="text" value="${PedidosEnProduccion[key].precio}" id="txt_precioRecicibo_${ddatos}" hidden="false"/>
            </td>
            <td class="text-center">
              <i class="far fa-print text-primary" style="cursor:pointer"  alt="imprimir Pedido" title="imprimir Pedido" onclick="cargarVistaImpresion(${PedidosEnProduccion[key].orden})"></i>
            </td>            
            <td class="text-center">
              <i class="far fa-paper-plane text-primary" alt="entregar pedido" title="entregar pedido" style="cursor:pointer" onclick="confirmarEntregaPedido(${ddatos})"></i>
            </td>
          </tr>`;
          ddatos++;
    }
    if(PedidosEnProduccion.length <= 0){
        var estructura=`<img src="/img/preparacion.png" alt="Los pedidos se estan preparando" title="Los pedidos se estan preparando" width="150px"/>`;
        divPreparacion.innerHTML=estructura;
    }else{
        DatosPedido +=`</tbody></table>`;
        divPreparacion.innerHTML=DatosPedido;
    }
}

function cargarPedidosEntregados(){
    var divEntregados = document.querySelector('#DivEntregados')
    var orden=0;
    var DatosPedido=`        
    <table width="100%">
    <thead>
      <tr>
        <th>Hora entrega</th>
        <th>Producto</th>
        <th>Precio</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody id="listEspera">`;
    for (const key in pedidosEntregados) {
        DatosPedido +=`
          <tr>
            <td>${pedidosEntregados[key].hentrega}</td>
            <td>${pedidosEntregados[key].orden}</td>
            <td>$ ${(pedidosEntregados[key].precio)}</td>
            <td class="text-center">
                <i class="far fa-check-circle text-success"></i>
            </td>
          </tr>`;
        orden =pedidosEntregados[key].orden;
    }
    if(pedidosEntregados.length === 0){
        var estructura=`<img src="/img/entregados.png" alt="Pedidos entregados" title="Pedidos entregados" width="150px"/>`;
        divEntregados.innerHTML=estructura;
    }else{
        DatosPedido +=`</tbody></table>`
        divEntregados.innerHTML=DatosPedido;
    }
}

function eliminarPedidoPreparacion(numeroPedido){
    //eliminar el productos que se paso de preparaciona entregado
    var i = PedidosEnProduccion.indexOf(numeroPedido);
    PedidosEnProduccion.splice( i, 1 );
    //lamamos nuevamnete a la funcion elementos en preparacion
    caragarPedidosPreparacion()
}

async function cargarVistaImpresion(orden){

    const numeroOrden=orden;
    await fetch('/consultarPedido',{
            method:'POST',
            body:JSON.stringify({
                numeroPedido:orden,
            }),
            headers:{
                "content-Type":"application/json"
            }
        })
        .then(function(response) {
            return response.json();            
        })
        .then(data => {
            if (data.data.response === 'Ok') {
                const Nhora = data.data.data.hora;
                pedidos = data.data.data2;
                const f = new Date()
                const ffecha=f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
                var valorPedido=0;
                for (const k in pedidos) {
                    if(numeroOrden == data.data.data.cont){
                        valorPedido = parseFloat(valorPedido) + parseFloat(pedidos[k].precio)
                    }
                }
                var DatosPedido='<div id="DivImprmir">';
                for (const key in pedidos) {
                    
                    if(numeroOrden == pedidos[key].orden){
                        DatosPedido +=`
                        <div class="col-sm-12 card border-dark mt-2">
                        <div class="row p-2">
                
                            <div class="col-sm-12 text-center h3">
                                <span style="color:#AAD500">${pedidos[key].nombre}</span>
                            </div>
                
                            <div class="col-sm-12 text-right">
                                <span style="color:#AAD500"><b>Orden N° </b>${pedidos[key].orden}</span>
                            </div>            
                
                            <div class="col-sm-6 text-center">
                                <img src="https://cadenaser00.epimg.net/emisora/imagenes/2018/01/31/ser_madrid_norte/1517400077_202649_1517400143_noticia_normal.jpg" alt="" title="" width="100%"/>
                            </div>
                            
                            <div class="col-sm-6 text-center">
                                <textarea style="border: 1px solid #AAD500; width:100%;" disabled rows="4">${pedidos[key].notas}</textarea>
                            </div>                   
                            
                            <div class="col-sm-12 text-right" style="text-align:right">
                                <span>Cant. </span><span style="font-size:28px"><b>${pedidos[key].cant}</b></span>
                            </div>             
                
                        </div>
                        </div>`;
                    }
                }
                DatosPedido +=`</div>
                <div class="col-sm-12">
                    <button class="btn text-center mt-2 w-100" style="border: 1px solid ; box-shadow: 2px 2px #AAD500;" type="button" onclick="imprimir()">
                        <i class="fas fa-print" style="color:#AAD500;"></i>
                        Imprimir Orden N° ${numeroOrden}
                    </button>
                </div>`;
                $('#modal-title2').text('Imprimir Orden');
                $('#modal-body2').html(DatosPedido)
                $('#modal-footer2').html('')
                $('#myModal2').modal('toggle')                
            }else{

                var DatosPedido=`
                <div class="col-sm-12 text-center">
                <div class="row text-center">
    
                    <i class="far fa-times-circle text-danger fa-3x"></i>
                    <span class="text-center col-sm-12">
                        Ups!. error al conectar con el servidor>
                    </span>
    
                </div>
                </div>`;
                $('#modal-title2').text('Error con el detalle de impresion');
                $('#modal-body2').html(DatosPedido)
                $('#modal-footer2').html('')
                $('#myModal2').modal('toggle') 
            }
        })
        .catch(function(error) {
         console.log(error);
        });
}

function imprimir(){
    var divName='DivImprmir'
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

function generarDivOrden(){
    //mostrar la ventana roja con movimiento
    var div="";
    for (let index = 0; index < numerosPedidosActivos.length; index++) {

        div += `
        <div class="notificacionesDiv col-sm-3" id="div_${numerosPedidosActivos[index].numeroPedido}" onclick="acepttarPedido(${numerosPedidosActivos[index].numeroPedido})">
        <a href="#" style="text-decoration:none; color:white">
        <div class="row">
            <div class="col-sm-4 text-center">
                <i class="fas fa-bell fa-3x"></i>
                <p>Notificación</p>
            </div>
            <div class="col-sm-8 text-center">
                <span class="h3">Pedido N° </span><br><span><b> ${numerosPedidosActivos[index].numeroPedido}</b></span>
            </div> 
            <div class="col-sm-12" style="margin-top:-20px;">
                <hr class="background:color:#fff">
                <span><b>Descripcion: </b><br>${numerosPedidosActivos[index].descripcion}</span>
            </div>                    
        </div>
        </a>
        </div>`;
    }
    return div;
}

async function acepttarPedido(id){

    //const resultado = numerosPedidosActivos.find( data => data.numeroPedido === id);
    const numeroPedido=id;
    //consultar datos del pedido
    await fetch('/consultarPedido',{
            method:'POST',
            body:JSON.stringify({
                numeroPedido:id,
            }),
            headers:{
                "content-Type":"application/json"
            }
        })
        .then(function(response) {
            return response.json();            
        })
        .then(data => {
            if (data.data.response === 'Ok') {
                const Nhora = data.data.data.hora;
                pedidos = data.data.data2;
                const f = new Date()
                const ffecha=f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
                var valorPedido=0;
                for (const k in pedidos) {
                    if(numeroPedido === data.data.data.cont){
                        valorPedido = parseFloat(valorPedido) + parseFloat(pedidos[k].precio)
                    }
                }
                    var DatosPedido = `
                    <form autocomplete="off" onsubmit="return cancelarEstePedido(${id})">
                    <div class="row">
                        <div class="form-group col-sm-6 mb-2">
                            <b>Orden N° ${id}</b><br>
                            Fecha: ${ffecha} - ${Nhora}
                            <input type="text" value="${Nhora}" id="txt_horaActual" hidden="false"/>
                            <input type="text" value="${ffecha}" id="txt_fechaActual" hidden="false"/>
                            <input type="text" value="${valorPedido}" id="txt_precioTotal" hidden="false"/>
                        </div>
                        <div class="form-group col-sm-6 mb-2">
                            <b>Datos del Usario:</b><br> Usuario
                        </div>  
                        <div class="form-group col-sm-6 mb-2 text-center">
                            <b>Total Pedido:</b><br> ${formatterPeso.format(valorPedido)}
                        </div>                            
                        <div class="form-group col-sm-6 text-center">
                            <button class="btn btn-block" onclick="mostrarDetalle(${data.data.data.cont})" style="background:#AAD500; color:#FFF" type="button">Ver detalle</button>
                            <textarea hidden="false" id="txt_pedidosCargar">${pedidos}</textarea>
                        </div>
                        <div class="form-group col-sm-12 text-center">
                            <hr style="background:#AAD500">
                        </div>                    
                        <div class="col-sm-12 form-group text-center">
                            <b><label for="txtTiempoEntrega">Tiempo preparación</label></b><br>
                            <div class="row text-center">
                                <div class="col-sm-3 col-3 col-xs-3 text-right" stylle="text-align:right">
                                    <br>
                                    <i class="fad fa-horizontal-rule" style="color:#AAD500; cursor:pointer" onclick="cambiarTiempoEntrega(0)"></i>
                                </div>
                                <div class="col-sm-6 col-6 col-xs-6 text-center mx-auto" stylle="text-align:center">
                                    <input type="text" id="txtTiempoEntrega" disabled class="form-control w-50 mx-auto" value="30" name="txtTiempoEntrega" 
                                    required placeholder="Tiempo estimado de entrega" style="font-size:30px; padding:10px; text-align:center"/>    
                                </div>
                                <div class="col-sm-3 col-3 col-xs-3 text-left" stylle="text-align:left">
                                    <br>
                                    <i class="fas fa-plus" style="color:#AAD500; cursor:pointer" onclick="cambiarTiempoEntrega(1)"></i>
                                </div>
                            </div>
                        </div>

                        <div class="form-group col-sm-6 col-6 col-xs-6">
                            <button class="btn text-center mt-2 w-100" onclick="mostrarFormRechazarPedido(${id})" style="border: 1px solid red; box-shadow: 2px 2px red;" type="button" >
                                <i class="far fa-times-circle text-danger"></i>
                                Rechazar
                            </button>
                        </div>
                        <div class="form-group col-sm-6 col-6 col-xs-6">
                            <button class="btn text-center mt-2 w-100" style="border: 1px solid ; box-shadow: 2px 2px #AAD500;" type="submit" >
                                <i class="far fa-check-circle" style="color:#AAD500;"></i>
                                Aceptar Orden
                            </button>
                        </div>                    
                    </div>
                    </form>`;
                $('#modal-title').text('Detalles del pedido');
                $('#modal-body').html(DatosPedido)
                $('#modal-footer').html('')
                $('#myModal').modal('toggle')                
            }else{
                alert('Recargue la pagina')
            }
        })
        .catch(function(error) {
         console.log(error);
        });
}

function mostrarDetalle(id){
    const numeroPedido = id
    const txt_pedidosCargar = pedidos;
    var DatosPedido="";
    for (const key in txt_pedidosCargar) {
        if(txt_pedidosCargar[key].orden == numeroPedido){
            DatosPedido +=`
            <div class="col-sm-12 card border-dark mt-2">
            <div class="row p-2">

                <div class="col-sm-12 text-center h3">
                    <span style="color:#AAD500">${txt_pedidosCargar[key].nombre}</span>
                </div>

                <div class="col-sm-12 text-right">
                    <span style="color:#AAD500"><b>Orden N° </b>${txt_pedidosCargar[key].orden}</span>
                </div>            

                <div class="col-sm-6 text-center">
                    <img src="https://cadenaser00.epimg.net/emisora/imagenes/2018/01/31/ser_madrid_norte/1517400077_202649_1517400143_noticia_normal.jpg" alt="" title="" width="100%"/>
                </div>
                
                <div class="col-sm-6 text-center">
                    <textarea style="border: 1px solid #AAD500; width:100%;" disabled rows="4">${txt_pedidosCargar[key].notas}</textarea>
                </div>                   
                
                <div class="col-sm-12 text-right" style="text-align:right">
                    <span>Cant. </span><span style="font-size:28px"><b>${txt_pedidosCargar[key].cant}</b></span>
                </div>             

            </div>
            </div>`;
        }
    }
    $('#modal-title2').text('Detalles del pedido');
    $('#modal-body2').html(DatosPedido)
    $('#modal-footer2').html('')
    $('#myModal2').modal('toggle')  
}

function cambiarTiempoEntrega(indicador){
    var txtTiempoEntrega = document.querySelector('#txtTiempoEntrega')
    if(indicador>=1){
        var DatoActual=txtTiempoEntrega.value
        DatoActual = parseInt(DatoActual) + parseInt(5)
    }else{
        var txtTiempoEntrega2 = document.querySelector('#txtTiempoEntrega')
        if(txtTiempoEntrega2.value >= 1){
            var DatoActual=txtTiempoEntrega2.value
            DatoActual = parseInt(DatoActual) - parseInt(5)
        }
    }
    if(DatoActual >=1){
        txtTiempoEntrega.value = DatoActual;
    }
}


//la notificacion es enviada y se notifica que el pedido fue aceptado
async function cancelarEstePedido(numeroPedido){

    const txtTiempoEntrega=document.querySelector('#txtTiempoEntrega').value
    const txt_horaActual = document.querySelector('#txt_horaActual').value
    const txt_fechaActual = document.querySelector('#txt_fechaActual').value
    const txt_precioTotal = document.querySelector('#txt_precioTotal').value

    var DatosPedido=`
    <div class="col-sm-12">
    <div class="row">

        <div class="form-group col-sm-12 text-center">
            <i class="far fa-bell fa-3x" style="color:#AAD500"></i><br>
            <span style="color:#AAD500">Orden: #${numeroPedido}<span><br>

            <div class="spinner-border text-success" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
        
    </div>
    </div>`;

    $('#modal-title').text('Aceptando el pedido...');
    $('#modal-body').html(DatosPedido)
    $('#modal-footer').html('')

    //enviams la peticion al servidor en respuesta a que responda
    await fetch('/aceptarPedido',{
        method:'POST',
        body:JSON.stringify({
            orden:numeroPedido,
            fecha:txt_fechaActual,
            hora:txt_horaActual,
            estado: 'Acepta',//Acepta, rechaza
            tiempoPreparacion:txtTiempoEntrega,
            notas:''//“si rechaza la orden”


            /* 
            orden: “string”,
            hora: “string”, //hora: 10:15
            estado:”Acepta, rechaza”,
            notas: “si rechaza la orden”,
            minute_time: “15”, //minute_time: 15
            estimated_time: “string” //estimated_time: 10:30
            */


        }),
        headers:{
            "content-Type":"application/json"
        }
    })
    .then(function(response) {
        return response.json();            
    })
    .then(async data => {
        if(data.message=='ok'){
            //elimino del areglo el numero
            var i = numerosPedidosActivos.indexOf(numeroPedido);
            numerosPedidosActivos.splice( i, 1 );

            var DatosPedido=`
            <div class="col-sm-12">
            <div class="row text-center">

                <i class="far fa-check-circle fa-3x" style="color:#AAD500"></i>

            </div>
            </div>`;

            var element = document.getElementById("div_"+numeroPedido);
            element.style.display = "none"
            $('#modal-title').text('Pedido Aceptado');
            $('#modal-body').html(DatosPedido)
            $('#modal-footer').html('')
            //pasamos los datos del pedido para pintarlos en produccion
            PedidosEnProduccion.push({
                horaRecibido:txt_horaActual,
                horaEntrega:txtTiempoEntrega,
                orden:numeroPedido,
                precio:txt_precioTotal
            })
            //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
            setTimeout(cerrarModal(), 10000);
            await caragarPedidosPreparacion();
        }else{
            var DatosPedido=`
            <div class="col-sm-12 text-center">
            <div class="row text-center">

                <i class="far fa-times-circle text-danger fa-3x"></i>
                <span class="text-center col-sm-12">
                    Ups!. No se pudo registrar el pedido, intentelo nuevamnete refrescando la pantalla <br>
                    Error: ${data.body}
                </span>

            </div>
            </div>`;
            $('#modal-title').text('Pedido rechazado');
            $('#modal-body').html(DatosPedido)
            $('#modal-footer').html('')
            //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
        }
    })
    .catch(function(error) {
     console.log(error);
    });

    return false
}



//rechazar pedido, describir el porque
async function mostrarFormRechazarPedido(numeroPedido){
    const txtTiempoEntrega=document.querySelector('#txtTiempoEntrega').value
    const txt_horaActual = document.querySelector('#txt_horaActual').value
    const txt_fechaActual = document.querySelector('#txt_fechaActual').value
    
    var DatosPedido=`
    <div class="col-sm-12">
    <div class="row">

        <div class="form-group col-sm-12 text-center">
            <i class="far fa-times-circle fa-3x text-danger"></i><br>
            <span style="color:#AAD500">Orden N°: ${numeroPedido}<span><br>
        </div>
        <form autocomplete="off">
            <div class="col-sm-12 form-group text-center">
                <label for="txt_rechazo">¿Cúentanos porque?</label>
                <textarea id="txt_rechazo" required style="border: 1px solid #AAD500; width:100%;" placeholder="¿Cúentanos porque?"rows="4"></textarea>
                <input typr="text" value="${numeroPedido}" id="txt_numeroPedidoCancelar_txt" hidden="false"/>
            </div>         
        
            <div class="col-sm-12 text-center">
                <button class="btn text-center mt-2 w-100" style="border: 1px solid red; box-shadow: 2px 2px red;" type="button" onclick="rechazarPedido()">
                    <i class="far fa-times-circle text-danger"></i>
                    Rechazar
                </button>
            </div>
        </form>
    </div>
    </div>`;

    $('#modal-title2').text('Rechazo del pedido');
    $('#modal-body2').html(DatosPedido)
    $('#modal-footer2').html('')
    $('#myModal2').modal('toggle') 

    return false
}

async function rechazarPedido(){
    const txt_rechazo = document.querySelector('#txt_rechazo').value
    if(txt_rechazo ===""){
        alert('Este campo es requerido')
        txt_rechazo.focus();
    }else{
        const txtTiempoEntrega=document.querySelector('#txtTiempoEntrega').value
        const txt_horaActual = document.querySelector('#txt_horaActual').value
        const txt_fechaActual = document.querySelector('#txt_fechaActual').value
        const numeroPedido = document.querySelector('#txt_numeroPedidoCancelar_txt').value
    
        //enviams la peticion al servidor rechazando el pedido
        await fetch('/aceptarPedido',{
            method:'POST',
            body:JSON.stringify({
                orden:numeroPedido,
                fecha:txt_fechaActual,
                hora:txt_horaActual,
                estado: 'rechaza',//Acepta, rechaza
                minute_time:txtTiempoEntrega,
                notas:txt_rechazo//“si rechaza la orden”            
            }),
            headers:{
                "content-Type":"application/json"
            }
        })
        .then(function(response) {
            return response.json();            
        })
        .then(data => {
            if(data.message=='ok'){
                var DatosPedido=`
                <div class="col-sm-12">
                <div class="row text-center">

                    <i class="far fa-check-circle fa-3x" style="color:#AAD500"></i>

                </div>
                </div>`;


                $('#modal-title2').text('Pedido Cancelado');
                $('#modal-body2').html(DatosPedido)
                $('#modal-footer2').html('')

                var element = document.getElementById("div_"+numeroPedido);
                element.style.display = "none"

                //elimino del areglo el numero
                var i = numerosPedidosActivos.indexOf(numeroPedido);
                numerosPedidosActivos.splice( i, 1 );
                //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
                setTimeout(cerrarModal2(), 20000);
                setTimeout(cerrarModal(), 20000);

            }else{
                var DatosPedido=`
                <div class="col-sm-12 text-center">
                <div class="row text-center">

                    <i class="far fa-times-circle text-danger fa-3x"></i>
                    <span class="text-center col-sm-12">Ups!. No se pudo registrar la cancelación</span>

                </div>
                </div>`;
                $('#modal-title2').text('Solicitud rechazar pedido');
                $('#modal-body2').html(DatosPedido)
                $('#modal-footer2').html('')
                //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }
}




function cerrarModal(){
    $('#myModal').modal('toggle')
}

function cerrarModal2(){
    $('#myModal2').modal('toggle')
}

//confirmar de entrega de pedido al repartidor
function confirmarEntregaPedido(n){
    var DatosPedido=`
    <div class="col-sm-12">
    <div class="row text-center">

        <div class="col-sm-12">
            <img src="/img/delivery.png" alt="Confirmar entrega de pedido" title="Confirmar entrega de pedido" width="150px"/><br>
            <span class="col-sm-12 h3 text-center">
            Por favor confirmar:<br> ¿Entregaste el pedido el domiciliario?
            </span>
        </div>

        <div class="form-group col-sm-6 col-6 col-xs-6">
            <button class="btn text-center mt-2 w-100" onclick="cerrarModal2()" style="border: 1px solid red; box-shadow: 2px 2px red;" type="button" >
                <i class="far fa-times-circle text-danger"></i>
                Cacelar
            </button>
        </div>
        <div class="form-group col-sm-6 col-6 col-xs-6">
            <button class="btn text-center mt-2 w-100" style="border: 1px solid ; box-shadow: 2px 2px #AAD500;" type="button" onclick="pedidoEntregadoRepartidor(${n})">
                <i class="far fa-check-circle" style="color:#AAD500;"></i>
                Si, Orden entregada!!
            </button>
        </div>  

    </div>
    </div>`;


    $('#modal-title2').text('Entregar el pedido al repartidor');
    $('#modal-body2').html(DatosPedido)
    $('#modal-footer2').html('')
    $('#myModal2').modal('toggle')
}

async function pedidoEntregadoRepartidor(n){

    //cargamos los datos al arreglo
    //notificamos al servidor que el pedido fue entregado al repartidor

    const f = new Date()
    const horaActual =  f.getHours() +':'+ f.getMinutes()
    const orden=        document.querySelector('#txt_ordenRecicibo_'+n).value
    const precio=       document.querySelector('#txt_precioRecicibo_'+n).value

    await fetch('/aceptarPedido',{
        method:'POST',
        body:JSON.stringify({
            orden:orden,
            hora:horaActual,
            estado: 'Entregado',//Acepta, rechaza, Entregado
        }),
        headers:{
            "content-Type":"application/json"
        }
    })
    .then(function(response) {
        return response.json();            
    })
    .then(async data => {
        if(data.message=='ok'){

            var DatosPedido=`
            <div class="col-sm-12">
            <div class="row text-center">

                <i class="far fa-check-circle fa-3x" style="color:#AAD500"></i>

            </div>
            </div>`;

            $('#modal-title2').text('Pedido entregado');
            $('#modal-body2').html(DatosPedido)
            $('#modal-footer2').html('')

            //pasamos los datos de la orden terminada
            const f = new Date();
            pedidosEntregados.push({
                hentrega:   horaActual,
                orden:      orden,
                precio:     precio,
            });
            //llamamos la funcion de cargar los datos en entregados
            //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
            setTimeout(cerrarModal2(), 10000);
            await cargarPedidosEntregados();
            await eliminarPedidoPreparacion(orden)
        }else{
            var DatosPedido=`
            <div class="col-sm-12 text-center">
            <div class="row text-center">

                <i class="far fa-times-circle text-danger fa-3x"></i>
                <span class="text-center col-sm-12">
                    Ups!. No se pudo registrar la entrega del pedido, por favor intentelo nuevamente <br>
                </span>

            </div>
            </div>`;
            $('#modal-title2').text('Pedido rechazado');
            $('#modal-body2').html(DatosPedido)
            $('#modal-footer2').html('')
            //programar el cierre de la ventana modal despues de 3 milisegundos de mostrar aceptado 
        }
    })
    .catch(function(error) {
     console.log(error);
    });
}